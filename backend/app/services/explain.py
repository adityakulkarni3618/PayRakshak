from ..enums import LABELS


def build_explanation(pred, category, txn, findings, rec):
    if category:
        lead = f"Your complaint appears to describe {LABELS.get(category, 'an issue')}."
    elif pred is None:
        lead = "Automated classification is currently unavailable, so your case will be reviewed by a person."
    else:
        lead = "We could not confidently identify the type of issue from your description."
    status = f" The available record shows the transaction as {txn.status} (data source: {txn.data_source})."
    return {
        "summary": lead + status + " " + rec["explanation"],
        "predicted_category": pred["predicted_category"] if pred else None,
        "model_confidence": pred["confidence"] if pred else None,
        "confidence_note": "Model confidence is confidence in the category only, not the probability of fraud or of the complaint being genuine.",
        "matched_terms": pred["matched_terms"] if pred else [],
        "findings": [{"rule_id": f["rule_id"], "kind": f["kind"], "severity": f["severity"], "explanation": f["explanation"]} for f in findings],
        "missing_information": rec["missing_information"],
        "recommended_action": rec["recommended_action"],
        "human_review_required": rec["requires_human_review"],
        "human_review_reasons": rec["review_reasons"],
    }
