"""
FastAPI Presentation Endpoint Router for DB Cart Operations.
Allows fetching, adding, updating, and clearing persistent database cart items.
"""

from typing import List, Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_db, get_user_id_str
from app.services.cart_service import cart_service
from app.core.response import success_response


class AddCartItemPayload(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1)


router = APIRouter(prefix="/cart", tags=["cart"])


@router.get("")
async def get_db_cart(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_user_id_str)
):
    """Retrieve all persisted cart items from database for user or unique guest session."""
    cart_items = await cart_service.get_cart(db, user_id=user_id)
    items_data = [
        {
            "id": ci.id,
            "product_id": ci.product_id,
            "sku": ci.product.sku if ci.product else "",
            "title": ci.product.title if ci.product else "",
            "price": ci.product.retail_price if ci.product else 0.0,
            "quantity": ci.quantity,
            "moq": ci.product.moq if ci.product else 1,
            "image": ci.product.primary_image if ci.product else ""
        }
        for ci in cart_items if ci.product
    ]
    return success_response(data=items_data, message="Cart retrieved successfully")


@router.post("", status_code=status.HTTP_201_CREATED)
async def add_item_to_db_cart(
    payload: AddCartItemPayload,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_user_id_str)
):
    """Add or increment product quantity in the database cart."""
    created = await cart_service.add_to_cart(
        db,
        user_id=user_id,
        product_id=payload.product_id,
        quantity=payload.quantity
    )
    return success_response(
        data={
            "id": created.id,
            "product_id": created.product_id,
            "quantity": created.quantity
        },
        message="Item added to cart",
        status_code=status.HTTP_201_CREATED
    )


@router.delete("/{product_id}")
async def remove_item_from_db_cart(
    product_id: int,
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_user_id_str)
):
    """Remove a single product from the database cart."""
    removed = await cart_service.remove_from_cart(
        db, user_id=user_id, product_id=product_id
    )
    return success_response(data={"removed": removed}, message="Item removed from cart")


@router.delete("")
async def clear_db_cart(
    db: AsyncSession = Depends(get_db),
    user_id: str = Depends(get_user_id_str)
):
    """Clear all persisted items in the database cart."""
    await cart_service.clear_cart(db, user_id=user_id)
    return success_response(data=None, message="Cart cleared successfully")

