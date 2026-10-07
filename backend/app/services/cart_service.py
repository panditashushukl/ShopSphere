"""
Service layer for DB-backed shopping cart operations.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.cart import CartItem
from app.repositories.cart_repository import cart_repository
from app.repositories.product_repository import product_repository
from app.core.exceptions import EntityNotFoundError, InsufficientStockError, MinimumOrderQuantityError


class CartService:

    async def add_to_cart(
        self,
        db: AsyncSession,
        user_id: str,
        product_id: int,
        quantity: int
    ) -> CartItem:
        product = await product_repository.get_by_id(db, product_id)
        if not product:
            raise EntityNotFoundError("Product", product_id)

        if product.moq and quantity < product.moq:
            raise MinimumOrderQuantityError(product.sku, product.moq, quantity)

        if product.stock < quantity:
            raise InsufficientStockError(product.sku, quantity, product.stock)

        existing = await cart_repository.get_cart_item(db, user_id=user_id, product_id=product_id)
        if existing:
            existing.quantity += quantity
            if existing.quantity > product.stock:
                existing.quantity = product.stock
            db.add(existing)
            await db.commit()
            await db.refresh(existing)
            return existing
        else:
            new_item = CartItem(
                user_id=str(user_id),
                product_id=product_id,
                quantity=quantity
            )
            created = await cart_repository.create(db, new_item)
            return created

    async def remove_from_cart(
        self,
        db: AsyncSession,
        user_id: str,
        product_id: int
    ) -> bool:
        return await cart_repository.remove_cart_item(db, user_id=user_id, product_id=product_id)

    async def get_cart(self, db: AsyncSession, user_id: str) -> List[CartItem]:
        return list(await cart_repository.get_user_cart(db, user_id=user_id))

    async def clear_cart(self, db: AsyncSession, user_id: str) -> None:
        await cart_repository.clear_user_cart(db, user_id=user_id)


cart_service = CartService()
