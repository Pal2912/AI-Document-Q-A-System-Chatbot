"""
JWT (JSON Web Token) creation and verification.

How this fits the auth flow:
  1. On signup/login, `create_access_token()` is called with the user's ID.
     It produces a signed string like "eyJhbGciOiJIUzI1NiIs..." that encodes
     {"sub": "<user_id>", "exp": <expiry_timestamp>}.
  2. The frontend stores this token (in localStorage) and sends it on every
     request as `Authorization: Bearer <token>`.
  3. `decode_access_token()` verifies the signature and expiry. If valid, it
     returns the payload; if invalid/expired, it returns None and the
     dependency in dependencies.py raises a 401.

Because the token is signed (not encrypted) with JWT_SECRET_KEY, the server
can verify it wasn't tampered with, without needing to look anything up in a
database or session store — this is what makes JWT auth "stateless".
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

from jose import jwt, JWTError

from app.config import settings


def create_access_token(user_id: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.JWT_EXPIRE_MINUTES)
    payload = {"sub": user_id, "exp": expire}
    token = jwt.encode(payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return token


def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None
