"""Rule-based resolution recommendations. ADVISORY ONLY: this module never refunds, reverses or closes anything."""
from ..enums import Cat

RULE_VERSION = "rules-v1"
CHANNEL = ("Report it immediately through your bank or payment app's official dispute process. In India you can also call the "
           "National Cyber Crime Helpline 1930 or use cybercrime.gov.in.")


def recommend(category, txn, findings, evidence_count, order_reference, claimed_amount, extra_review_reasons=()):
    missing, reasons = [], list(extra_review_reasons)
    kinds = {f["rule_id"] for f in findings}
    if any(f["severity"] == "HIGH" for f in findings):
        reasons.append("HIGH_SEVERITY_FINDING")
    if any(f["kind"] == "CONFIRMED_INCONSISTENCY" for f in findings):
        reasons.append("CONFLICTING_RECORDS")

    if category is None:
        action, text = "REQUEST_MORE_INFORMATION", "The complaint could not be matched to a category with enough confidence. More detail is needed."
        missing.append("A clearer description of what went wrong")
    elif category == Cat.UNAUTHORIZED:
        action, text = "PRIORITISE_AND_DIRECT_TO_OFFICIAL_CHANNEL", "Possible unauthorized transaction. " + CHANNEL
        reasons.append("UNAUTHORIZED_ALLEGATION")
    elif category == Cat.FAILED:
        if txn.status == "FAILED" and txn.reversal_status == "UNKNOWN":
            action, text = "VERIFY_REVERSAL_STATUS", "The transaction is marked FAILED but no verified reversal record is available."
            missing.append("Verified reversal status")
            reasons.append("REVERSAL_UNVERIFIED")
        elif txn.status == "FAILED" and txn.reversal_status == "CONFIRMED":
            action, text = "CONFIRM_REVERSAL_WITH_CUSTOMER", "The transaction failed and a reversal is recorded. Confirm the credit with the customer."
        elif txn.status == "FAILED":
            action, text = "REVIEW_MISSING_REVERSAL", "The transaction failed and no reversal is recorded. A reviewer must check whether one is due."
            reasons.append("MISSING_REVERSAL")
        else:
            action, text = "VERIFY_TRANSACTION_STATUS", f"The customer reports a failure but the record shows {txn.status}. Verify the final status."
            reasons.append("STATUS_NEEDS_VERIFICATION")
    elif category == Cat.DUPLICATE:
        if kinds & {"R001_DUPLICATE_EXTERNAL_REF", "R002_SIMILAR_TXN_WINDOW"}:
            action, text = "COMPARE_REFERENCES_AND_SETTLEMENT", "A duplicate candidate exists. Compare references and settlement records to separate duplicate records from two genuine payments."
            reasons.append("DUPLICATE_CANDIDATE")
        else:
            action, text = "REQUEST_MORE_INFORMATION", "No duplicate candidate was found in the available records."
            missing.append("Reference or date of the second debit")
    elif category == Cat.AMOUNT:
        action, text = "COMPARE_AUTHORIZED_AMOUNT", "Compare the amount the customer authorised with the recorded amount."
        if claimed_amount is None:
            missing.append("Amount the customer expected to pay")
        if evidence_count == 0:
            missing.append("Invoice or order confirmation")
    elif category == Cat.NON_DELIVERY:
        action, text = "REQUEST_DELIVERY_EVIDENCE", "Request order details and delivery evidence. Non-delivery is a dispute with the merchant and the claim is unverified."
        if not order_reference:
            missing.append("Order reference")
        if evidence_count == 0:
            missing.append("Delivery or merchant chat evidence")
    elif category == Cat.REFUND:
        action, text = "CHECK_REFUND_STATUS", "Check whether the merchant initiated the refund and whether it has settled."
        if evidence_count == 0:
            missing.append("Merchant refund confirmation")
    elif category == Cat.PENDING:
        action, text = "VERIFY_LATEST_STATUS", "Verify the latest status before recommending another payment. Do not pay again until the outcome is known."
    else:
        action, text = "ROUTE_FOR_REVIEW", "This looks like a general query rather than a payment dispute. Route to support."
        reasons.append("OUT_OF_SCOPE")

    review = bool(reasons)
    return {"recommended_action": action, "explanation": text, "missing_information": missing,
            "review_reasons": sorted(set(reasons)), "requires_human_review": review,
            "low_risk_eligible": (not review) and (not missing) and category not in (None, Cat.OTHER),
            "execution_mode": "ADVISORY_ONLY", "rule_version": RULE_VERSION}
