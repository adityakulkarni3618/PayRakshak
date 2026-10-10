import json, tempfile
from decimal import Decimal
from types import SimpleNamespace as NS
from datetime import datetime, timezone
from app.ml.train import train
from app.ml.preprocess import normalize
from app.ml.classifier import ClassifierService
from app.ml.synthetic_data import generate, T
from app.services.consistency import run_checks
from app.services.resolution import recommend


def test_normalize_masks_amounts():
    assert normalize("Paid Rs 1,500 TODAY!!") == "paid amt today"
    assert normalize(None) == ""


def test_training_reproducible_and_serializable():
    d1, d2 = tempfile.mkdtemp(), tempfile.mkdtemp()
    m1, m2 = train(d1, seed=7), train(d2, seed=7)
    assert m1["macro_f1"] == m2["macro_f1"]
    svc = ClassifierService(d1)
    assert svc.load() and svc.predict("refund not received after cancelled order")["predicted_category"] == "REFUND_DELAY"
    assert set(m1["labels"]) <= set(m1["per_class"])  # per-class metrics reported
    assert m1["caveat"] and "SYNTHETIC" in m1["data_source"]


def test_missing_model_and_empty_input():
    svc = ClassifierService(tempfile.mkdtemp())
    assert svc.load() is False and svc.predict("anything") is None
    svc2 = ClassifierService(tempfile.mkdtemp())
    train(svc2.model_dir)
    svc2.load()
    assert svc2.predict("")["predicted_category"] == "NEEDS_CLARIFICATION"


def test_template_groups_cover_every_class():
    rows = generate(1)
    assert {r["label"] for r in rows} == set(T) and len({r["text"] for r in rows}) == len(rows)


def _t(**k):
    base = dict(id="t1", external_ref="R1", status="FAILED", reversal_status="UNKNOWN", amount=Decimal("100"), counterparty="C", direction="SENT",
                occurred_at=datetime(2026, 1, 1, tzinfo=timezone.utc), data_source="USER_IMPORTED")
    base.update(k)
    return NS(**base)


def test_rules_and_recommendations():
    t = _t()
    f = run_checks(t, [t], 0, "FAILED_TRANSACTION")
    r = recommend("FAILED_TRANSACTION", t, f, 0, None, None)
    assert r["recommended_action"] == "VERIFY_REVERSAL_STATUS" and r["execution_mode"] == "ADVISORY_ONLY"
    assert r["missing_information"] == ["Verified reversal status"]
    t2 = _t(status="REVERSED", reversal_status="NONE")
    assert any(x["kind"] == "CONFIRMED_INCONSISTENCY" for x in run_checks(t2, [t2], 0, None))
    ok = _t(status="PENDING")
    r = recommend("PENDING_TRANSACTION", ok, [], 0, None, None)
    assert r["low_risk_eligible"] and not r["requires_human_review"] and r["execution_mode"] == "ADVISORY_ONLY"


def test_similar_window_is_not_called_duplicate_fact():
    a, b = _t(id="a", external_ref="A1", status="SUCCESS"), _t(id="b", external_ref="B2", status="SUCCESS", occurred_at=datetime(2026, 1, 1, 0, 3, tzinfo=timezone.utc))
    f = run_checks(a, [a, b], 0, "DUPLICATE_PAYMENT")
    hit = [x for x in f if x["rule_id"] == "R002_SIMILAR_TXN_WINDOW"][0]
    assert hit["kind"] == "POSSIBLE_ANOMALY" and "genuine" in hit["explanation"]
