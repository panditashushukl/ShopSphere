"""
Pydantic v2 Schemas for Product Domain Entities.
Provides strict Create, Update, Response, and InDB representations with multi-image support.
"""

from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict


class ProductBase(BaseModel):
    sku: str = Field(..., min_length=2, max_length=40, description="Unique product SKU")
    title: str = Field(..., min_length=1, max_length=200, description="Product title")
    description: str = Field(default="", max_length=2000, description="Product description")
    stock: int = Field(default=0, ge=0, description="Available stock quantity")
    retail_price: float = Field(..., gt=0, description="B2C Retail Price")
    trade_price: float = Field(..., gt=0, description="B2B Retailer Price")
    wholesale_price: float = Field(..., gt=0, description="B2B Wholesaler Bulk Price")
    moq: int = Field(default=50, ge=1, description="Minimum order quantity for wholesale")
    primary_image: str = Field(
        default="https://images.unsplash.com/photo-1505740420928-5e560c06d30e",
        description="Primary catalog image URL"
    )
    gallery_images: List[str] = Field(default_factory=list, description="Secondary gallery image URLs")


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    title: Optional[str] = Field(default=None, max_length=200)
    description: Optional[str] = Field(default=None, max_length=2000)
    stock: Optional[int] = Field(default=None, ge=0)
    retail_price: Optional[float] = Field(default=None, gt=0)
    trade_price: Optional[float] = Field(default=None, gt=0)
    wholesale_price: Optional[float] = Field(default=None, gt=0)
    moq: Optional[int] = Field(default=None, ge=1)
    primary_image: Optional[str] = Field(default=None, max_length=500)
    gallery_images: Optional[List[str]] = Field(default=None)


class ProductResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    sku: str
    title: str
    description: str
    stock: int
    price: Optional[float] = None
    retail_price: Optional[float] = None
    trade_price: Optional[float] = None
    wholesale_price: Optional[float] = None
    min_order_quantity: Optional[int] = None
    primary_image: str = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
    gallery_images: List[str] = Field(default_factory=list)


class ProductInDB(ProductBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
