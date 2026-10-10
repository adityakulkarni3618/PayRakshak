"""Seed clearly SYNTHETIC demo data (development only).  python -m scripts.seed
Creates demo.customer@example.com and demo.agent@example.com with RANDOM passwords printed once."""
import secrets
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from sqlalchemy import select
from app.config import settings
from app.db import Base, engine, SessionLocal
from app.models import User, Transaction
from app.security import hash_password
from app.routers.transactions import row_hash

if settings.env == "production":
    raise SystemExit("Refusing to seed demo data in production")
Base.metadata.create_all(engine)
now = datetime.now(timezone.utc)
SPEC = [  # ref, minutes_ago, amount, direction, status, reversal, counterparty
    ("SYN000001", 60 * 24 * 1, "1500.00", "SENT", "SUCCESS", "UNKNOWN", "Synthetic Shop A"),   # non-delivery demo
    ("SYN000002", 60 * 24 * 2, "850.00", "SENT", "FAILED", "UNKNOWN", "Synthetic Cafe"),       # failed + reversal unknown
    ("SYN000003", 60 * 5, "299.00", "SENT", "PENDING", "UNKNOWN", "Synthetic Cabs"),           # pending
    ("SYN000004", 60 * 24 * 3, "500.00", "SENT", "SUCCESS", "UNKNOWN", "Synthetic Grocer"),    # duplicate reference pair
    ("SYN000004", 60 * 24 * 3 - 2, "500.00", "SENT", "SUCCESS", "UNKNOWN", "Synthetic Grocer"),
    ("SYN000005", 60 * 24 * 4, "2400.00", "SENT", "SUCCESS", "UNKNOWN", "Unknown Payee 77"),   # unauthorized demo
    ("SYN000006", 60 * 24 * 6, "999.00", "SENT", "SUCCESS", "UNKNOWN", "Synthetic Store B"),   # incorrect amount demo
    ("SYN000007", 60 * 24 * 8, "1200.00", "SENT", "SUCCESS", "UNKNOWN", "Synthetic Mart"),     # refund delay demo
]
with SessionLocal() as db:
    out = []
    for email, name, role in (("demo.customer@example.com", "Demo Customer", "CUSTOMER"), ("demo.agent@example.com", "Demo Agent", "SUPPORT_AGENT")):
        if db.scalar(select(User).where(User.email == email)):
            continue
        pw = secrets.token_urlsafe(12)
        db.add(User(email=email, full_name=name, password_hash=hash_password(pw), role=role))
        out.append((email, pw))
    db.flush()
    cust = db.scalar(select(User).where(User.email == "demo.customer@example.com"))
    for ref, mins, amt, dr, st, rev, cp in SPEC:
        r = {"external_ref": ref, "occurred_at": now - timedelta(minutes=mins), "amount": Decimal(amt), "direction": dr, "counterparty": cp}
        h = row_hash(cust.id, r)
        if not db.scalar(select(Transaction.id).where(Transaction.owner_id == cust.id, Transaction.row_hash == h)):
            db.add(Transaction(owner_id=cust.id, external_ref=ref, occurred_at=r["occurred_at"], amount=r["amount"], direction=dr, status=st,
                               reversal_status=rev, counterparty=cp, data_source="SYNTHETIC", row_hash=h))
    db.commit()
print("Seeded SYNTHETIC data. New credentials (shown once):")
for e, p in out:
    print(f"  {e}  {p}")
