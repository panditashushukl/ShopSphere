"""
SQLAlchemy 2.0 ORM Model for User Entity.
Uses strict typing with Mapped[...] and mapped_column(...).
Includes optional avatar_url profile picture string.
"""

import enum
from typing import Optional
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, Enum, func
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Role(str, enum.Enum):
    SUPER_ADMIN = "SUPER_ADMIN"
    WHOLESALER = "WHOLESALER"
    RETAILER = "RETAILER"
    CUSTOMER = "CUSTOMER"


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(120), nullable=False)
    role: Mapped[Role] = mapped_column(Enum(Role), default=Role.CUSTOMER, nullable=False)
    avatar_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
