"""
Industry-standard Pydantic v2 Schemas for AI Agent operations and Tool Contracts.
Provides clean DTOs for agent queries, streaming, sessions, messages, and tool arguments/outputs.
"""

from typing import List, Dict, Any, Optional, Literal
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict, model_validator
from decimal import Decimal
from enum import Enum


class AgentQueryRequest(BaseModel):
    model_config = ConfigDict(extra="ignore")

    message: str = Field(..., min_length=1, description="User prompt or instruction for AI agent")
    thread_id: Optional[str] = Field(default="session_default", description="Conversation thread session ID")


class AgentQueryResponse(BaseModel):
    model_config = ConfigDict(frozen=True)

    reply: str = Field(..., description="Agent plain text response")
    status: str = Field(default="success", description="Execution status")
    thread_id: str = Field(..., description="Associated conversation thread ID")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Turn execution metadata")


class AgentSessionCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")

    title: Optional[str] = Field(default="New Chat", description="Session thread title")


class AgentSessionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    thread_id: str
    user_id: str
    title: str
    created_at: datetime


class AgentMessageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    thread_id: str
    sender: str
    text: str
    timestamp: str
    metadata_json: Optional[str] = "{}"


class ToolDefinition(BaseModel):
    name: str = Field(..., description="Tool operation identifier")
    description: str = Field(..., description="Tool functional description")


# ============================================================================
# Agent Tool Input & Output Contracts (Pydantic v2)
# ============================================================================

class ListProductInput(BaseModel):
    title: str = Field(..., min_length=1, description="Name or title of product to list")
    sku: str = Field(..., min_length=2, description="Unique SKU barcode/identifier")
    price: float = Field(..., gt=0, description="Unit price for the listing")
    stock: int = Field(..., ge=0, description="Initial inventory stock quantity")
    description: Optional[str] = Field(default="", description="Detailed description")
    moq: Optional[int] = Field(default=50, ge=1, description="Minimum order quantity")


class UpdateStockInput(BaseModel):
    product_id: int = Field(..., gt=0, description="Database numeric ID of product to update")
    new_stock: int = Field(..., ge=0, description="New inventory count")


class SearchCatalogInput(BaseModel):
    query: str = Field(default="", description="Keyword search matching title or SKU")
    merchant_type: Optional[Literal["WHOLESALER", "RETAILER", "B2C"]] = Field(
        default=None, description="Optional merchant/pricing filter"
    )


class AddToCartInput(BaseModel):
    product_id: int = Field(..., gt=0, description="Database numeric ID of product to purchase")
    quantity: int = Field(..., gt=0, description="Quantity to add")


class CheckoutCartInput(BaseModel):
    items: List[AddToCartInput] = Field(..., min_length=1, description="Cart line items to checkout")
    shipping_address: Optional[str] = Field(default="Standard Ground Delivery", description="Shipping address")
    payment_method: Optional[str] = Field(default="CREDIT_CARD", description="Payment method")


class GetOrderStatusInput(BaseModel):
    order_id: int = Field(..., gt=0, description="Database numeric ID of order")


class ToolResultOutput(BaseModel):
    success: bool = Field(default=True, description="Status of tool execution")
    message: str = Field(..., description="Human-readable result summary")
    data: Optional[Any] = Field(default=None, description="Structured data returned by tool")

#-- Product Schema --

class ProductSort(str, Enum):
    PRICE_ASC = "price_asc"
    PRICE_DESC = "price_desc"


class SearchProductsByPriceInput(BaseModel):
    min_price: Optional[Decimal] = Field(
        default=None,
        ge=0,
        description="Minimum product price, inclusive."
    )
    max_price: Optional[Decimal] = Field(
        default=None,
        ge=0,
        description="Maximum product price, inclusive."
    )
    category: Optional[str] = Field(
        default=None,
        min_length=1,
        max_length=100,
        description="Optional product category."
    )
    sort_by: ProductSort = Field(
        default=ProductSort.PRICE_ASC,
        description="Sort products by ascending or descending price."
    )
    limit: int = Field(
        default=10,
        ge=1,
        le=50,
        description="Maximum number of products to return."
    )

    @model_validator(mode="after")
    def validate_price_range(self):
        if (
            self.min_price is not None
            and self.max_price is not None
            and self.min_price > self.max_price
        ):
            raise ValueError(
                "min_price must be less than or equal to max_price."
            )

        return self  