"""
Authentication dependency for protected routes.

Usage in any route:
    from app.auth.dependencies import get_current_user

    @router.get("/some-protected-thing")
    def my_route(current_user: User = Depends(get_current_user)):
        # current_user is guaranteed to be a valid, logged-in User here.
        ...

FastAPI's `Depends()` mechanism runs this function before the route body.
`OAuth2PasswordBearer` tells FastAPI/Swagger how to extract the bearer token
from the `Authorization: Bearer <token>` header (and also powers the "Authorize"
button in the /docs UI).
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.auth.jwt_handler import decode_access_token
from app.models.user import User

# tokenUrl points at our login endpoint, purely for documentation purposes in /docs.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials. Please log in again.",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = decode_access_token(token)
    if payload is None:
        raise credentials_exception

    user_id = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    return user
