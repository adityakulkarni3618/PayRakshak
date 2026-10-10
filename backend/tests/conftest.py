import os, tempfile
_tmp = tempfile.mkdtemp()
os.environ.update(DATABASE_URL=f"sqlite:///{_tmp}/test.db", UPLOAD_DIR=f"{_tmp}/uploads", MODEL_DIR=f"{_tmp}/models",
                  SECRET_KEY="test-secret-key-not-for-production-use-1234567890", ENV="test", AUTO_CREATE_TABLES="false")
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select
from app.main import app
from app.db import Base, engine, SessionLocal
from app.ml.classifier import classifier
from app.ml.train import train
from app.models import User
from app.security import hash_password
from app.services import ratelimit

H = {"X-Requested-With": "upiresolve"}
PW = "correct-horse-battery"


@pytest.fixture(scope="session", autouse=True)
def _model():
    train(os.environ["MODEL_DIR"])
    classifier.model_dir = __import__("pathlib").Path(os.environ["MODEL_DIR"])
    assert classifier.load()


@pytest.fixture(autouse=True)
def _db():
    Base.metadata.drop_all(engine)
    Base.metadata.create_all(engine)
    ratelimit.reset()
    if not classifier.available:
        classifier.load()
    yield


def make_client(email, role="CUSTOMER"):
    with SessionLocal() as db:
        if not db.scalar(select(User).where(User.email == email)):
            db.add(User(email=email, full_name="Test User", password_hash=hash_password(PW), role=role))
            db.commit()
    c = TestClient(app, headers=H)
    r = c.post("/api/v1/auth/login", json={"email": email, "password": PW})
    assert r.status_code == 200, r.text
    return c


@pytest.fixture
def customer():
    return make_client("cust@example.com")


@pytest.fixture
def customer2():
    return make_client("cust2@example.com")


@pytest.fixture
def agent():
    return make_client("agent@example.com", "SUPPORT_AGENT")


@pytest.fixture
def admin():
    return make_client("admin@example.com", "ADMIN")


CSV = ("external_ref,occurred_at,amount,direction,status,counterparty,merchant_ref,reversal_status\n"
       "REF0001,2026-03-01T10:00:00+05:30,850.00,SENT,FAILED,Cafe,,UNKNOWN\n"
       "REF0002,2026-03-02T11:00:00+05:30,1500.00,SENT,SUCCESS,Shop A,ORD-9,UNKNOWN\n"
       "DUP0001,2026-03-03T09:00:00+05:30,500.00,SENT,SUCCESS,Grocer,,UNKNOWN\n"
       "DUP0001,2026-03-03T09:01:00+05:30,500.00,SENT,SUCCESS,Grocer,,UNKNOWN\n")


def import_txns(c, csv=CSV):
    r = c.post("/api/v1/transactions/import", files={"file": ("t.csv", csv, "text/csv")})
    assert r.status_code == 201, r.text
    items = c.get("/api/v1/transactions?page_size=100").json()["items"]
    return {(t["external_ref"], t["occurred_at"][:16]): t for t in items}, items


def txn_by_ref(items, ref):
    return [t for t in items if t["external_ref"] == ref]


def file_dispute(c, txn_id, text, category=None, **kw):
    return c.post("/api/v1/disputes", json={"transaction_id": txn_id, "description": text, "selected_category": category, **kw})
