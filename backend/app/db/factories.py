"""
Model Factories for Reproducible Test Data Generation.
Uses Factory Boy to build User, Product, Order, and AgentSession instances.
"""

import factory
from app.models.user import User, Role
from app.models.product import Product
from app.models.order import Order, OrderItem, OrderStatus, OrderType
from app.models.agent_session import AgentSession, AgentMessage
from app.core.security import hash_password


class UserFactory(factory.Factory):
    class Meta:
        model = User

    id = factory.Sequence(lambda n: n + 1)
    email = factory.Sequence(lambda n: f"user{n}@shop.test")
    hashed_password = factory.LazyFunction(lambda: hash_password("Passw0rd!"))
    full_name = factory.Faker("name")
    role = Role.CUSTOMER
    is_verified = True


class ProductFactory(factory.Factory):
    class Meta:
        model = Product

    id = factory.Sequence(lambda n: n + 1)
    sku = factory.Sequence(lambda n: f"SKU-{n:03d}")
    title = factory.Faker("word")
    description = factory.Faker("sentence")
    stock = 100
    retail_price = 29.99
    trade_price = 21.50
    wholesale_price = 15.00
    moq = 50


class OrderFactory(factory.Factory):
    class Meta:
        model = Order

    id = factory.Sequence(lambda n: n + 1)
    user_id = 1
    order_type = OrderType.B2C
    status = OrderStatus.PENDING
    total = 29.99


class AgentSessionFactory(factory.Factory):
    class Meta:
        model = AgentSession

    id = factory.Sequence(lambda n: n + 1)
    thread_id = factory.Sequence(lambda n: f"session_test_{n}")
    user_id = "guest"
    title = "Test Session"
