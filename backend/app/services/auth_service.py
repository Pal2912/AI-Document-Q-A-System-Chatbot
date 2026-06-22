"""
Authentication business logic.

Routes (auth_routes.py) call into these functions rather than containing
the logic themselves. This separation makes the logic reusable and testable
independent of HTTP/FastAPI.
"""

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.user_schema import UserSignup, UserLogin
from app.auth.password_handler import hash_password, verify_password
from app.auth.jwt_handler import create_access_token


def signup_user(db: Session, payload: UserSignup) -> tuple[User, str]:
    """Creates a new user. Raises 400 if the email is already registered."""
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email already exists.",
        )

    new_user = User(
        full_name=payload.full_name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(user_id=str(new_user.id))
    return new_user, token


def login_user(db: Session, payload: UserLogin) -> tuple[User, str]:
    """Validates credentials and returns the user + a fresh JWT. Raises 401 if invalid."""
    user = db.query(User).filter(User.email == payload.email).first()

    invalid_credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Incorrect email or password.",
    )

    if not user:
        raise invalid_credentials_error

    if not verify_password(payload.password, user.hashed_password):
        raise invalid_credentials_error

    token = create_access_token(user_id=str(user.id))
    return user, token
