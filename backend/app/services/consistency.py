"""Deterministic transaction consistency engine. Every finding has a stable rule id, evidence refs and a next step.
Kinds: CONFIRMED_INCONSISTENCY | POSSIBLE_ANOMALY | MISSING_INFORMATION | UNVERIFIED_ALLEGATION.
Nothing here ever labels anything as confirmed fraud."""
from datetime import timedelta
from statistics import median
from ..enums import Cat

HIGH, MED, LOW, INFO = "HIGH", "MEDIUM", "LOW", "INFO"


def _f(rule_id, severity, kind, explanation, fields, ids, next_step):
    return {"rule_id": rule_id, "severity": severity, "kind": kind, "explanation": explanation,
            "fields": fields, "source_ids": ids, "next_step": next_step}


def _aware(dt):
    return dt if dt.tzinfo else dt.replace(tzinfo=__import__("datetime").timezone.utc)


def run_checks(txn, owner_txns, other_dispute_count, category, claimed_amount=None, order_reference=None, evidence_count=0):
    out = []
    others = [t for t in owner_txns if t.id != txn.id]

    same_ref = [t for t in others if txn.external_ref and t.external_ref == txn.external_ref]
    if same_ref:
        out.append(_f("R001_DUPLICATE_EXTERNAL_REF", MED, "POSSIBLE_ANOMALY",
                      f"{len(same_ref)} other record(s) share external reference {txn.external_ref}. This may be a duplicated database record or a reference reused by the source; it cannot be told apart from the available data.",
                      ["external_ref"], [txn.id] + [t.id for t in same_ref],
                      "Verify the underlying transaction records with the payment provider before deciding whether a duplicate payment occurred."))

    window = timedelta(minutes=10)
    similar = [t for t in others if t not in same_ref and t.amount == txn.amount and t.counterparty == txn.counterparty
               and t.direction == txn.direction and abs(_aware(t.occurred_at) - _aware(txn.occurred_at)) <= window]
    if similar:
        out.append(_f("R002_SIMILAR_TXN_WINDOW", LOW, "POSSIBLE_ANOMALY",
                      f"{len(similar)} other transaction(s) with the same amount and counterparty occurred within 10 minutes. Two genuine payments are also possible.",
                      ["amount", "counterparty", "occurred_at"], [txn.id] + [t.id for t in similar],
                      "Compare the transaction references and settlement records; ask the customer whether both payments were intended."))

    if category == Cat.FAILED and txn.status == "SUCCESS":
        out.append(_f("R003_STATUS_CONTRADICTS_COMPLAINT", MED, "POSSIBLE_ANOMALY",
                      "The customer describes a failed payment but the available record shows SUCCESS.",
                      ["status"], [txn.id], "Verify the final status with the provider before any action."))
    if category == Cat.PENDING and txn.status != "PENDING":
        out.append(_f("R012_PENDING_CONTRADICTS_RECORD", LOW, "POSSIBLE_ANOMALY",
                      f"The customer reports a pending payment but the record shows {txn.status}.",
                      ["status"], [txn.id], "Check the latest status and tell the customer the current outcome."))

    if txn.status == "REVERSED" and txn.reversal_status == "NONE":
        out.append(_f("R010_STATUS_REVERSAL_CONFLICT", HIGH, "CONFIRMED_INCONSISTENCY",
                      "The record is marked REVERSED but also says no reversal exists. These fields contradict each other.",
                      ["status", "reversal_status"], [txn.id], "Correct or re-verify the record at its source."))

    if other_dispute_count > 0:
        out.append(_f("R004_MULTIPLE_DISPUTES", LOW, "POSSIBLE_ANOMALY",
                      f"{other_dispute_count} other dispute(s) are already linked to this transaction.",
                      ["transaction_id"], [txn.id], "Review the earlier case(s) to avoid duplicate handling."))

    if not txn.external_ref:
        out.append(_f("R005_MISSING_REFERENCE", LOW, "MISSING_INFORMATION", "The record has no external UPI reference number.",
                      ["external_ref"], [txn.id], "Ask the customer for the UPI reference from their payment app."))
    if txn.data_source != "PROVIDER_VERIFIED":
        out.append(_f("R006_UNVERIFIED_SOURCE", INFO, "MISSING_INFORMATION",
                      f"This record's data source is {txn.data_source}, not provider-verified. Its status is not an authoritative payment outcome.",
                      ["data_source"], [txn.id], "Confirm the status with the bank or payment provider."))

    if category == Cat.AMOUNT and claimed_amount is not None:
        if claimed_amount != txn.amount:
            out.append(_f("R007_AMOUNT_MISMATCH", MED, "UNVERIFIED_ALLEGATION",
                          f"The customer says the expected amount was {claimed_amount} but the record shows {txn.amount} (difference {txn.amount - claimed_amount}). The expected amount is unverified.",
                          ["amount"], [txn.id], "Compare with the merchant invoice or order confirmation."))
        else:
            out.append(_f("R007_AMOUNT_MISMATCH", LOW, "POSSIBLE_ANOMALY",
                          "The expected amount given by the customer equals the recorded amount; no discrepancy appears in the available data.",
                          ["amount"], [txn.id], "Ask the customer what amount they expected and why."))

    if category == Cat.NON_DELIVERY and not order_reference and evidence_count == 0:
        out.append(_f("R013_NO_ORDER_EVIDENCE", LOW, "MISSING_INFORMATION", "No order reference or evidence has been provided.",
                      ["order_reference"], [txn.id], "Request the order ID and any delivery or chat evidence."))

    if category == Cat.UNAUTHORIZED:
        out.append(_f("R008_UNAUTHORIZED_ALLEGATION", HIGH, "UNVERIFIED_ALLEGATION",
                      "The customer states they did not authorize this transaction. This is an unverified allegation, not a confirmed finding.",
                      ["status"], [txn.id], "Prioritise for human review and direct the customer to the official bank / payment-app dispute process."))

    # Optional history-based outlier check: robust (median/MAD) and only with enough history.
    amounts = [float(t.amount) for t in others if t.direction == txn.direction]
    if len(amounts) >= 30:
        med = median(amounts)
        mad = median(abs(a - med) for a in amounts) or 1.0
        z = 0.6745 * (float(txn.amount) - med) / mad
        if z > 6:
            out.append(_f("R014_AMOUNT_OUTLIER", LOW, "POSSIBLE_ANOMALY",
                          f"The amount is far above this account's typical amounts (robust z={z:.1f}). Unusual is not the same as fraudulent.",
                          ["amount"], [txn.id], "Consider as context only."))
    return out


def history_note(owner_txns_count: int) -> str:
    return "available" if owner_txns_count - 1 >= 30 else "unavailable (needs at least 30 other transactions on this account)"
