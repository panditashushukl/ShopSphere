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

    async def merge_guest_cart(self, db: AsyncSession, guest_id: str, target_user_id: str) -> None:
        guest_ids_to_check = {guest_id, "guest", "GUEST_USER"} - {str(target_user_id), None, ""}
        
        for g_id in guest_ids_to_check:
            guest_items = await self.get_user_cart(db, user_id=g_id)
            if not guest_items:
                continue

            for g_item in guest_items:
                existing = await self.get_cart_item(db, user_id=target_user_id, product_id=g_item.product_id)
                if existing:
                    existing.quantity += g_item.quantity
                    db.add(existing)
                else:
                    new_item = CartItem(
                        user_id=str(target_user_id),
                        product_id=g_item.product_id,
                        quantity=g_item.quantity
                    )
                    db.add(new_item)

            await self.clear_user_cart(db, user_id=g_id)
        
        await db.commit()


cart_repository = CartRepository()


