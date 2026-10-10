from sqlalchemy import select
from ..models import (Transaction, AIAnalysis, ValidationFinding, Recommendation, EvidenceFile, CaseComment, User)


def txn_out(t: Transaction, open_disputes: int = 0):
    return {"id": t.id, "external_ref": t.external_ref, "occurred_at": t.occurred_at, "amount": str(t.amount), "currency": t.currency,
            "direction": t.direction, "status": t.status, "reversal_status": t.reversal_status, "counterparty": t.counterparty,
            "merchant_ref": t.merchant_ref, "data_source": t.data_source, "open_disputes": open_disputes}


def dispute_out(db, d, staff=False):
    txn = db.get(Transaction, d.transaction_id)
    a = db.scalar(select(AIAnalysis).where(AIAnalysis.dispute_id == d.id).order_by(AIAnalysis.id.desc()))
    findings, rec = [], None
    if a:
        findings = db.scalars(select(ValidationFinding).where(ValidationFinding.analysis_id == a.id)).all()
        rec = db.scalar(select(Recommendation).where(Recommendation.analysis_id == a.id))
    ev = db.scalars(select(EvidenceFile).where(EvidenceFile.dispute_id == d.id).order_by(EvidenceFile.created_at)).all()
    q = select(CaseComment).where(CaseComment.dispute_id == d.id).order_by(CaseComment.id)
    comments = [c for c in db.scalars(q).all() if staff or c.visible_to_customer]
    out = {
        "case_id": d.case_id, "status": d.status, "description": d.description, "selected_category": d.selected_category,
        "predicted_category": d.predicted_category, "effective_category": d.effective_category,
        "claimed_amount": str(d.claimed_amount) if d.claimed_amount is not None else None, "order_reference": d.order_reference,
        "assigned_to": d.assigned_to, "resolution_summary": d.resolution_summary,
        "created_at": d.created_at, "updated_at": d.updated_at, "resolved_at": d.resolved_at,
        "transaction": txn_out(txn) if txn else None,
        "analysis": None if not a else {"model_version": a.model_version, "ai_available": a.ai_available, "confidence": a.confidence,
                                         "reason_codes": a.reason_codes, "explanation": a.explanation, "created_at": a.created_at},
        "findings": [{"rule_id": f.rule_id, "severity": f.severity, "kind": f.kind, "explanation": f.explanation,
                      "fields": f.fields, "source_ids": f.source_ids, "next_step": f.next_step} for f in findings],
        "recommendation": None if not rec else {"action": rec.action, "explanation": rec.explanation, "missing_information": rec.missing_information,
                                                 "review_reasons": rec.review_reasons if staff else [], "requires_human_review": rec.requires_human_review,
                                                 "low_risk_eligible": rec.low_risk_eligible, "execution_mode": rec.execution_mode, "rule_version": rec.rule_version},
        "evidence": [{"id": e.id, "name": e.original_name, "content_type": e.content_type, "size": e.size,
                      "review_outcome": e.review_outcome, "review_note": e.review_note if staff else None, "created_at": e.created_at} for e in ev],
        "comments": [{"id": c.id, "kind": c.kind, "body": c.body, "visible_to_customer": c.visible_to_customer, "created_at": c.created_at} for c in comments],
    }
    if staff:
        owner = db.get(User, d.owner_id)
        out["customer"] = {"email": owner.email, "name": owner.full_name} if owner else None
    return out
