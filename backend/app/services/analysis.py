from sqlalchemy import select, func
from ..enums import Cat
from ..ml.classifier import classifier
from ..models import AIAnalysis, ValidationFinding, Recommendation, Transaction, Dispute, EvidenceFile
from .consistency import run_checks, history_note
from .resolution import recommend
from .explain import build_explanation


def run_analysis(db, d: Dispute, txn: Transaction):
    pred = classifier.predict(d.description)  # None => AI unavailable
    predicted = pred["predicted_category"] if pred else None
    if d.selected_category:
        effective = d.selected_category
    elif predicted and predicted != Cat.CLARIFY:
        effective = predicted
    else:
        effective = None
    d.predicted_category, d.effective_category = predicted, effective

    extra = []
    if pred is None:
        extra.append("AI_UNAVAILABLE")
    elif d.selected_category and predicted not in (None, Cat.CLARIFY, d.selected_category):
        extra.append("CATEGORY_MISMATCH")
    elif pred["requires_human_review"] and not d.selected_category:
        extra.append("LOW_MODEL_CONFIDENCE")
    if pred is not None and effective is None:
        extra = [e for e in extra if e != "LOW_MODEL_CONFIDENCE"]  # handled by REQUEST_MORE_INFORMATION

    owner_txns = db.scalars(select(Transaction).where(Transaction.owner_id == d.owner_id)).all()
    other_disputes = db.scalar(select(func.count()).select_from(Dispute).where(Dispute.transaction_id == txn.id, Dispute.id != d.id)) or 0
    ev = db.scalar(select(func.count()).select_from(EvidenceFile).where(EvidenceFile.dispute_id == d.id)) or 0
    findings = run_checks(txn, owner_txns, other_disputes, effective, d.claimed_amount, d.order_reference, ev)
    rec = recommend(effective, txn, findings, ev, d.order_reference, d.claimed_amount, extra)
    expl = build_explanation(pred, effective, txn, findings, rec)
    expl["history_baseline"] = history_note(len(owner_txns))

    a = AIAnalysis(dispute_id=d.id, model_version=pred["model_version"] if pred else None, ai_available=pred is not None,
                   predicted_category=predicted, confidence=pred["confidence"] if pred else None,
                   requires_human_review=rec["requires_human_review"],
                   reason_codes=(pred["reason_codes"] if pred else ["AI_UNAVAILABLE"]), explanation=expl)
    db.add(a)
    db.flush()
    for f in findings:
        db.add(ValidationFinding(dispute_id=d.id, analysis_id=a.id, **f))
    db.add(Recommendation(dispute_id=d.id, analysis_id=a.id, action=rec["recommended_action"], explanation=rec["explanation"],
                          missing_information=rec["missing_information"], review_reasons=rec["review_reasons"],
                          requires_human_review=rec["requires_human_review"], low_risk_eligible=rec["low_risk_eligible"],
                          execution_mode=rec["execution_mode"], rule_version=rec["rule_version"]))
    return a, rec, findings


def next_status(d, rec, ai_available):
    if d.effective_category == Cat.UNAUTHORIZED:
        return "ESCALATED"
    if d.effective_category is None and ai_available:
        return "AWAITING_INFORMATION"
    if rec["requires_human_review"]:
        return "UNDER_REVIEW"
    if rec["missing_information"]:
        return "AWAITING_INFORMATION"
    return "ACTION_RECOMMENDED"
