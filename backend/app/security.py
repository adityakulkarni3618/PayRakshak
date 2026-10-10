import hashlib, hmac, os
from datetime import datetime, timedelta, timezone
import jwt
from .config import settings

_N, _R, _P = 2 ** 14, 8, 1


def hash_password(pw: str) -> str:
    salt = os.urandom(16)
    h = hashlib.scrypt(pw.encode(), salt=salt, n=_N, r=_R, p=_P, dklen=32)
    return f"scrypt${salt.hex()}${h.hex()}"


def verify_password(pw: str, stored: str) -> bool:
    try:
        _, salt, h = stored.split("$")
        calc = hashlib.scrypt(pw.encode(), salt=bytes.fromhex(salt), n=_N, r=_R, p=_P, dklen=32)
        return hmac.compare_digest(calc.hex(), h)
    except Exception:
        return False


def create_token(user_id: str) -> str:
    # Only the user id is stored in the token. Role is always read from the database.
    exp = datetime.now(timezone.utc) + timedelta(minutes=settings.token_minutes)
    return jwt.encode({"sub": user_id, "exp": exp}, settings.secret_key, algorithm="HS256")


def decode_token(token: str) -> str | None:
    try:
        return jwt.decode(token, settings.secret_key, algorithms=["HS256"]).get("sub")
    except jwt.PyJWTError:
        return None
