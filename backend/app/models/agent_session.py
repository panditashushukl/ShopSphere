"""
SQLAlchemy 2.0 ORM Models for Agent Sessions and Conversation History.
Uses strict typing with Mapped[...] and mapped_column(...).
"""

from datetime import datetime
from typing import List, Optional
from sqlalchemy import String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class AgentSession(Base):
    """SQLAlchemy model representing an AI Agent conversation thread session."""
    __tablename__ = "agent_sessions"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    thread_id: Mapped[str] = mapped_column(String(64), unique=True, index=True, nullable=False)
    user_id: Mapped[str] = mapped_column(String(64), default="guest", index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(128), default="New Session", nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    messages: Mapped[List["AgentMessage"]] = relationship(
        "AgentMessage",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="AgentMessage.id"
    )


class AgentMessage(Base):
    """SQLAlchemy model representing individual user and agent messages within a thread session."""
    __tablename__ = "agent_messages"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    thread_id: Mapped[str] = mapped_column(
        String(64),
        ForeignKey("agent_sessions.thread_id", ondelete="CASCADE"),
        index=True,
        nullable=False
    )
    sender: Mapped[str] = mapped_column(String(16), nullable=False)  # "user" or "agent"
    text: Mapped[str] = mapped_column(Text, nullable=False)
    timestamp: Mapped[str] = mapped_column(String(32), nullable=False)
    metadata_json: Mapped[Optional[str]] = mapped_column(Text, default="{}")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    session: Mapped["AgentSession"] = relationship("AgentSession", back_populates="messages")
