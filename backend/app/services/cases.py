from datetime import datetime, timezone
from fastapi import HTTPException
from sqlalchemy import select
from ..enums import Status
from ..models import Dispute, Transaction, utcnow
from .analysis import run_analysis, next_status
from .audit import log_event, notify

ALLOWED = {
    "SUBMITTED": {"VALIDATING", "WITHDRAWN"},
    "VALIDATING": {"AI_ANALYSIS"},
    "AI_ANALYSIS": {"AWAITING_INFORMATION", "UNDER_REVIEW", "ACTION_RECOMMENDED", "ESCALATED"},
    "AWAITING_INFORMATION": {"UNDER_REVIEW", "WITHDRAWN", "REJECTED"},
    "UNDER_REVIEW": {"AWAITING_INFORMATION", "ACTION_RECOMMENDED", "ESCALATED", "REJECTED", "WITHDRAWN"},
    "ACTION_RECOMMENDED": {"RESOLVED", "UNDER_REVIEW", "ESCALATED", "REJECTED", "WITHDRAWN"},
    "ESCALATED": {"UNDER_REVIEW", "ACTION_RECOMMENDED", "REJECTED"},
    "RESOLVED": {"REOPENED"},
    "REJECTED": {"REOPENED"},
    "WITHDRAWN": set(),
    "REOPENED": {"UNDER_REVIEW", "AWAITING_INFORMATION", "ESCALATED"},
}


def transition(db, d: Dispute, to: str, actor, note: str | None = None):
    if to not in ALLOWED.get(d.status, set()):
        raise HTTPException(409, f"Cannot move a case from {d.status} to {to}")
    frm, d.status = d.status, to
    d.updated_at = utcnow()
    if to in ("RESOLVED", "REJECTED", "WITHDRAWN"):
        d.resolved_at = utcnow()
    if to == "REOPENED":
        d.resolved_at = None
    log_event(db, actor, "STATUS_CHANGED", "dispute", d.case_id, d.id, {"from": frm, "to": to, "note": note})


def create_dispute(db, user, payload, idem_key=None):
    if idem_key:
        existing = db.scalar(select(Dispute).where(Dispute.owner_id == user.id, Dispute.idempotency_key == idem_key))
        if existing:
            return existing, False
    txn = db.get(Transaction, payload.transaction_id)
    if not txn or txn.owner_id != user.id:  # never associate a complaint with someone else's transaction
        raise HTTPException(404, "Transaction not found")
    d = Dispute(case_id=f"TMP-{datetime.now().timestamp()}", owner_id=user.id, transaction_id=txn.id,
                description=payload.description.strip(), selected_category=payload.selected_category,
                claimed_amount=payload.claimed_amount, order_reference=(payload.order_reference or None),
                idempotency_key=idem_key, status=Status.SUBMITTED)
    db.add(d)
    db.flush()
    d.case_id = f"UPIR-{datetime.now(timezone.utc).year}-{d.id:06d}"
    log_event(db, user, "DISPUTE_CREATED", "dispute", d.case_id, d.id, {"transaction_id": txn.id, "selected_category": d.selected_category})
    transition(db, d, "VALIDATING", None)
    a, rec, _ = run_analysis(db, d, txn)
    transition(db, d, "AI_ANALYSIS", None)
    log_event(db, None, "AI_ANALYSIS_COMPLETED", "dispute", d.case_id, d.id,
              {"model_version": a.model_version, "ai_available": a.ai_available, "predicted_category": a.predicted_category,
               "confidence": a.confidence, "action": rec["recommended_action"], "rule_version": rec["rule_version"]})
    to = next_status(d, rec, a.ai_available)
    transition(db, d, to, None, "Initial triage")
    notify(db, user.id, d, f"Case {d.case_id} created. Status: {to.replace('_', ' ').title()}")
    db.commit()
    return d, True
