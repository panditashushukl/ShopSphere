"""
Pydantic v2 Schemas for User Domain Entities.
Provides strict Create, Update, Response, and InDB representations.
"""

from typing import Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, field_validator
import re
from app.models.user import Role


def clean_email(v: str) -> str:
    if not isinstance(v, str):
        raise ValueError("Email must be a valid string")
    v = v.strip().lower()
    if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", v):
        raise ValueError("Invalid email address format")
    return v


class UserBase(BaseModel):
    email: str = Field(..., description="Unique email address")
    full_name: str = Field(..., min_length=1, max_length=120, description="Full display name")
    role: Role = Field(default=Role.CUSTOMER, description="User RBAC role")
    avatar_url: Optional[str] = Field(default=None, max_length=500, description="Profile picture URL")

    @field_validator("email", mode="before")
    def validate_email_str(cls, v: str) -> str:
        return clean_email(v)


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, description="User password (min 8 characters)")
    account_type: Role = Field(default=Role.CUSTOMER, description="Account role requested during registration")


class UserLogin(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="User password")

    @field_validator("email", mode="before")
    def validate_email_str(cls, v: str) -> str:
        return clean_email(v)


class UserUpdate(BaseModel):
    full_name: Optional[str] = Field(default=None, max_length=120)
    role: Optional[Role] = Field(default=None)
    avatar_url: Optional[str] = Field(default=None, max_length=500)
    is_verified: Optional[bool] = Field(default=None)


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    email: str
    full_name: str
    role: Role
    avatar_url: Optional[str] = None
    is_verified: bool
    created_at: Optional[datetime] = None
    access_token: Optional[str] = None
    token_type: Optional[str] = "bearer"


class UserInDB(UserResponse):
    hashed_password: str
