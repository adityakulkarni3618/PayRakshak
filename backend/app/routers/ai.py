from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select, func
from sqlalchemy.orm import Session
from ..db import get_db
from ..deps import get_current_user
from ..ml.classifier import classifier
from ..models import Transaction, Dispute, User
from ..schemas import ClassifyIn, AnalyzeTxnIn
from ..services.consistency import run_checks
from ..services import ratelimit

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])


@router.post("/classify")
def classify(body: ClassifyIn, user: User = Depends(get_current_user)):
    ratelimit.check(f"cls:{user.id}", 30, 60)
    r = classifier.predict(body.text)
    if r is None:
        raise HTTPException(503, "AI classification is currently unavailable")
    return r


@router.post("/analyze-transaction")
def analyze(body: AnalyzeTxnIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    t = db.get(Transaction, body.transaction_id)
    if not t or t.owner_id != user.id:
        raise HTTPException(404, "Transaction not found")
    txns = db.scalars(select(Transaction).where(Transaction.owner_id == user.id)).all()
    n = db.scalar(select(func.count()).select_from(Dispute).where(Dispute.transaction_id == t.id)) or 0
    return {"findings": run_checks(t, txns, n, body.category)}


@router.get("/model-status")
def model_status(user: User = Depends(get_current_user)):
    return classifier.status()
