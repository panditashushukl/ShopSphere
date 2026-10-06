"""
Orders API Presentation Endpoint Router.
Handles order creation, validation, and history retrieval via OrderService.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, require_authenticated_user
from app.models.user import User
from app.schemas.order import OrderCreate
from app.services.order_service import order_service
from app.core.response import success_response

router = APIRouter(prefix="/orders", tags=["orders"])


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_order(
    data: OrderCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_authenticated_user)
):
    """Place a new order with role validation and server-side pricing."""
    order = await order_service.create_order(db, user, data)
    return success_response(
        data=order.model_dump(),
        message="Order created successfully",
        status_code=status.HTTP_201_CREATED
    )


@router.get("")
async def get_my_orders(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_authenticated_user)
):
    """Retrieve list of orders placed by authenticated user."""
    orders = await order_service.list_user_orders(db, user)
    return success_response(
        data=[o.model_dump() for o in orders],
        message="User orders retrieved successfully"
    )
