"""
Pydantic schemas for the User resource.

These define the *shape* of data going in/out of the API — separate from
the SQLAlchemy model (which defines the database table). This separation
matters for security: UserResponse deliberately excludes hashed_password,
so even if a developer accidentally returns the full ORM object, FastAPI's
response_model filtering strips the password hash before it reaches the client.
"""

import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field


class UserSignup(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6, max_length=72)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: uuid.UUID
    full_name: str
    email: EmailStr
    created_at: datetime

    class Config:
        from_attributes = True  # allows creating this schema directly from an ORM object


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
