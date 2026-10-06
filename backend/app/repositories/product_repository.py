"""
Product Data Access Layer Repository.
"""

from decimal import Decimal
from typing import Optional, Sequence
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, asc, desc
from app.models.product import Product
from app.repositories.base import BaseRepository


class ProductRepository(BaseRepository[Product]):
    def __init__(self):
        super().__init__(Product)

    async def get_by_sku(self, db: AsyncSession, sku: str) -> Optional[Product]:
        stmt = select(Product).where(Product.sku == sku.strip())
        result = await db.execute(stmt)
        return result.scalar_one_or_none()

    async def search_products(
        self,
        db: AsyncSession,
        query: Optional[str] = None,
        sort_by: str = "title"
    ) -> Sequence[Product]:
        sort_column = getattr(Product, sort_by, Product.title)
        stmt = select(Product).order_by(sort_column)

        if query:
            q_pattern = f"%{query.strip()}%"
            stmt = stmt.where(or_(Product.title.ilike(q_pattern), Product.sku.ilike(q_pattern)))

        result = await db.execute(stmt)
        return result.scalars().all()

    # Price Search repository

    async def search_by_price(
        self,
        db: AsyncSession,
        *,
        min_price: Decimal | None = None,
        max_price: Decimal | None = None,
        category: str | None = None,
        sort_by: str = "price_asc",
        limit: int = 10,
    ) -> list[Product]:

        stmt = select(Product)

        if min_price is not None:
            stmt = stmt.where(Product.retail_price >= float(min_price))

        if max_price is not None:
            stmt = stmt.where(Product.retail_price <= float(max_price))

        if category is not None and category.strip():
            cat_pattern = f"%{category.strip()}%"
            stmt = stmt.where(
                or_(Product.title.ilike(cat_pattern), Product.description.ilike(cat_pattern))
            )

        # Stable sorting: the ID breaks ties between equal prices.
        if sort_by == "price_desc":
            stmt = stmt.order_by(
                desc(Product.retail_price),
                asc(Product.id),
            )
        else:
            stmt = stmt.order_by(
                asc(Product.retail_price),
                asc(Product.id),
            )

        stmt = stmt.limit(limit)

        result = await db.execute(stmt)
        return list(result.scalars().all())
product_repository = ProductRepository()
