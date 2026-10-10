"""Provision the first administrator (development / initial setup).
Usage: python -m scripts.create_admin --email you@example.com --name "Your Name"   (password is prompted)
There is intentionally no default admin account."""
import argparse, getpass, sys
from sqlalchemy import select
from app.db import Base, engine, SessionLocal
from app.models import User
from app.security import hash_password

ap = argparse.ArgumentParser()
ap.add_argument("--email", required=True)
ap.add_argument("--name", required=True)
ap.add_argument("--role", default="ADMIN", choices=["ADMIN", "SUPPORT_AGENT"])
ap.add_argument("--password", help="Optional password via flag")
a = ap.parse_args()
pw = a.password or getpass.getpass("Password (min 10 chars): ")
if len(pw) < 10:
    sys.exit("Password too short")
Base.metadata.create_all(engine)
with SessionLocal() as db:
    if db.scalar(select(User).where(User.email == a.email.lower())):
        sys.exit("User already exists")
    db.add(User(email=a.email.lower(), full_name=a.name, password_hash=hash_password(pw), role=a.role))
    db.commit()
print(f"Created {a.role} {a.email}")
