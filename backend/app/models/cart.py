"""
SQLAlchemy 2.0 ORM Model for CartItem Entity.
Stores persisted shopping cart items per user/guest session in database.
"""

from datetime import datetime
from sqlalchemy import ForeignKey, Integer, String, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.product import Product


class CartItem(Base):
    __tablename__ = "cart_items"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(50), index=True, nullable=False, default="guest")
    thread_id: Mapped[str] = mapped_column(String(100), index=True, nullable=True)
    product_id: Mapped[int] = mapped_column(ForeignKey("products.id", ondelete="CASCADE"), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, default=1, nullable=False)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    product: Mapped["Product"] = relationship("Product", lazy="selectin")
