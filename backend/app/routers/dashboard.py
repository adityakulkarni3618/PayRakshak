from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from ..db import get_db
from ..deps import get_current_user
from ..enums import Status
from ..models import Dispute, Transaction, Notification, User
from ..services.serializers import txn_out

router = APIRouter(prefix="/api/v1", tags=["dashboard"])


@router.get("/dashboard")
def dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    def cnt(*w):
        return db.scalar(select(func.count()).select_from(Dispute).where(Dispute.owner_id == user.id, *w)) or 0
    recent = db.scalars(select(Dispute).where(Dispute.owner_id == user.id).order_by(Dispute.updated_at.desc()).limit(5)).all()
    txns = db.scalars(select(Transaction).where(Transaction.owner_id == user.id).order_by(Transaction.occurred_at.desc()).limit(5)).all()
    return {"total_transactions": db.scalar(select(func.count()).select_from(Transaction).where(Transaction.owner_id == user.id)) or 0,
            "active_disputes": cnt(Dispute.status.in_(Status.ACTIVE)), "awaiting_information": cnt(Dispute.status == "AWAITING_INFORMATION"),
            "awaiting_review": cnt(Dispute.status.in_(("UNDER_REVIEW", "ESCALATED"))),
            "recent_cases": [{"case_id": d.case_id, "status": d.status, "category": d.effective_category, "updated_at": d.updated_at} for d in recent],
            "recent_transactions": [txn_out(t) for t in txns]}


@router.get("/notifications")
def notifications(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.scalars(select(Notification).where(Notification.user_id == user.id).order_by(Notification.id.desc()).limit(30)).all()
    return [{"id": n.id, "message": n.message, "read": n.read, "created_at": n.created_at} for n in rows]


@router.post("/notifications/read-all")
def read_all(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    for n in db.scalars(select(Notification).where(Notification.user_id == user.id, Notification.read.is_(False))).all():
        n.read = True
    db.commit()
    return {"ok": True}
