"""
Agent Session & Message Data Access Layer Repository.
"""

from typing import Optional, Sequence, List
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.agent_session import AgentSession, AgentMessage
from app.repositories.base import BaseRepository


class AgentRepository(BaseRepository[AgentSession]):
    def __init__(self):
        super().__init__(AgentSession)

    async def get_by_thread_id(self, db: AsyncSession, thread_id: str) -> Optional[AgentSession]:
        stmt = select(AgentSession).where(AgentSession.thread_id == thread_id)
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_sessions_for_user(self, db: AsyncSession, user_id: str) -> Sequence[AgentSession]:
        stmt = (
            select(AgentSession)
            .where((AgentSession.user_id == str(user_id)) | (AgentSession.user_id == "guest"))
            .order_by(AgentSession.created_at.desc())
        )
        result = await db.execute(stmt)
        return result.scalars().all()

    async def get_messages_for_thread(self, db: AsyncSession, thread_id: str) -> Sequence[AgentMessage]:
        stmt = (
            select(AgentMessage)
            .where(AgentMessage.thread_id == thread_id)
            .order_by(AgentMessage.id.asc())
        )
        result = await db.execute(stmt)
        return result.scalars().all()


agent_repository = AgentRepository()
