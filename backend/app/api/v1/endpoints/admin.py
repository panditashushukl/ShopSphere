"""
Admin API Presentation Endpoint Router.
Handles admin dashboard operations, user verifications, metrics, and status updates via AdminService.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, require_role
from app.schemas.admin import AdminUserUpdate, AdminOrderStatusUpdate
from app.services.admin_service import admin_service
from app.core.response import success_response

router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(require_role(["SUPER_ADMIN"]))]
)


@router.get("/metrics")
async def get_dashboard_metrics(db: AsyncSession = Depends(get_db)):
    """Retrieve platform revenue and order count metrics by order type."""
    metrics = await admin_service.get_metrics(db)
    return success_response(
        data=metrics,
        message="Admin metrics retrieved successfully"
    )


@router.get("/users")
async def list_all_users(db: AsyncSession = Depends(get_db)):
    """List all registered users."""
    users = await admin_service.list_all_users(db)
    return success_response(
        data=[u.model_dump() for u in users],
        message="User list retrieved successfully"
    )


@router.patch("/users/{uid}")
async def update_user(
    uid: int,
    data: AdminUserUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update role or verification status of a user."""
    user = await admin_service.update_user(db, uid, data)
    return success_response(
        data=user.model_dump(),
        message="User updated successfully"
    )


@router.patch("/orders/{oid}/status")
async def set_order_status(
    oid: int,
    data: AdminOrderStatusUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update fulfillment status of an order."""
    order = await admin_service.update_order_status(db, oid, data.status)
    return success_response(
        data=order.model_dump(),
        message="Order status updated successfully"
    )
