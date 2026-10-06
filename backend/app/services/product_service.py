"""
Product Domain Service Layer.
Manages catalog search, role-aware price projections, inventory updates, and listings.
"""

from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.product import Product
from app.models.user import User, Role
from app.schemas.product import ProductResponse, ProductCreate, ProductUpdate
from app.repositories.product_repository import product_repository
from app.core.exceptions import EntityNotFoundError, DuplicateEntityError


class ProductService:
    """Business logic for Product operations and role-aware price projections."""

    def project_product_for_role(self, product: Product, user: Optional[User] = None) -> ProductResponse:
        """Role-aware projection: price tiers are projected strictly based on user role."""
        role = user.role if user else Role.CUSTOMER

        resp_dict = {
            "id": product.id,
            "sku": product.sku,
            "title": product.title,
            "description": product.description,
            "stock": product.stock,
            "primary_image": product.primary_image or "https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
            "gallery_images": product.gallery_images or [],
            "created_at": product.created_at
        }

        if role == Role.SUPER_ADMIN:
            resp_dict.update({
                "retail_price": product.retail_price,
                "trade_price": product.trade_price,
                "wholesale_price": product.wholesale_price,
                "min_order_quantity": product.moq
            })
        elif role == Role.WHOLESALER:
            resp_dict.update({
                "price": product.wholesale_price,
                "min_order_quantity": product.moq
            })
        elif role == Role.RETAILER:
            resp_dict.update({
                "price": product.trade_price
            })
        else:
            resp_dict.update({
                "price": product.retail_price
            })

        return ProductResponse.model_validate(resp_dict)

    async def list_products(
        self,
        db: AsyncSession,
        query: Optional[str] = None,
        sort_by: str = "title",
        user: Optional[User] = None
    ) -> List[ProductResponse]:
        """Fetch and project products based on search parameters and user role."""
        products = await product_repository.search_products(db, query=query, sort_by=sort_by)
        return [self.project_product_for_role(p, user) for p in products]

    async def get_product_by_id(
        self,
        db: AsyncSession,
        product_id: int,
        user: Optional[User] = None
    ) -> ProductResponse:
        """Fetch single product by ID with role-aware projection."""
        product = await product_repository.get_by_id(db, product_id)
        if not product:
            raise EntityNotFoundError("Product", product_id)
        return self.project_product_for_role(product, user)

    async def create_product(self, db: AsyncSession, data: ProductCreate) -> ProductResponse:
        """List a new product in the catalog."""
        existing = await product_repository.get_by_sku(db, data.sku)
        if existing:
            raise DuplicateEntityError("Product", "sku", data.sku)

        product = Product(
            sku=data.sku,
            title=data.title,
            description=data.description,
            stock=data.stock,
            retail_price=data.retail_price,
            trade_price=data.trade_price,
            wholesale_price=data.wholesale_price,
            moq=data.moq,
            primary_image=data.primary_image,
            gallery_images=data.gallery_images
        )
        product = await product_repository.create(db, product)
        return ProductResponse.model_validate(product)

    async def update_stock(self, db: AsyncSession, product_id: int, new_stock: int) -> ProductResponse:
        """Update stock quantity for a product."""
        product = await product_repository.get_by_id(db, product_id)
        if not product:
            raise EntityNotFoundError("Product", product_id)

        product = await product_repository.update(db, product, {"stock": new_stock})
        return ProductResponse.model_validate(product)

    async def update_product(self, db: AsyncSession, product_id: int, data: ProductUpdate) -> ProductResponse:
        """Update product catalog details (Prices, stock, title, images)."""
        product = await product_repository.get_by_id(db, product_id)
        if not product:
            raise EntityNotFoundError("Product", product_id)

        update_data = data.model_dump(exclude_unset=True)
        product = await product_repository.update(db, product, update_data)
        return ProductResponse.model_validate(product)


product_service = ProductService()
