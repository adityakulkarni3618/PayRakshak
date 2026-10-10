import pytest
from sqlalchemy import select
from app.db import SessionLocal
from app.models import User, AuditEvent
from app.security import hash_password, verify_password
from app.ml.classifier import classifier
from .conftest import make_client, import_txns, txn_by_ref, file_dispute, H, PW
from fastapi.testclient import TestClient
from app.main import app

PNG = b"\x89PNG\r\n\x1a\n" + b"0" * 64


# ---------- auth ----------
def test_register_login_and_hashing():
    c = TestClient(app, headers=H)
    r = c.post("/api/v1/auth/register", json={"email": "New@Example.com", "full_name": "New User", "password": PW, "role": "ADMIN"})
    assert r.status_code == 201 and r.json()["role"] == "CUSTOMER"  # client cannot choose a role
    with SessionLocal() as db:
        u = db.scalar(select(User).where(User.email == "new@example.com"))
        assert PW not in u.password_hash and verify_password(PW, u.password_hash)
    assert c.post("/api/v1/auth/login", json={"email": "new@example.com", "password": "wrong-password"}).status_code == 401
    assert c.post("/api/v1/auth/login", json={"email": "new@example.com", "password": PW}).status_code == 200
    assert c.get("/api/v1/auth/me").json()["email"] == "new@example.com"


def test_unauthenticated_and_csrf():
    assert TestClient(app).get("/api/v1/auth/me").status_code == 401
    c = make_client("a@example.com")
    c.headers.pop("X-Requested-With")
    assert c.post("/api/v1/transactions/import", files={"file": ("t.csv", "x", "text/csv")}).status_code == 403


def test_lockout_after_failed_logins():
    make_client("lock@example.com")
    c = TestClient(app, headers=H)
    codes = [c.post("/api/v1/auth/login", json={"email": "lock@example.com", "password": "bad-password-1"}).status_code for _ in range(6)]
    assert 423 in codes or 429 in codes


def test_role_enforcement(customer, agent, admin):
    assert customer.get("/api/v1/support/cases").status_code == 403
    assert customer.get("/api/v1/admin/analytics").status_code == 403
    assert agent.get("/api/v1/admin/analytics").status_code == 403
    assert admin.get("/api/v1/admin/analytics").status_code == 200


# ---------- transactions ----------
def test_import_validation_and_duplicates(customer):
    bad = "external_ref,occurred_at,amount,direction,status,counterparty\nX1,not-a-date,-5,SIDEWAYS,DONE,\n"
    r = customer.post("/api/v1/transactions/import/preview", files={"file": ("b.csv", bad, "text/csv")})
    assert r.json()["invalid_rows"] == 1 and len(r.json()["errors"][0]["errors"]) >= 4  # no silent drops
    assert customer.post("/api/v1/transactions/import", files={"file": ("b.csv", "a,b\n1,2\n", "text/csv")}).status_code == 400
    _, items = import_txns(customer)
    assert len(items) == 4 and all(t["data_source"] == "USER_IMPORTED" for t in items)
    from .conftest import CSV
    r = customer.post("/api/v1/transactions/import", files={"file": ("t.csv", CSV, "text/csv")})
    assert r.json()["imported"] == 0 and r.json()["duplicates_skipped"] == 4  # idempotent re-import


def test_transactions_isolated_and_filtered(customer, customer2):
    _, items = import_txns(customer)
    assert customer2.get("/api/v1/transactions").json()["total"] == 0
    assert customer2.get(f"/api/v1/transactions/{items[0]['id']}").status_code == 404
    assert customer.get("/api/v1/transactions?status=FAILED").json()["total"] == 1
    assert customer.get("/api/v1/transactions?min_amount=1000").json()["total"] == 1
    assert customer.get("/api/v1/transactions?q=REF0002").json()["total"] == 1


# ---------- disputes + AI ----------
def test_failed_payment_flow(customer):
    _, items = import_txns(customer)
    t = txn_by_ref(items, "REF0001")[0]
    r = file_dispute(customer, t["id"], "My payment failed but the money was debited from my account and not reversed.", "FAILED_TRANSACTION")
    assert r.status_code == 201, r.text
    d = r.json()
    assert d["case_id"].startswith("UPIR-") and d["status"] == "UNDER_REVIEW"
    assert d["recommendation"]["action"] == "VERIFY_REVERSAL_STATUS"
    assert d["recommendation"]["execution_mode"] == "ADVISORY_ONLY"
    assert d["analysis"]["ai_available"] and 0 <= d["analysis"]["confidence"] <= 1
    assert any(f["rule_id"] == "R006_UNVERIFIED_SOURCE" for f in d["findings"])
    assert customer.get("/api/v1/dashboard").json()["active_disputes"] == 1


def test_duplicate_candidate_flagged(customer):
    _, items = import_txns(customer)
    t = txn_by_ref(items, "DUP0001")[0]
    d = file_dispute(customer, t["id"], "I was charged twice, the same amount was debited two times for one order.", "DUPLICATE_PAYMENT").json()
    rules = {f["rule_id"] for f in d["findings"]}
    assert "R001_DUPLICATE_EXTERNAL_REF" in rules
    assert d["recommendation"]["action"] == "COMPARE_REFERENCES_AND_SETTLEMENT" and d["recommendation"]["requires_human_review"]
    assert all("fraud confirmed" not in f["explanation"].lower() for f in d["findings"])


def test_unauthorized_escalated(customer):
    _, items = import_txns(customer)
    d = file_dispute(customer, items[0]["id"], "I did not make this payment, someone did an unauthorized transaction from my account.", "UNAUTHORIZED_TRANSACTION").json()
    assert d["status"] == "ESCALATED" and d["recommendation"]["requires_human_review"]
    assert any(f["rule_id"] == "R008_UNAUTHORIZED_ALLEGATION" and f["kind"] == "UNVERIFIED_ALLEGATION" for f in d["findings"])


def test_cross_user_access_blocked(customer, customer2):
    _, items = import_txns(customer)
    d = file_dispute(customer, items[0]["id"], "My payment failed but money was debited from my bank account.", "FAILED_TRANSACTION").json()
    assert customer2.get(f"/api/v1/disputes/{d['case_id']}").status_code == 403
    assert customer2.post(f"/api/v1/disputes/{d['case_id']}/withdraw").status_code == 403
    assert file_dispute(customer2, items[0]["id"], "My payment failed but money was debited from my bank account.").status_code == 404


def test_idempotent_submission(customer):
    _, items = import_txns(customer)
    body = {"transaction_id": items[0]["id"], "description": "My payment failed but money was debited from my bank."}
    a = customer.post("/api/v1/disputes", json=body, headers={"Idempotency-Key": "k1"}).json()
    b = customer.post("/api/v1/disputes", json=body, headers={"Idempotency-Key": "k1"}).json()
    assert a["case_id"] == b["case_id"] and customer.get("/api/v1/disputes").json()["total"] == 1


def test_ai_unavailable_fails_safe(customer):
    _, items = import_txns(customer)
    classifier.unload()
    try:
        assert customer.post("/api/v1/ai/classify", json={"text": "payment failed"}).status_code == 503
        d = file_dispute(customer, items[0]["id"], "Something strange happened with my payment yesterday.").json()
        assert d["analysis"]["ai_available"] is False and d["analysis"]["confidence"] is None
        assert d["status"] == "UNDER_REVIEW" and d["predicted_category"] is None
        assert customer.get("/health").json()["model_available"] is False
    finally:
        classifier.load()


def test_vague_complaint_requests_clarification(customer):
    _, items = import_txns(customer)
    d = file_dispute(customer, items[0]["id"], "hello please help me thanks a lot sir").json()
    assert d["analysis"]["ai_available"] and d["effective_category"] is None
    assert d["status"] == "AWAITING_INFORMATION" and d["recommendation"]["action"] == "REQUEST_MORE_INFORMATION"


def test_confidence_threshold_behaviour():
    classifier.threshold = 0.99
    try:
        assert classifier.predict("payment failed money debited")["predicted_category"] == "NEEDS_CLARIFICATION"
    finally:
        classifier.threshold = 0.40
    assert classifier.predict("The same payment was deducted twice, double debit")["predicted_category"] == "DUPLICATE_PAYMENT"


def test_validation_errors(customer):
    r = customer.post("/api/v1/disputes", json={"transaction_id": "x", "description": "short"})
    assert r.status_code == 422


# ---------- state machine, evidence, support, audit ----------
def test_state_machine_and_support_flow(customer, agent):
    _, items = import_txns(customer)
    t = txn_by_ref(items, "REF0001")[0]
    cid = file_dispute(customer, t["id"], "My payment failed but the money was debited from my account.", "FAILED_TRANSACTION").json()["case_id"]
    r = customer.post(f"/api/v1/disputes/{cid}/evidence", files={"file": ("proof.png", PNG, "image/png")})
    assert r.status_code == 201
    ev_id = r.json()["id"]
    assert customer.post(f"/api/v1/disputes/{cid}/evidence", files={"file": ("x.exe", b"MZ", "application/octet-stream")}).status_code == 400
    assert customer.post(f"/api/v1/disputes/{cid}/evidence", files={"file": ("fake.png", b"not a png", "image/png")}).status_code == 400
    # support cannot jump straight to RESOLVED
    assert agent.post(f"/api/v1/support/cases/{cid}/review", json={"decision": "RESOLVE", "note": "done"}).status_code == 409
    assert agent.post(f"/api/v1/support/cases/{cid}/evidence/{ev_id}/review", json={"outcome": "ACCEPTED"}).status_code == 200
    assert agent.get(f"/api/v1/disputes/{cid}/evidence/{ev_id}").status_code == 200
    r = agent.post(f"/api/v1/support/cases/{cid}/request-information", json={"message": "Please share your bank statement line."})
    assert r.json()["status"] == "AWAITING_INFORMATION"
    r = customer.post(f"/api/v1/disputes/{cid}/additional-information", json={"message": "Here is the statement reference ABC123."})
    assert r.json()["status"] == "UNDER_REVIEW"
    assert agent.post(f"/api/v1/support/cases/{cid}/note", json={"body": "internal only"}).status_code == 200
    assert all(c["body"] != "internal only" for c in customer.get(f"/api/v1/disputes/{cid}").json()["comments"])  # notes stay internal
    assert agent.post(f"/api/v1/support/cases/{cid}/review", json={"decision": "APPROVE_RECOMMENDATION", "note": "Verify reversal"}).json()["status"] == "ACTION_RECOMMENDED"
    assert customer.post(f"/api/v1/support/cases/{cid}/review", json={"decision": "RESOLVE", "note": "self resolve"}).status_code == 403
    assert agent.post(f"/api/v1/support/cases/{cid}/review", json={"decision": "RESOLVE", "note": "Reversal confirmed"}).json()["status"] == "RESOLVED"
    assert customer.get(f"/api/v1/disputes/{cid}").json()["status"] == "RESOLVED"
    assert customer.post(f"/api/v1/disputes/{cid}/withdraw").status_code == 409
    tl = [e["action"] for e in customer.get(f"/api/v1/disputes/{cid}/timeline").json()]
    assert "DISPUTE_CREATED" in tl and "STATUS_CHANGED" in tl
    with SessionLocal() as db:
        actions = {e.action for e in db.scalars(select(AuditEvent)).all()}
    assert {"DISPUTE_CREATED", "STATUS_CHANGED", "EVIDENCE_UPLOADED", "AI_ANALYSIS_COMPLETED", "EVIDENCE_REVIEWED"} <= actions


def test_agent_sees_other_agents_cases_only_if_unassigned(customer, agent):
    _, items = import_txns(customer)
    cid = file_dispute(customer, items[0]["id"], "My payment failed but money was debited from my bank.", "FAILED_TRANSACTION").json()["case_id"]
    assert agent.post(f"/api/v1/support/cases/{cid}/assign", json={}).status_code == 200
    other = make_client("agent2@example.com", "SUPPORT_AGENT")
    assert other.get(f"/api/v1/support/cases/{cid}").status_code == 403


def test_admin_analytics_and_roles(customer, admin):
    _, items = import_txns(customer)
    file_dispute(customer, items[0]["id"], "My payment failed but money was debited from my bank.", "FAILED_TRANSACTION")
    a = admin.get("/api/v1/admin/analytics").json()
    assert a["total_disputes"] == 1 and "accuracy" in a["definitions"]
    uid = customer.get("/api/v1/auth/me").json()["id"]
    assert admin.post(f"/api/v1/admin/users/{uid}/role", json={"role": "SUPPORT_AGENT"}).status_code == 200
    assert admin.get("/api/v1/admin/audit-events").json()["total"] > 0
