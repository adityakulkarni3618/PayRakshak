"""End-to-End Hackathon Demo Scenario Test (Steps A -> K)

Verifies full customer -> support agent -> administrator dispute lifecycle.
"""
import pytest
from datetime import datetime, timezone
from fastapi.testclient import TestClient
from app.main import app
from app.db import SessionLocal
from app.models import User, Transaction, Dispute, EvidenceFile, AuditEvent
from app.security import hash_password
from app.enums import Role, Status, Cat

H = {"X-Requested-With": "upiresolve"}

def test_full_demo_scenario_a_to_k():
    cust_pw = "CustomerPass123!"
    agent_pw = "AgentPass123!"
    admin_pw = "AdminPass123!"

    with SessionLocal() as db:
        cust = User(email="demo.customer@example.com", full_name="Demo Customer", password_hash=hash_password(cust_pw), role=Role.CUSTOMER)
        agent = User(email="demo.agent@example.com", full_name="Support Agent", password_hash=hash_password(agent_pw), role=Role.SUPPORT_AGENT)
        admin = User(email="admin@rescuelink.com", full_name="System Admin", password_hash=hash_password(admin_pw), role=Role.ADMIN)
        db.add_all([cust, agent, admin])
        db.commit()

        txn = Transaction(
            owner_id=cust.id,
            external_ref="999900001111",
            occurred_at=datetime.now(timezone.utc),
            amount=1500.0,
            currency="INR",
            direction="SENT",
            status="FAILED",
            counterparty="Online Merchant",
            data_source="SYNTHETIC",
            row_hash="hash-demo-12345",
        )
        db.add(txn)
        db.commit()
        cust_id, agent_id, admin_id, txn_id = cust.id, agent.id, admin.id, txn.id

    client = TestClient(app, headers=H)

    # Step A: Log in as Demo Customer
    res = client.post("/api/v1/auth/login", json={"email": "demo.customer@example.com", "password": cust_pw})
    assert res.status_code == 200, res.text

    # Step B: Inspect existing synthetic transaction
    res = client.get("/api/v1/transactions")
    assert res.status_code == 200
    txns = res.json()["items"]
    assert len(txns) >= 1
    assert txns[0]["data_source"] == "SYNTHETIC"

    # Step C: File a dispute using realistic information
    dispute_payload = {
        "transaction_id": txn_id,
        "selected_category": Cat.FAILED,
        "description": "Money was debited from my account but the payment failed and merchant did not receive it.",
    }
    res = client.post("/api/v1/disputes", json=dispute_payload)
    assert res.status_code == 201, res.text
    case = res.json()
    case_id = case["case_id"]
    assert case_id.startswith("UPIR-")

    # Step D & E: Review classifier result, consistency findings, and recommended next steps
    res = client.get(f"/api/v1/disputes/{case_id}")
    assert res.status_code == 200
    detail = res.json()
    assert detail["status"] in ("VALIDATING", "UNDER_REVIEW", "ACTION_RECOMMENDED", "AI_ANALYSIS", "SUBMITTED")
    assert "findings" in detail
    assert "recommendation" in detail
    if detail["recommendation"]:
        assert detail["recommendation"]["execution_mode"] == "ADVISORY_ONLY"

    # Step F: Upload permitted evidence (PNG file header b'\x89PNG\r\n\x1a\n')
    fake_png_data = b"\x89PNG\r\n\x1a\nfake_image_content"
    files = {"file": ("screenshot.png", fake_png_data, "image/png")}
    res = client.post(f"/api/v1/disputes/{case_id}/evidence", files=files)
    assert res.status_code == 201, res.text
    assert res.json()["name"] == "screenshot.png"

    # Step G: Open case timeline & inspect status
    res = client.get(f"/api/v1/disputes/{case_id}/timeline")
    assert res.status_code == 200
    timeline_events = res.json()
    assert len(timeline_events) >= 1

    # Step H: Log in as authorized Support Agent
    agent_client = TestClient(app, headers=H)
    res = agent_client.post("/api/v1/auth/login", json={"email": "demo.agent@example.com", "password": agent_pw})
    assert res.status_code == 200

    # Step I: Support Agent reviews case and performs permitted action (assign & review recommendation)
    res = agent_client.post(f"/api/v1/support/cases/{case_id}/assign", json={"agent_id": agent_id})
    assert res.status_code == 200

    review_payload = {
        "decision": "APPROVE_RECOMMENDATION",
        "note": "Verified with bank switch. Reversal is in progress.",
    }
    res = agent_client.post(f"/api/v1/support/cases/{case_id}/review", json=review_payload)
    assert res.status_code == 200, res.text

    # Step J: Customer confirms updated status in their account
    res = client.get(f"/api/v1/disputes/{case_id}")
    assert res.status_code == 200
    updated_detail = res.json()
    assert updated_detail["status"] in ("ACTION_RECOMMENDED", "RESOLVED", "UNDER_REVIEW")

    # Step K: Log in as Administrator & inspect analytics and audit events
    admin_client = TestClient(app, headers=H)
    res = admin_client.post("/api/v1/auth/login", json={"email": "admin@rescuelink.com", "password": admin_pw})
    assert res.status_code == 200

    res = admin_client.get("/api/v1/admin/analytics")
    assert res.status_code == 200
    analytics_data = res.json()
    assert "total_disputes" in analytics_data
    assert analytics_data["total_disputes"] >= 1

    res = admin_client.get("/api/v1/admin/audit-events")
    assert res.status_code == 200
    audit_data = res.json()
    assert audit_data["total"] >= 1
