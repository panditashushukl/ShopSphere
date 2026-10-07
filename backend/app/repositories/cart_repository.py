"""
CartItem Data Access Layer Repository.
"""

from typing import Optional, Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.models.cart import CartItem
from app.repositories.base import BaseRepository


class CartRepository(BaseRepository[CartItem]):
    def __init__(self):
        super().__init__(CartItem)

    async def get_cart_item(
        self,
        db: AsyncSession,
        user_id: str,
        product_id: int
    ) -> Optional[CartItem]:
        stmt = select(CartItem).where(
            CartItem.user_id == str(user_id),
            CartItem.product_id == product_id
        )
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_user_cart(
        self,
        db: AsyncSession,
        user_id: str
    ) -> Sequence[CartItem]:
        stmt = select(CartItem).where(CartItem.user_id == str(user_id)).order_by(CartItem.id.asc())
        result = await db.execute(stmt)
        return result.scalars().all()

    async def remove_cart_item(
        self,
        db: AsyncSession,
        user_id: str,
        product_id: int
    ) -> bool:
        stmt = delete(CartItem).where(
            CartItem.user_id == str(user_id),
            CartItem.product_id == product_id
        )
        result = await db.execute(stmt)
        await db.commit()
        return result.rowcount > 0

    async def clear_user_cart(
        self,
        db: AsyncSession,
        user_id: str
    ) -> None:
        stmt = delete(CartItem).where(CartItem.user_id == str(user_id))
        await db.execute(stmt)
        await db.commit()


cart_repository = CartRepository()


