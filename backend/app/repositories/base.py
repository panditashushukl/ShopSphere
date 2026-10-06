"""
Generic Asynchronous Repository / Data Access Layer (DAL) Base Class.
Encapsulates raw SQLAlchemy 2.0 select, insert, update, and delete queries.
"""

from typing import Generic, TypeVar, Type, Optional, List, Any, Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update, delete, func
from app.core.database import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """Generic repository providing asynchronous CRUD operations for SQLAlchemy models."""

    def __init__(self, model: Type[ModelType]):
        self.model = model

    async def get_by_id(self, db: AsyncSession, id: Any) -> Optional[ModelType]:
        """Fetch entity by primary key ID."""
        return await db.get(self.model, id)

    async def list_all(
        self,
        db: AsyncSession,
        skip: int = 0,
        limit: int = 100,
        order_by: Optional[Any] = None
    ) -> Sequence[ModelType]:
        """Fetch paginated list of entities."""
        stmt = select(self.model).offset(skip).limit(limit)
        if order_by is not None:
            stmt = stmt.order_by(order_by)
        result = await db.execute(stmt)
        return result.scalars().all()

    async def count(self, db: AsyncSession) -> int:
        """Count total entities in table."""
        stmt = select(func.count()).select_from(self.model)
        result = await db.execute(stmt)
        return result.scalar() or 0

    async def create(self, db: AsyncSession, obj_in: ModelType) -> ModelType:
        """Insert entity into database session."""
        db.add(obj_in)
        await db.commit()
        await db.refresh(obj_in)
        return obj_in

    async def update(self, db: AsyncSession, db_obj: ModelType, update_data: dict[str, Any]) -> ModelType:
        """Update existing model attributes."""
        for field, value in update_data.items():
            if hasattr(db_obj, field) and value is not None:
                setattr(db_obj, field, value)
        db.add(db_obj)
        await db.commit()
        await db.refresh(db_obj)
        return db_obj

    async def delete(self, db: AsyncSession, id: Any) -> bool:
        """Delete entity by ID."""
        obj = await self.get_by_id(db, id)
        if obj:
            await db.delete(obj)
            await db.commit()
            return True
        return False
