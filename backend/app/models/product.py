"""
SQLAlchemy 2.0 ORM Model for Product Entity.
Uses strict typing with Mapped[...] and mapped_column(...).
Includes primary_image string and gallery_images JSON list deck.
"""

from datetime import datetime
from typing import List
from sqlalchemy import String, Float, Integer, DateTime, JSON, func
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    sku: Mapped[str] = mapped_column(String(40), unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String(200), index=True, nullable=False)
    description: Mapped[str] = mapped_column(String(2000), default="", nullable=False)
    stock: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    retail_price: Mapped[float] = mapped_column(Float, nullable=False)
    trade_price: Mapped[float] = mapped_column(Float, nullable=False)
    wholesale_price: Mapped[float] = mapped_column(Float, nullable=False)
    moq: Mapped[int] = mapped_column(Integer, default=50, nullable=False)
    primary_image: Mapped[str] = mapped_column(
        String(500),
        nullable=False,
        default="https://images.unsplash.com/photo-1505740420928-5e560c06d30e"
    )
    gallery_images: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
