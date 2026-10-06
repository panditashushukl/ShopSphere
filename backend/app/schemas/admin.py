"""
Pydantic v2 Schemas for Admin Dashboard Operations.
"""

from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from app.models.user import Role
from app.models.order import OrderStatus


class AdminUserUpdate(BaseModel):
    role: Optional[Role] = Field(default=None)
    is_verified: Optional[bool] = Field(default=None)


class AdminOrderStatusUpdate(BaseModel):
    status: OrderStatus = Field(...)


class MetricItem(BaseModel):
    revenue: float
    orders: int


class AdminMetricsResponse(BaseModel):
    metrics: Dict[str, MetricItem]
