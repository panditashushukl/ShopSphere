"""
User Data Access Layer Repository.
"""

from typing import Optional, Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.user import User, Role
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self):
        super().__init__(User)

    async def get_by_email(self, db: AsyncSession, email: str) -> Optional[User]:
        stmt = select(User).where(User.email == email.strip().lower())
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def list_users(self, db: AsyncSession) -> Sequence[User]:
        stmt = select(User).order_by(User.id.asc())
        result = await db.execute(stmt)
        return result.scalars().all()


user_repository = UserRepository()
