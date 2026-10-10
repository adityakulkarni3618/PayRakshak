from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, or_
from sqlalchemy.orm import Session
from ..db import get_db
from ..deps import staff_only
from ..enums import Role
from ..models import Dispute, CaseComment, EvidenceFile, User
from ..schemas import AssignIn, InfoIn, ReviewIn, NoteIn, EvidenceReviewIn
from ..services import cases
from ..services.audit import log_event, notify
from ..services.serializers import dispute_out
from .disputes import get_case

router = APIRouter(prefix="/api/v1/support", tags=["support"])


@router.get("/cases")
def queue(status: str | None = None, category: str | None = None, q: str | None = None, mine: bool = False,
          page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100),
          user: User = Depends(staff_only), db: Session = Depends(get_db)):
    f = []
    if user.role == Role.SUPPORT_AGENT:
        f.append(or_(Dispute.assigned_to.is_(None), Dispute.assigned_to == user.id))
    if mine: f.append(Dispute.assigned_to == user.id)
    if status: f.append(Dispute.status == status)
    if category: f.append(Dispute.effective_category == category)
    if q: f.append(Dispute.case_id.ilike(f"%{q.strip()}%"))
    total = db.scalar(select(func.count()).select_from(Dispute).where(*f)) or 0
    rows = db.scalars(select(Dispute).where(*f).order_by(Dispute.updated_at.desc()).offset((page - 1) * page_size).limit(page_size)).all()
    return {"total": total, "page": page, "page_size": page_size,
            "items": [{"case_id": d.case_id, "status": d.status, "category": d.effective_category, "assigned_to": d.assigned_to,
                       "created_at": d.created_at, "updated_at": d.updated_at} for d in rows]}


@router.get("/cases/{case_id}")
def case_detail(case_id: str, user: User = Depends(staff_only), db: Session = Depends(get_db)):
    return dispute_out(db, get_case(db, user, case_id), staff=True)


@router.post("/cases/{case_id}/assign")
def assign(case_id: str, body: AssignIn, user: User = Depends(staff_only), db: Session = Depends(get_db)):
    d = get_case(db, user, case_id)
    target = user.id
    if body.agent_id and body.agent_id != user.id:
        if user.role != Role.ADMIN:
            raise HTTPException(403, "Only admins can assign cases to other agents")
        a = db.get(User, body.agent_id)
        if not a or a.role not in (Role.SUPPORT_AGENT, Role.ADMIN):
            raise HTTPException(400, "Assignee must be a support agent")
        target = a.id
    d.assigned_to = target
    log_event(db, user, "CASE_ASSIGNED", "dispute", d.case_id, d.id, {"assignee": target})
    if d.status in ("SUBMITTED", "AI_ANALYSIS", "REOPENED") or d.status == "ACTION_RECOMMENDED":
        pass
    db.commit()
    return dispute_out(db, d, staff=True)


@router.post("/cases/{case_id}/request-information")
def request_info(case_id: str, body: InfoIn, user: User = Depends(staff_only), db: Session = Depends(get_db)):
    d = get_case(db, user, case_id)
    db.add(CaseComment(dispute_id=d.id, author_id=user.id, kind="INFO_REQUEST", visible_to_customer=True, body=body.message.strip()))
    cases.transition(db, d, "AWAITING_INFORMATION", user, "Information requested")
    notify(db, d.owner_id, d, f"More information needed on {d.case_id}")
    db.commit()
    return dispute_out(db, d, staff=True)


@router.post("/cases/{case_id}/note")
def note(case_id: str, body: NoteIn, user: User = Depends(staff_only), db: Session = Depends(get_db)):
    d = get_case(db, user, case_id)
    db.add(CaseComment(dispute_id=d.id, author_id=user.id, kind="NOTE", visible_to_customer=False, body=body.body.strip()))
    log_event(db, user, "NOTE_ADDED", "dispute", d.case_id, d.id)
    db.commit()
    return dispute_out(db, d, staff=True)


@router.post("/cases/{case_id}/review")
def review(case_id: str, body: ReviewIn, user: User = Depends(staff_only), db: Session = Depends(get_db)):
    d = get_case(db, user, case_id)
    to = {"APPROVE_RECOMMENDATION": "ACTION_RECOMMENDED", "REJECT": "REJECTED", "RESOLVE": "RESOLVED"}[body.decision]
    if d.assigned_to is None:
        d.assigned_to = user.id
    cases.transition(db, d, to, user, body.note)
    if to in ("RESOLVED", "REJECTED"):
        d.resolution_summary = body.note.strip()
    db.add(CaseComment(dispute_id=d.id, author_id=user.id, kind="NOTE", visible_to_customer=False, body=f"[{body.decision}] {body.note.strip()}"))
    notify(db, d.owner_id, d, f"Case {d.case_id} is now {to.replace('_', ' ').title()}")
    db.commit()
    return dispute_out(db, d, staff=True)


@router.post("/cases/{case_id}/escalate")
def escalate(case_id: str, body: NoteIn, user: User = Depends(staff_only), db: Session = Depends(get_db)):
    d = get_case(db, user, case_id)
    cases.transition(db, d, "ESCALATED", user, body.body)
    notify(db, d.owner_id, d, f"Case {d.case_id} was escalated for senior review")
    db.commit()
    return dispute_out(db, d, staff=True)


@router.post("/cases/{case_id}/evidence/{evidence_id}/review")
def review_evidence(case_id: str, evidence_id: str, body: EvidenceReviewIn, user: User = Depends(staff_only), db: Session = Depends(get_db)):
    d = get_case(db, user, case_id)
    ev = db.get(EvidenceFile, evidence_id)
    if not ev or ev.dispute_id != d.id:
        raise HTTPException(404, "Evidence not found")
    ev.review_outcome, ev.review_note, ev.reviewed_by = body.outcome, body.note, user.id
    log_event(db, user, "EVIDENCE_REVIEWED", "evidence", ev.id, d.id, {"outcome": body.outcome})
    db.commit()
    return dispute_out(db, d, staff=True)
