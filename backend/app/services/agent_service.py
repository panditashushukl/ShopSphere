"""
Async Database Service Layer for Agent Session & Message Persistence.
Executes asynchronous SQLAlchemy queries for sessions and conversation history DTOs.
"""

import uuid
import json
from datetime import datetime, timezone
from typing import List, Optional, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.agent_session import AgentSession, AgentMessage
from app.schemas.agent import AgentSessionRead
from app.repositories.agent_repository import agent_repository


class AgentDBService:
    """Service class encapsulating async database operations for agent persistence."""

    async def get_or_create_session(
        self,
        db: AsyncSession,
        thread_id: str,
        user_id: str = "guest",
        title: str = "New Chat"
    ) -> AgentSession:
        """Retrieves an existing session by thread_id or creates one asynchronously."""
        session = await agent_repository.get_by_thread_id(db, thread_id)
        if not session:
            session = AgentSession(
                thread_id=thread_id,
                user_id=str(user_id),
                title=title
            )
            session = await agent_repository.create(db, session)
        return session

    async def create_session(
        self,
        db: AsyncSession,
        user_id: str = "guest",
        title: str = "New Chat"
    ) -> AgentSessionRead:
        """Creates a New Chat record in SQLite shop.db."""
        thread_id = f"session_{uuid.uuid4().hex[:8]}"
        session = AgentSession(
            thread_id=thread_id,
            user_id=str(user_id),
            title=title
        )
        session = await agent_repository.create(db, session)
        return AgentSessionRead.model_validate(session)

    async def list_sessions(self, db: AsyncSession, user_id: str = "guest") -> List[AgentSessionRead]:
        """Lists persistent sessions for a given user from shop.db."""
        sessions = await agent_repository.list_sessions_for_user(db, user_id)
        if not sessions:
            default_session = await self.create_session(db, user_id=user_id, title="Default Session")
            return [default_session]
        return [AgentSessionRead.model_validate(s) for s in sessions]

    async def save_message(
        self,
        db: AsyncSession,
        thread_id: str,
        sender: str,
        text: str,
        metadata: Optional[Dict[str, Any]] = None
    ) -> AgentMessage:
        """Saves a user or agent message into shop.db via SQLAlchemy."""
        session = await self.get_or_create_session(db, thread_id=thread_id)

        # Dynamic title update: If sender is user, update generic session title to prompt text snippet
        if sender == "user" and text and text.strip():
            clean_prompt = text.strip()
            if session.title in ("New Session", "Default Session", "New Chat") or session.title.startswith("Procurement Session"):
                session.title = clean_prompt[:32] + ("..." if len(clean_prompt) > 32 else "")
                db.add(session)

        timestamp_str = datetime.now(timezone.utc).strftime("%I:%M %p")
        metadata_json = json.dumps(metadata or {})

        message = AgentMessage(
            thread_id=thread_id,
            sender=sender,
            text=text,
            timestamp=timestamp_str,
            metadata_json=metadata_json
        )
        db.add(message)
        await db.commit()
        await db.refresh(message)
        return message

    async def get_session_messages(self, db: AsyncSession, thread_id: str) -> List[Dict[str, Any]]:
        """Retrieves formatted message DTOs for a thread session from shop.db."""
        messages = await agent_repository.get_messages_for_thread(db, thread_id)
        output = []
        for msg in messages:
            meta = {}
            if msg.metadata_json:
                try:
                    meta = json.loads(msg.metadata_json)
                except Exception:
                    pass
            output.append({
                "id": f"msg_{msg.id}",
                "thread_id": msg.thread_id,
                "sender": msg.sender,
                "text": msg.text,
                "timestamp": msg.timestamp,
                "metadata": meta
            })
        return output

    async def clear_user_sessions(self, db: AsyncSession, user_id: str = "guest") -> None:
        """Deletes all persistent sessions and chat history for a given user."""
        await agent_repository.delete_all_user_sessions(db, user_id)


agent_db_service = AgentDBService()
