from datetime import datetime, timedelta, timezone
import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from .config import settings

_ph = PasswordHasher()
hash_password = _ph.hash

def verify_password(pw: str, hashed: str) -> bool:
    try:
        return _ph.verify(hashed, pw)
    except VerifyMismatchError:
        return False

def create_token(user_id: int, role: str, kind: str = "access") -> str:
    delta = timedelta(minutes=settings.ACCESS_MINUTES) if kind == "access" else timedelta(days=settings.REFRESH_DAYS)
    payload = {"sub": str(user_id), "role": role, "type": kind, "exp": datetime.now(timezone.utc) + delta}
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")

def decode_token(token: str, kind: str = "access") -> dict | None:
    try:
        p = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        return p if p.get("type") == kind else None
    except jwt.PyJWTError:
        return None
