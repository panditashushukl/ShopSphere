"""
Admin Operations Domain Service Layer.
Handles revenue metrics aggregation, user management, and order status updates.
"""

from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import Role
from app.models.order import OrderStatus
from app.schemas.user import UserResponse
from app.schemas.admin import AdminUserUpdate, MetricItem, AdminMetricsResponse
from app.schemas.order import OrderResponse
from app.repositories.user_repository import user_repository
from app.repositories.order_repository import order_repository
from app.core.exceptions import EntityNotFoundError


class AdminService:
    """Business logic for Super Admin administrative tasks."""

    async def get_metrics(self, db: AsyncSession) -> Dict[str, Any]:
        """Aggregate total revenue and order counts grouped by order type."""
        rows = await order_repository.get_admin_metrics(db)
        metrics_data = {}
        for order_type, rev_sum, order_count in rows:
            metrics_data[order_type.value] = {
                "revenue": round(rev_sum or 0.0, 2),
                "orders": order_count
            }
        return metrics_data

    async def list_all_users(self, db: AsyncSession) -> List[UserResponse]:
        """Fetch all registered users for admin dashboard."""
        users = await user_repository.list_users(db)
        return [UserResponse.model_validate(u) for u in users]

    async def update_user(self, db: AsyncSession, uid: int, data: AdminUserUpdate) -> UserResponse:
        """Update role or verification status of a user."""
        user = await user_repository.get_by_id(db, uid)
        if not user:
            raise EntityNotFoundError("User", uid)

        update_dict = {}
        if data.role is not None:
            update_dict["role"] = data.role
        if data.is_verified is not None:
            update_dict["is_verified"] = data.is_verified

        user = await user_repository.update(db, user, update_dict)
        return UserResponse.model_validate(user)

    async def update_order_status(self, db: AsyncSession, oid: int, status: OrderStatus) -> OrderResponse:
        """Update order fulfillment status."""
        order = await order_repository.get_by_id(db, oid)
        if not order:
            raise EntityNotFoundError("Order", oid)

        order = await order_repository.update(db, order, {"status": status})
        return OrderResponse.model_validate(order)


admin_service = AdminService()
