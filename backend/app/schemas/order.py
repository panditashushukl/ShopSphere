"""
Pydantic v2 Schemas for Order Domain Entities.
Provides strict Create, Update, Response, and InDB representations.
"""

from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict
from app.models.order import OrderStatus, OrderType


class OrderItemCreate(BaseModel):
    product_id: int = Field(..., gt=0, description="Product ID")
    quantity: int = Field(..., gt=0, description="Quantity to purchase")


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_id: int
    quantity: int
    unit_price: float


class OrderCreate(BaseModel):
    items: List[OrderItemCreate] = Field(..., min_length=1, description="Order line items")


class OrderUpdateStatus(BaseModel):
    status: OrderStatus = Field(..., description="New order status")


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    order_type: OrderType
    status: OrderStatus
    total: float
    created_at: datetime
    items: Optional[List[OrderItemResponse]] = None


class OrderInDB(OrderResponse):
    pass
