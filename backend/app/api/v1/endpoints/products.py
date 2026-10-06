"""
Products API Presentation Endpoint Router.
Handles catalog browsing, query parameters, role-aware projections via ProductService.
"""

from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, optional_user, require_role
from app.models.user import User, Role
from app.schemas.product import ProductCreate, ProductUpdate
from app.services.product_service import product_service
from app.core.response import success_response

router = APIRouter(prefix="/products", tags=["products"])


@router.get("")
async def list_products(
    q: Optional[str] = None,
    sort: str = Query("title", pattern="^(title|stock|id)$"),
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(optional_user)
):
    """List products with role-aware pricing projections."""
    products = await product_service.list_products(db, query=q, sort_by=sort, user=user)
    return success_response(
        data=[p.model_dump() for p in products],
        message="Product catalog retrieved successfully"
    )


@router.get("/{pid}")
async def get_product(
    pid: int,
    db: AsyncSession = Depends(get_db),
    user: Optional[User] = Depends(optional_user)
):
    """Get product details by ID with role-aware pricing projection."""
    product = await product_service.get_product_by_id(db, pid, user=user)
    return success_response(
        data=product.model_dump(),
        message="Product details retrieved successfully"
    )


@router.post("", status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_role(["WHOLESALER", "RETAILER", "SUPER_ADMIN"]))])
async def create_product(
    data: ProductCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new catalog product (Wholesalers / Retailers / Admins)."""
    product = await product_service.create_product(db, data)
    return success_response(
        data=product.model_dump(),
        message="Product created successfully",
        status_code=status.HTTP_201_CREATED
    )


@router.patch("/{pid}", dependencies=[Depends(require_role(["WHOLESALER", "RETAILER", "SUPER_ADMIN"]))])
async def update_product(
    pid: int,
    data: ProductUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update catalog product details (Wholesalers / Retailers / Admins)."""
    product = await product_service.update_product(db, pid, data)
    return success_response(
        data=product.model_dump(),
        message="Product updated successfully"
    )


@router.patch("/{pid}/stock", dependencies=[Depends(require_role(["WHOLESALER", "RETAILER", "SUPER_ADMIN"]))])
async def update_stock(
    pid: int,
    new_stock: int = Query(..., ge=0),
    db: AsyncSession = Depends(get_db)
):
    """Update stock quantity for a product."""
    product = await product_service.update_stock(db, pid, new_stock)
    return success_response(
        data=product.model_dump(),
        message="Stock level updated successfully"
    )

