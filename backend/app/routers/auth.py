from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, Request, Response
from sqlalchemy import select
from sqlalchemy.orm import Session
from ..db import get_db
from ..deps import COOKIE, get_current_user
from ..config import settings
from ..models import User
from ..schemas import RegisterIn, LoginIn
from ..security import hash_password, verify_password, create_token
from ..services import ratelimit
from ..services.audit import log_event

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])


def user_out(u):
    return {"id": u.id, "email": u.email, "full_name": u.full_name, "role": u.role}


@router.post("/register", status_code=201)
def register(body: RegisterIn, request: Request, db: Session = Depends(get_db)):
    ratelimit.check(f"reg:{request.client.host if request.client else 'x'}", 10, 3600)
    email = body.email.lower()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(409, "An account with this email already exists")
    u = User(email=email, full_name=body.full_name.strip(), password_hash=hash_password(body.password), role="CUSTOMER")  # role is never client-supplied
    db.add(u)
    db.flush()
    log_event(db, u, "USER_REGISTERED", "user", u.id)
    db.commit()
    return user_out(u)


@router.post("/login")
def login(body: LoginIn, request: Request, response: Response, db: Session = Depends(get_db)):
    email = body.email.lower()
    ratelimit.check(f"login:{request.client.host if request.client else 'x'}:{email}", 8, 60)
    u = db.scalar(select(User).where(User.email == email))
    now = datetime.now(timezone.utc)
    if u and u.locked_until:
        lu = u.locked_until if u.locked_until.tzinfo else u.locked_until.replace(tzinfo=timezone.utc)
        if lu > now:
            raise HTTPException(423, "Account temporarily locked. Try again later.")
    if not u or not u.is_active or not verify_password(body.password, u.password_hash):
        if u:
            u.failed_logins += 1
            if u.failed_logins >= 5:
                u.locked_until, u.failed_logins = now + timedelta(minutes=15), 0
                log_event(db, u, "ACCOUNT_LOCKED", "user", u.id)
            db.commit()
        raise HTTPException(401, "Incorrect email or password")
    u.failed_logins, u.locked_until = 0, None
    log_event(db, u, "LOGIN", "user", u.id)
    db.commit()
    response.set_cookie(COOKIE, create_token(u.id), httponly=True, samesite="lax", secure=settings.cookie_secure,
                        max_age=settings.token_minutes * 60, path="/")
    return user_out(u)


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(COOKIE, path="/")
    return {"ok": True}


@router.get("/me")
def me(user: User = Depends(get_current_user)):
    return user_out(user)
