import uuid
from fastapi import APIRouter, Depends, HTTPException, Header, UploadFile, File, Query
from fastapi.responses import FileResponse
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from ..config import settings
from ..db import get_db
from ..deps import get_current_user
from ..enums import Role
from ..models import Dispute, EvidenceFile, CaseComment, AuditEvent, User
from ..schemas import DisputeIn, InfoIn
from ..services import cases
from ..services.audit import log_event, notify
from ..services.serializers import dispute_out

router = APIRouter(prefix="/api/v1/disputes", tags=["disputes"])
MAGIC = {"png": (b"\x89PNG\r\n\x1a\n", "image/png"), "jpg": (b"\xff\xd8\xff", "image/jpeg"), "jpeg": (b"\xff\xd8\xff", "image/jpeg"), "pdf": (b"%PDF-", "application/pdf")}


def get_case(db, user, case_id) -> Dispute:
    d = db.scalar(select(Dispute).where(Dispute.case_id == case_id))
    if not d:
        raise HTTPException(404, "Case not found")
    if user.role == Role.CUSTOMER and d.owner_id != user.id:
        raise HTTPException(403, "You do not have access to this case")
    if user.role == Role.SUPPORT_AGENT and d.assigned_to not in (None, user.id):
        raise HTTPException(403, "This case is assigned to another agent")
    return d


@router.post("", status_code=201)
def create(body: DisputeIn, idempotency_key: str | None = Header(default=None, max_length=64),
           user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if user.role != Role.CUSTOMER:
        raise HTTPException(403, "Only customers can submit disputes")
    d, _ = cases.create_dispute(db, user, body, idempotency_key)
    return dispute_out(db, d)


@router.get("")
def list_mine(status: str | None = None, page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100),
              user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    f = [Dispute.owner_id == user.id] + ([Dispute.status == status] if status else [])
    total = db.scalar(select(func.count()).select_from(Dispute).where(*f)) or 0
    rows = db.scalars(select(Dispute).where(*f).order_by(Dispute.updated_at.desc()).offset((page - 1) * page_size).limit(page_size)).all()
    return {"total": total, "page": page, "page_size": page_size,
            "items": [{"case_id": d.case_id, "status": d.status, "category": d.effective_category, "created_at": d.created_at, "updated_at": d.updated_at} for d in rows]}


@router.get("/{case_id}")
def detail(case_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    d = get_case(db, user, case_id)
    return dispute_out(db, d, staff=user.role != Role.CUSTOMER)


@router.get("/{case_id}/timeline")
def timeline(case_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    d = get_case(db, user, case_id)
    staff = user.role != Role.CUSTOMER
    ev = db.scalars(select(AuditEvent).where(AuditEvent.dispute_id == d.id).order_by(AuditEvent.id)).all()
    hidden = {"NOTE_ADDED", "EVIDENCE_REVIEWED"}
    return [{"action": e.action, "actor_role": e.actor_role, "detail": e.detail if staff else {k: v for k, v in (e.detail or {}).items() if k in ("from", "to")},
             "created_at": e.created_at} for e in ev if staff or e.action not in hidden]


@router.post("/{case_id}/evidence", status_code=201)
async def upload(case_id: str, file: UploadFile = File(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    d = get_case(db, user, case_id)
    if d.status in ("WITHDRAWN",):
        raise HTTPException(409, "This case is closed to new evidence")
    ext = (file.filename or "").rsplit(".", 1)[-1].lower()
    if ext not in MAGIC:
        raise HTTPException(400, "Only PNG, JPG and PDF files are accepted")
    data = await file.read(settings.max_upload_bytes + 1)
    if len(data) > settings.max_upload_bytes:
        raise HTTPException(413, "File is larger than 5 MB")
    magic, ctype = MAGIC[ext]
    if not data.startswith(magic):
        raise HTTPException(400, "File content does not match its extension")
    if db.scalar(select(func.count()).select_from(EvidenceFile).where(EvidenceFile.dispute_id == d.id)) >= 10:
        raise HTTPException(409, "Maximum of 10 evidence files per case")
    stored = f"{uuid.uuid4().hex}.{ext}"
    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    (settings.upload_dir / stored).write_bytes(data)
    ev = EvidenceFile(dispute_id=d.id, uploader_id=user.id, original_name=(file.filename or "file")[-120:], stored_name=stored, content_type=ctype, size=len(data))
    db.add(ev)
    db.flush()
    log_event(db, user, "EVIDENCE_UPLOADED", "evidence", ev.id, d.id, {"content_type": ctype, "size": len(data)})
    db.commit()
    return {"id": ev.id, "name": ev.original_name, "size": ev.size}


@router.get("/{case_id}/evidence/{evidence_id}")
def download(case_id: str, evidence_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    d = get_case(db, user, case_id)
    ev = db.get(EvidenceFile, evidence_id)
    if not ev or ev.dispute_id != d.id:
        raise HTTPException(404, "Evidence not found")
    path = (settings.upload_dir / ev.stored_name).resolve()
    if settings.upload_dir.resolve() not in path.parents or not path.exists():  # path-traversal guard
        raise HTTPException(404, "Evidence not found")
    return FileResponse(path, media_type=ev.content_type, filename=ev.original_name, headers={"X-Content-Type-Options": "nosniff", "Content-Disposition": f'attachment; filename="{ev.stored_name}"'})


@router.post("/{case_id}/additional-information")
def add_info(case_id: str, body: InfoIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    d = get_case(db, user, case_id)
    if user.role != Role.CUSTOMER:
        raise HTTPException(403, "Customers only")
    if d.status == "WITHDRAWN":
        raise HTTPException(409, "This case was withdrawn")
    db.add(CaseComment(dispute_id=d.id, author_id=user.id, kind="CUSTOMER_REPLY", visible_to_customer=True, body=body.message.strip()))
    log_event(db, user, "CUSTOMER_REPLIED", "dispute", d.case_id, d.id)
    if d.status == "AWAITING_INFORMATION":
        cases.transition(db, d, "UNDER_REVIEW", user, "Customer provided information")
    elif d.status in ("RESOLVED", "REJECTED"):
        cases.transition(db, d, "REOPENED", user, "Customer provided new information")
    notify(db, d.assigned_to, d, f"Customer replied on {d.case_id}")
    db.commit()
    return dispute_out(db, d)


@router.post("/{case_id}/withdraw")
def withdraw(case_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    d = get_case(db, user, case_id)
    if user.role != Role.CUSTOMER:
        raise HTTPException(403, "Customers only")
    cases.transition(db, d, "WITHDRAWN", user, "Withdrawn by customer")
    db.commit()
    return dispute_out(db, d)


# ---------------------------------------------------------------------------
# Public (unauthenticated) endpoint – returns ONLY non-sensitive status info.
# Rule §4: role from DB, not client.  No PII, no complaint text exposed.
# ---------------------------------------------------------------------------
_public_router = APIRouter(prefix="/api/v1/cases", tags=["cases-public"])


@_public_router.get("/track/{case_id}")
def track_public(case_id: str, db: Session = Depends(get_db)):
    """Return minimal public status information for a dispute without requiring login."""
    from sqlalchemy import select as _select
    from ..models import Transaction as _Txn
    d = db.scalar(_select(Dispute).where(Dispute.case_id == case_id))
    if not d:
        raise HTTPException(404, "Case not found")
    txn = db.scalar(_select(_Txn).where(_Txn.id == d.transaction_id))
    return {
        "case_id": d.case_id,
        "status": d.status,
        "category": d.effective_category or "UNKNOWN",
        "created_at": d.created_at,
        "last_updated": d.updated_at,
        "amount": float(txn.amount) if txn else None,
        "currency": txn.currency if txn else "INR",
        # Summary is advisory text only — no raw complaint text (Rule §6)
        "summary": f"Your dispute is currently {d.status.replace('_', ' ').lower()}.",
    }
