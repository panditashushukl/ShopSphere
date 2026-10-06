"""
Order Domain Service Layer.
Manages transaction validation, stock checks, minimum order quantities, and server-side pricing snapshots.
"""

from typing import List
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, Role
from app.models.order import Order, OrderItem, OrderType, OrderStatus
from app.models.product import Product
from app.schemas.order import OrderCreate, OrderResponse
from app.repositories.order_repository import order_repository
from app.repositories.product_repository import product_repository
from app.core.exceptions import (
    EntityNotFoundError, ForbiddenRoleError, InsufficientStockError, MinimumOrderQuantityError
)


class OrderService:
    """Business logic for Order creation, stock deduction, and user order querying."""

    async def create_order(self, db: AsyncSession, user: User, data: OrderCreate) -> OrderResponse:
        """Executes order placement with strict role validation and server-side price calculation."""
        if user.role in (Role.RETAILER, Role.WHOLESALER) and not user.is_verified:
            raise ForbiddenRoleError("Account pending admin approval.")

        order_type_map = {
            Role.WHOLESALER: OrderType.WHOLESALER,
            Role.RETAILER: OrderType.RETAILER
        }
        order_type = order_type_map.get(user.role, OrderType.B2C)

        order = Order(
            user_id=user.id,
            order_type=order_type,
            status=OrderStatus.PENDING,
            total=0.0
        )

        total_amount = 0.0

        for item_in in data.items:
            product = await product_repository.get_by_id(db, item_in.product_id)
            if not product:
                raise EntityNotFoundError("Product", item_in.product_id)

            if user.role == Role.WHOLESALER and item_in.quantity < product.moq:
                raise MinimumOrderQuantityError(product.sku, product.moq, item_in.quantity)

            if product.stock < item_in.quantity:
                raise InsufficientStockError(product.sku, item_in.quantity, product.stock)

            # Prices are strictly calculated server-side based on user role
            if user.role == Role.WHOLESALER:
                unit_price = product.wholesale_price
            elif user.role == Role.RETAILER:
                unit_price = product.trade_price
            else:
                unit_price = product.retail_price

            product.stock -= item_in.quantity
            total_amount += unit_price * item_in.quantity

            order.items.append(
                OrderItem(
                    product_id=product.id,
                    quantity=item_in.quantity,
                    unit_price=unit_price
                )
            )

        order.total = round(total_amount, 2)
        order = await order_repository.create(db, order)
        return OrderResponse.model_validate(order)

    async def list_user_orders(self, db: AsyncSession, user: User) -> List[OrderResponse]:
        """List orders placed by authenticated user."""
        orders = await order_repository.list_by_user_id(db, user.id)
        return [OrderResponse.model_validate(o) for o in orders]


order_service = OrderService()
