"""
Idempotent Database Seeders Module.
Provides reproducible seed data and clean teardown/rollback functionality.
"""

from typing import Tuple, List
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, Role
from app.models.product import Product
from app.core.security import hash_password
from app.core.logger import app_logger

SEED_USERS: List[Tuple[str, str, Role, str]] = [
    ("admin@shopsphere.com", "Platform Admin", Role.SUPER_ADMIN, "https://images.unsplash.com/photo-1534528741775-53994a69daeb"),
    ("wholesaler@shopsphere.com", "Bulk Co", Role.WHOLESALER, "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"),
    ("retailer@shopsphere.com", "Corner Store", Role.RETAILER, "https://images.unsplash.com/photo-1494790108377-be9c29b29330"),
    ("customer@shopsphere.com", "Jane Doe", Role.CUSTOMER, "https://images.unsplash.com/photo-1438761681033-6461ffad8d80"),
    ("admin@shop.test", "Platform Admin", Role.SUPER_ADMIN, "https://images.unsplash.com/photo-1534528741775-53994a69daeb"),
    ("wholesaler@shop.test", "Bulk Co", Role.WHOLESALER, "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d"),
    ("retailer@shop.test", "Corner Store", Role.RETAILER, "https://images.unsplash.com/photo-1494790108377-be9c29b29330"),
    ("customer@shop.test", "Jane Doe", Role.CUSTOMER, "https://images.unsplash.com/photo-1438761681033-6461ffad8d80")
]

SEED_PRODUCTS: List[Tuple[str, str, int, float, float, float, int, str, List[str]]] = [
    (
        "SKU-001", "Wireless Mouse", 1200, 29.99, 21.50, 15.00, 50,
        "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46",
        ["https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7"]
    ),
    (
        "SKU-002", "USB-C Cable 2m", 3000, 12.99, 8.50, 5.25, 100,
        "https://images.unsplash.com/photo-1544816155-12df9643f363",
        ["https://images.unsplash.com/photo-1583863788434-e58a36330cf0"]
    ),
    (
        "SKU-003", "Mechanical Keyboard", 400, 89.00, 64.00, 48.00, 50,
        "https://images.unsplash.com/photo-1587829741301-dc798b83add3",
        ["https://images.unsplash.com/photo-1618384887929-16ec33fab9ef"]
    ),
    (
        "SKU-004", "27in Monitor", 150, 249.00, 199.00, 170.00, 50,
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf",
        ["https://images.unsplash.com/photo-1547082299-de196ea013d6"]
    )
]


async def teardown_database(db: AsyncSession) -> None:
    """Cleanly purge existing table records."""
    app_logger.info("Purging database tables for teardown...")
    await db.execute(text("DELETE FROM agent_messages"))
    await db.execute(text("DELETE FROM agent_sessions"))
    await db.execute(text("DELETE FROM order_items"))
    await db.execute(text("DELETE FROM orders"))
    await db.execute(text("DELETE FROM products"))
    await db.execute(text("DELETE FROM users"))
    await db.commit()


async def seed_database(db: AsyncSession) -> None:
    """Idempotently seed database with initial users and catalog products."""
    app_logger.info("Seeding database with default users and products...")
    await teardown_database(db)

    password_hash = hash_password("Passw0rd!")

    for email, name, role, avatar in SEED_USERS:
        db.add(User(
            email=email,
            full_name=name,
            role=role,
            avatar_url=avatar,
            hashed_password=password_hash,
            is_verified=True
        ))

    for sku, title, stock, retail, trade, wholesale, moq, primary_img, gallery in SEED_PRODUCTS:
        db.add(Product(
            sku=sku,
            title=title,
            stock=stock,
            retail_price=retail,
            trade_price=trade,
            wholesale_price=wholesale,
            moq=moq,
            primary_image=primary_img,
            gallery_images=gallery
        ))

    await db.commit()
    app_logger.info("Database seeding completed successfully.")
