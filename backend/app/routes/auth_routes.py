"""
Authentication routes.

Endpoints:
  POST /api/auth/signup  -> create account, return JWT + user
  POST /api/auth/login   -> verify credentials, return JWT + user
  POST /api/auth/logout  -> stateless logout (see note below)
  GET  /api/auth/me      -> return the currently authenticated user

Note on logout with stateless JWT:
  Since we don't store sessions server-side, the server can't "invalidate"
  a token early — it's valid until it expires (7 days) regardless. True
  logout happens on the frontend by deleting the token from localStorage.
  This /logout endpoint exists for a consistent API and so the frontend has
  a single place to call before clearing local state (and so it would be
  trivial to add a server-side token blocklist later if needed).
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database.connection import get_db
from app.schemas.user_schema import UserSignup, UserLogin, TokenResponse, UserResponse
from app.services.auth_service import signup_user, login_user
from app.auth.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/signup", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def signup(payload: UserSignup, db: Session = Depends(get_db)):
    user, token = signup_user(db, payload)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/login", response_model=TokenResponse)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    user, token = login_user(db, payload)
    return TokenResponse(access_token=token, user=UserResponse.model_validate(user))


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(current_user: User = Depends(get_current_user)):
    # Nothing to do server-side (see module docstring). Confirms the token
    # was valid, then the frontend clears it from localStorage.
    return {"message": "Logged out successfully."}


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
