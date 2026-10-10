from fastapi import Depends, HTTPException, Request
from sqlalchemy.orm import Session
from .db import get_db
from .models import User
from .security import decode_token
from .enums import Role

COOKIE = "access_token"
SAFE = {"GET", "HEAD", "OPTIONS"}


def get_current_user(request: Request, db: Session = Depends(get_db)) -> User:
    token, via_cookie = request.cookies.get(COOKIE), True
    if not token:
        auth = request.headers.get("authorization", "")
        if auth.lower().startswith("bearer "):
            token, via_cookie = auth[7:], False
    if not token:
        raise HTTPException(401, "Not authenticated")
    # CSRF defence for cookie sessions: state-changing calls need a custom header browsers won't send cross-site.
    if via_cookie and request.method not in SAFE and request.headers.get("x-requested-with") != "upiresolve":
        raise HTTPException(403, "Missing CSRF header")
    uid = decode_token(token)
    user = db.get(User, uid) if uid else None
    if not user or not user.is_active:
        raise HTTPException(401, "Session expired or invalid")
    return user


def require_roles(*roles):
    def dep(user: User = Depends(get_current_user)) -> User:
        if user.role not in roles:
            raise HTTPException(403, "You do not have permission for this action")
        return user
    return dep


staff_only = require_roles(Role.SUPPORT_AGENT, Role.ADMIN)
admin_only = require_roles(Role.ADMIN)
