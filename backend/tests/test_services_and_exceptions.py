"""
Domain Service & Repository Integration Tests.
Tests AuthService, ProductService, OrderService, and custom domain exceptions.
"""

import pytest
import uuid
from app.core.database import SessionLocal
from app.models.user import Role
from app.schemas.user import UserCreate, UserLogin
from app.schemas.product import ProductCreate
from app.schemas.order import OrderCreate, OrderItemCreate
from app.services.auth_service import auth_service
from app.services.product_service import product_service
from app.services.order_service import order_service
from app.repositories.user_repository import user_repository
from app.core.exceptions import (
    DuplicateEntityError, InsufficientStockError, MinimumOrderQuantityError
)
from fastapi import Response


@pytest.mark.anyio
async def test_auth_service_registration_and_login():
    """Test user registration and login flow via AuthService."""
    unique_email = f"user_{uuid.uuid4().hex[:6]}@example.com"
    async with SessionLocal() as db:
        resp = Response()
        user_in = UserCreate(
            email=unique_email,
            password="Passw0rd123!",
            full_name="Service Test User",
            account_type=Role.CUSTOMER
        )

        user_resp = await auth_service.register_user(db, user_in, resp)
        assert user_resp.email == unique_email
        assert user_resp.is_verified is True

        # Test Duplicate Registration Exception
        with pytest.raises(DuplicateEntityError):
            await auth_service.register_user(db, user_in, resp)

        # Test Login
        login_in = UserLogin(email=unique_email, password="Passw0rd123!")
        login_resp = await auth_service.login_user(db, login_in, resp)
        assert login_resp.id == user_resp.id


@pytest.mark.anyio
async def test_product_service_role_projections():
    """Test role-aware price projections in ProductService."""
    unique_sku = f"SKU-PROJ-{uuid.uuid4().hex[:6]}"
    async with SessionLocal() as db:
        prod_in = ProductCreate(
            sku=unique_sku,
            title="Projection Test Item",
            description="Testing price projections",
            stock=100,
            retail_price=100.0,
            trade_price=80.0,
            wholesale_price=60.0,
            moq=10
        )
        created_prod = await product_service.create_product(db, prod_in)
        assert created_prod.sku == unique_sku

        # Admin user
        admin_user = await user_repository.get_by_email(db, "admin@shop.test")
        admin_proj = await product_service.get_product_by_id(db, created_prod.id, user=admin_user)
        assert admin_proj.retail_price == 100.0
        assert admin_proj.wholesale_price == 60.0

        # Wholesaler user
        wholesaler_user = await user_repository.get_by_email(db, "wholesaler@shop.test")
        wholesale_proj = await product_service.get_product_by_id(db, created_prod.id, user=wholesaler_user)
        assert wholesale_proj.price == 60.0
        assert wholesale_proj.min_order_quantity == 10

        # Customer user
        customer_user = await user_repository.get_by_email(db, "customer@shop.test")
        customer_proj = await product_service.get_product_by_id(db, created_prod.id, user=customer_user)
        assert customer_proj.price == 100.0


@pytest.mark.anyio
async def test_order_service_moq_and_stock_exceptions():
    """Test order validation exceptions (MOQ and Insufficient Stock)."""
    async with SessionLocal() as db:
        wholesaler_user = await user_repository.get_by_email(db, "wholesaler@shop.test")
        prod = await product_service.get_product_by_id(db, 1, user=wholesaler_user)

        # MOQ Exception for Wholesaler
        moq_order = OrderCreate(items=[OrderItemCreate(product_id=prod.id, quantity=1)])
        with pytest.raises(MinimumOrderQuantityError):
            await order_service.create_order(db, wholesaler_user, moq_order)

        # Insufficient Stock Exception
        huge_order = OrderCreate(items=[OrderItemCreate(product_id=prod.id, quantity=999999)])
        with pytest.raises(InsufficientStockError):
            await order_service.create_order(db, wholesaler_user, huge_order)
