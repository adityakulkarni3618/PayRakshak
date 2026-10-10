import csv, hashlib, io, re
from datetime import datetime, timezone
from decimal import Decimal, InvalidOperation
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from fastapi.responses import PlainTextResponse
from sqlalchemy import select, func, asc, desc
from sqlalchemy.orm import Session
from ..config import settings
from ..db import get_db
from ..deps import get_current_user
from ..enums import TXN_STATUSES, REVERSAL, Status
from ..models import Transaction, ImportBatch, Dispute, User
from ..services.audit import log_event
from ..services.serializers import txn_out

router = APIRouter(prefix="/api/v1/transactions", tags=["transactions"])
REQUIRED = ["external_ref", "occurred_at", "amount", "direction", "status", "counterparty"]
OPTIONAL = ["merchant_ref", "reversal_status"]
REF = re.compile(r"^[A-Za-z0-9_-]{4,40}$")
TEMPLATE = ",".join(REQUIRED + OPTIONAL) + "\nSAMPLE0001,2026-01-15T10:30:00+05:30,499.00,SENT,SUCCESS,Sample Merchant,ORD-1,UNKNOWN\n"


def parse_csv(content: bytes):
    if len(content) > 1_000_000:
        raise HTTPException(413, "CSV is larger than 1 MB")
    try:
        text = content.decode("utf-8-sig")
    except UnicodeDecodeError:
        raise HTTPException(400, "CSV must be UTF-8 encoded")
    reader = csv.DictReader(io.StringIO(text))
    missing = [c for c in REQUIRED if c not in (reader.fieldnames or [])]
    if missing:
        raise HTTPException(400, f"Missing required column(s): {', '.join(missing)}")
    rows, errors = [], []
    for n, r in enumerate(reader, start=2):
        if n - 1 > settings.max_import_rows:
            raise HTTPException(413, f"Too many rows (max {settings.max_import_rows})")
        errs = []
        ref = (r.get("external_ref") or "").strip() or None
        if ref and not REF.match(ref):
            errs.append("external_ref must be 4-40 letters, digits, - or _")
        try:
            ts = datetime.fromisoformat((r.get("occurred_at") or "").strip().replace("Z", "+00:00"))
            ts = ts if ts.tzinfo else ts.replace(tzinfo=timezone.utc)
        except ValueError:
            ts = None
            errs.append("occurred_at must be ISO-8601, e.g. 2026-01-15T10:30:00+05:30")
        try:
            amt = Decimal((r.get("amount") or "").strip())
            if amt <= 0 or amt > 10_000_000 or amt.as_tuple().exponent < -2:
                raise InvalidOperation
        except InvalidOperation:
            amt = None
            errs.append("amount must be a positive number with at most 2 decimals")
        direction = (r.get("direction") or "").strip().upper()
        status = (r.get("status") or "").strip().upper()
        reversal = (r.get("reversal_status") or "UNKNOWN").strip().upper() or "UNKNOWN"
        cp = (r.get("counterparty") or "").strip()
        if direction not in ("SENT", "RECEIVED"):
            errs.append("direction must be SENT or RECEIVED")
        if status not in TXN_STATUSES:
            errs.append(f"status must be one of {', '.join(TXN_STATUSES)}")
        if reversal not in REVERSAL:
            errs.append(f"reversal_status must be one of {', '.join(REVERSAL)}")
        if not cp or len(cp) > 120:
            errs.append("counterparty is required (max 120 chars)")
        if errs:
            errors.append({"row": n, "errors": errs})
        else:
            rows.append({"external_ref": ref, "occurred_at": ts, "amount": amt.quantize(Decimal("0.01")), "direction": direction,
                         "status": status, "reversal_status": reversal, "counterparty": cp,
                         "merchant_ref": (r.get("merchant_ref") or "").strip()[:64] or None})
    return rows, errors


def row_hash(owner_id, r):
    key = f"{owner_id}|{r['external_ref']}|{r['occurred_at'].astimezone(timezone.utc).isoformat()}|{r['amount']}|{r['direction']}|{r['counterparty']}"
    return hashlib.sha256(key.encode()).hexdigest()


@router.get("/import/template", response_class=PlainTextResponse)
def template():
    return PlainTextResponse(TEMPLATE, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=transactions_template.csv"})


@router.post("/import/preview")
async def preview(file: UploadFile = File(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows, errors = parse_csv(await file.read())
    dup = sum(1 for r in rows if db.scalar(select(Transaction.id).where(Transaction.owner_id == user.id, Transaction.row_hash == row_hash(user.id, r))))
    return {"valid_rows": len(rows), "invalid_rows": len(errors), "already_imported": dup, "errors": errors[:50],
            "sample": [{**r, "amount": str(r["amount"])} for r in rows[:10]]}


@router.post("/import", status_code=201)
async def do_import(file: UploadFile = File(...), user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows, errors = parse_csv(await file.read())
    batch = ImportBatch(owner_id=user.id, filename=(file.filename or "upload.csv")[:255], total_rows=len(rows) + len(errors), invalid=len(errors))
    db.add(batch)
    db.flush()
    imported = dups = 0
    seen = set()
    for r in rows:
        h = row_hash(user.id, r)
        if h in seen or db.scalar(select(Transaction.id).where(Transaction.owner_id == user.id, Transaction.row_hash == h)):
            dups += 1
            continue
        seen.add(h)
        db.add(Transaction(owner_id=user.id, data_source="USER_IMPORTED", import_batch_id=batch.id, row_hash=h, **r))
        imported += 1
    batch.imported, batch.duplicates = imported, dups
    log_event(db, user, "TRANSACTIONS_IMPORTED", "import", batch.id, detail={"imported": imported, "duplicates": dups, "invalid": len(errors)})
    db.commit()
    return {"batch_id": batch.id, "imported": imported, "duplicates_skipped": dups, "invalid_rows": len(errors), "errors": errors[:50],
            "note": "Imported records are labelled USER_IMPORTED. Importing does not verify that a payment is authentic."}


@router.get("")
def list_transactions(q: str | None = None, status: str | None = None, direction: str | None = None,
                      date_from: datetime | None = None, date_to: datetime | None = None,
                      min_amount: Decimal | None = None, max_amount: Decimal | None = None,
                      sort: str = Query("occurred_at", pattern="^(occurred_at|amount)$"), order: str = Query("desc", pattern="^(asc|desc)$"),
                      page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100),
                      user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    f = [Transaction.owner_id == user.id]
    if q:
        like = f"%{q.strip()}%"
        f.append((Transaction.external_ref.ilike(like)) | (Transaction.counterparty.ilike(like)))
    if status: f.append(Transaction.status == status.upper())
    if direction: f.append(Transaction.direction == direction.upper())
    if date_from: f.append(Transaction.occurred_at >= date_from)
    if date_to: f.append(Transaction.occurred_at <= date_to)
    if min_amount is not None: f.append(Transaction.amount >= min_amount)
    if max_amount is not None: f.append(Transaction.amount <= max_amount)
    total = db.scalar(select(func.count()).select_from(Transaction).where(*f)) or 0
    col = getattr(Transaction, sort)
    items = db.scalars(select(Transaction).where(*f).order_by((asc if order == "asc" else desc)(col)).offset((page - 1) * page_size).limit(page_size)).all()
    counts = dict(db.execute(select(Dispute.transaction_id, func.count()).where(Dispute.transaction_id.in_([t.id for t in items]),
                  Dispute.status.in_(Status.ACTIVE)).group_by(Dispute.transaction_id)).all()) if items else {}
    return {"items": [txn_out(t, counts.get(t.id, 0)) for t in items], "total": total, "page": page, "page_size": page_size}


@router.get("/{transaction_id}")
def get_transaction(transaction_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    t = db.get(Transaction, transaction_id)
    if not t or t.owner_id != user.id:
        raise HTTPException(404, "Transaction not found")
    ds = db.scalars(select(Dispute).where(Dispute.transaction_id == t.id).order_by(Dispute.id.desc())).all()
    return {**txn_out(t, sum(1 for d in ds if d.status in Status.ACTIVE)),
            "disputes": [{"case_id": d.case_id, "status": d.status, "created_at": d.created_at} for d in ds]}
