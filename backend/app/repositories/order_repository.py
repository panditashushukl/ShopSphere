"""
Order & OrderItem Data Access Layer Repository.
"""

from typing import Optional, Sequence, Tuple, List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.models.order import Order, OrderItem, OrderStatus, OrderType
from app.repositories.base import BaseRepository


class OrderRepository(BaseRepository[Order]):
    def __init__(self):
        super().__init__(Order)

    async def list_by_user_id(self, db: AsyncSession, user_id: int) -> Sequence[Order]:
        stmt = select(Order).where(Order.user_id == user_id).order_by(Order.id.desc())
        result = await db.execute(stmt)
        return result.scalars().all()

    async def get_admin_metrics(self, db: AsyncSession) -> List[Tuple[OrderType, float, int]]:
        stmt = (
            select(Order.order_type, func.sum(Order.total), func.count())
            .where(Order.status != OrderStatus.CANCELLED)
            .group_by(Order.order_type)
        )
        result = await db.execute(stmt)
        return list(result.all())


order_repository = OrderRepository()
