"""
LangChain Tools Module for Multi-Role Commerce AI Agent.
Defines Pydantic v2 args_schema and @tool functions for Seller and Buyer workflows.
All identity and authorization context is extracted strictly from injected RunnableConfig via InjectedToolArg.
Tools return typed structured outputs (dicts / Pydantic models), never manual JSON strings.
"""

from typing import Optional, Dict, Any, List
from typing_extensions import Annotated
from langchain_core.tools import tool, InjectedToolArg
from langchain_core.runnables import RunnableConfig

from app.core.database import SessionLocal
from app.models.user import Role, User
from app.schemas.agent import (
    ListProductInput, UpdateStockInput, SearchCatalogInput,
    AddToCartInput, RemoveFromCartInput, CheckoutCartInput, GetOrderStatusInput, ToolResultOutput
)
from app.schemas.agent import SearchProductsByPriceInput
from app.services.product_service import product_service
from app.services.order_service import order_service
from app.services.cart_service import cart_service
from app.repositories.product_repository import product_repository
from app.repositories.order_repository import order_repository
from app.repositories.user_repository import user_repository
from app.schemas.product import ProductCreate
from app.schemas.order import OrderCreate, OrderItemCreate
from app.core.exceptions import AppException


# ============================================================================
# Merchant / Seller Tools (Context Injected from RunnableConfig)
# ============================================================================

@tool(args_schema=ListProductInput)
async def list_product(
    title: str,
    sku: str,
    price: float,
    stock: int,
    description: str = "",
    moq: int = 50,
    config: Annotated[RunnableConfig, InjectedToolArg] = None
) -> Dict[str, Any]:
    """
    List a new product in the catalog mapped directly to the authenticated merchant.
    Requires WHOLESALER or SUPER_ADMIN role in injected session context.
    """
    configurable = config.get("configurable", {}) if config else {}
    user_id = configurable.get("user_id")
    user_role = configurable.get("role")

    if not user_id or user_role not in (Role.WHOLESALER.value, Role.SUPER_ADMIN.value):
        return ToolResultOutput(
            success=False,
            message="Please log in as a wholesaler or admin to add new products."
        ).model_dump()

    try:
        async with SessionLocal() as db:
            product_in = ProductCreate(
                sku=sku,
                title=title,
                description=description,
                stock=stock,
                retail_price=round(price * 1.5, 2),
                trade_price=round(price * 1.2, 2),
                wholesale_price=price,
                moq=moq
            )
            created_prod = await product_service.create_product(db, product_in)
            return ToolResultOutput(
                success=True,
                message=f"Product '{title}' (SKU: {sku}) has been added to the catalog.",
                data=created_prod.model_dump()
            ).model_dump()
    except AppException as e:
        return ToolResultOutput(success=False, message=e.message).model_dump()
    except Exception as e:
        return ToolResultOutput(success=False, message=f"Could not add product right now: {str(e)}").model_dump()


@tool(args_schema=UpdateStockInput)
async def update_stock(
    product_id: int,
    new_stock: int,
    config: Annotated[RunnableConfig, InjectedToolArg] = None
) -> Dict[str, Any]:
    """
    Update inventory stock level for an existing product.
    Requires WHOLESALER or SUPER_ADMIN role in injected session context.
    """
    configurable = config.get("configurable", {}) if config else {}
    user_id = configurable.get("user_id")
    user_role = configurable.get("role")

    if not user_id or user_role not in (Role.WHOLESALER.value, Role.SUPER_ADMIN.value):
        return ToolResultOutput(
            success=False,
            message="Please log in as a wholesaler or admin to update product stock."
        ).model_dump()

    try:
        async with SessionLocal() as db:
            updated_prod = await product_service.update_stock(db, product_id, new_stock)
            return ToolResultOutput(
                success=True,
                message=f"Stock for product ID {product_id} updated to {new_stock} units.",
                data=updated_prod.model_dump()
            ).model_dump()
    except AppException as e:
        return ToolResultOutput(success=False, message=e.message).model_dump()
    except Exception as e:
        return ToolResultOutput(success=False, message=f"Could not update stock right now: {str(e)}").model_dump()


@tool
async def get_merchant_inventory(
    config: Annotated[RunnableConfig, InjectedToolArg] = None
) -> Dict[str, Any]:
    """
    Retrieve all inventory items listed in the product catalog for the authenticated merchant.
    """
    configurable = config.get("configurable", {}) if config else {}
    user_id = configurable.get("user_id")

    try:
        async with SessionLocal() as db:
            user = None
            if user_id:
                try:
                    user = await user_repository.get_by_id(db, int(user_id))
                except ValueError:
                    pass

            products = await product_service.list_products(db, user=user)
            return ToolResultOutput(
                success=True,
                message=f"Found {len(products)} products in your catalog.",
                data=[p.model_dump() for p in products]
            ).model_dump()
    except Exception as e:
        return ToolResultOutput(success=False, message=f"Could not retrieve inventory items right now: {str(e)}").model_dump()


# ============================================================================
# Buyer / Shopping Tools (Context Injected from RunnableConfig)
# ============================================================================

@tool(args_schema=SearchCatalogInput)
async def search_catalog(
    query: str = "",
    merchant_type: Optional[str] = None,
    config: Annotated[RunnableConfig, InjectedToolArg] = None
) -> Dict[str, Any]:
    """
    Search the product catalog by keyword query matching title or SKU.
    Applies role-aware pricing based on the authenticated session context.
    """
    configurable = config.get("configurable", {}) if config else {}
    user_id = configurable.get("user_id")

    try:
        async with SessionLocal() as db:
            user = None
            if user_id and str(user_id).isdigit():
                user = await user_repository.get_by_id(db, int(user_id))

            products = await product_service.list_products(db, query=query, user=user)
            formatted_data = []
            for p in products:
                d = p.model_dump()
                d["price_inr"] = f"₹{p.retail_price:,.2f}"
                formatted_data.append(d)
            return ToolResultOutput(
                success=True,
                message=f"Found {len(products)} products matching '{query}'.",
                data=formatted_data
            ).model_dump()
    except Exception as e:
        return ToolResultOutput(success=False, message=f"Could not search products right now: {str(e)}").model_dump()


@tool(args_schema=AddToCartInput)
async def add_to_cart(
    product_id: int,
    quantity: int = 1,
    config: Annotated[RunnableConfig, InjectedToolArg] = None
) -> Dict[str, Any]:
    """
    Save item and quantity into the persistent database cart.
    If the user does not specify a quantity, ALWAYS set quantity=1 unit.
    """
    if quantity is None or quantity <= 0:
        quantity = 1

    configurable = config.get("configurable", {}) if config else {}
    user_id = str(configurable.get("user_id", "guest"))

    if not user_id or not user_id.isdigit():
        return ToolResultOutput(
            success=False,
            message="Sign in required to manage cart or buy products. Please [Sign In to Continue](/login?next=/checkout)."
        ).model_dump()

    try:
        async with SessionLocal() as db:
            cart_item = await cart_service.add_to_cart(
                db,
                user_id=user_id,
                product_id=product_id,
                quantity=quantity
            )
            product = cart_item.product
            return ToolResultOutput(
                success=True,
                message=f"Added {quantity} x '{product.title}' to your cart.",
                data={
                    "product_id": product.id,
                    "title": product.title,
                    "quantity": cart_item.quantity,
                    "unit_price": product.retail_price
                }
            ).model_dump()
    except AppException as e:
        return ToolResultOutput(success=False, message=e.message).model_dump()
    except Exception as e:
        return ToolResultOutput(success=False, message=f"Could not add item to cart right now: {str(e)}").model_dump()


@tool(args_schema=RemoveFromCartInput)
async def remove_from_cart(
    product_id: int,
    config: Annotated[RunnableConfig, InjectedToolArg] = None
) -> Dict[str, Any]:
    """
    Remove a product from your persistent database cart.
    """
    configurable = config.get("configurable", {}) if config else {}
    user_id = str(configurable.get("user_id", "guest"))

    if not user_id or not user_id.isdigit():
        return ToolResultOutput(
            success=False,
            message="Sign in required to modify cart. Please [Sign In to Continue](/login?next=/checkout)."
        ).model_dump()

    try:
        async with SessionLocal() as db:
            removed = await cart_service.remove_from_cart(
                db,
                user_id=user_id,
                product_id=product_id
            )
            if removed:
                return ToolResultOutput(
                    success=True,
                    message=f"Product ID {product_id} was removed from your cart."
                ).model_dump()
            else:
                return ToolResultOutput(
                    success=False,
                    message=f"Product ID {product_id} was not found in your cart."
                ).model_dump()
    except Exception as e:
        return ToolResultOutput(success=False, message=f"Could not remove item from cart: {str(e)}").model_dump()


@tool(args_schema=CheckoutCartInput)
async def checkout_cart(
    items: Optional[List[AddToCartInput]] = None,
    shipping_address: Optional[str] = "Standard Ground Delivery",
    payment_method: Optional[str] = "CREDIT_CARD",
    config: Annotated[RunnableConfig, InjectedToolArg] = None
) -> Dict[str, Any]:
    """
    Execute order placement using items saved in the user's database cart or provided items list, and clear cart upon success.
    """
    configurable = config.get("configurable", {}) if config else {}
    user_id = configurable.get("user_id")
    thread_id = configurable.get("thread_id")

    if not user_id or not str(user_id).isdigit():
        return ToolResultOutput(
            success=False,
            message="Please log in to place your order."
        ).model_dump()

    try:
        async with SessionLocal() as db:
            user = await user_repository.get_by_id(db, int(user_id))
            if not user:
                return ToolResultOutput(success=False, message="Your user account details could not be found. Please log in again.").model_dump()

            order_items_in = []
            if items:
                order_items_in = [OrderItemCreate(product_id=item.product_id, quantity=item.quantity) for item in items]
            else:
                db_cart_items = await cart_service.get_cart(db, user_id=str(user_id))
                if not db_cart_items:
                    return ToolResultOutput(
                        success=False,
                        message="Your cart is currently empty. Please add products to your cart before checking out."
                    ).model_dump()
                order_items_in = [OrderItemCreate(product_id=ci.product_id, quantity=ci.quantity) for ci in db_cart_items]

            order_in = OrderCreate(items=order_items_in)
            created_order = await order_service.create_order(db, user, order_in)

            # Clear database cart after successful order creation
            await cart_service.clear_cart(db, user_id=str(user_id))

            return ToolResultOutput(
                success=True,
                message=f"Order #{created_order.id} placed successfully! Total amount: ₹{created_order.total:.2f}.",
                data=created_order.model_dump()
            ).model_dump()
    except AppException as e:
        return ToolResultOutput(success=False, message=e.message).model_dump()
    except Exception as e:
        return ToolResultOutput(success=False, message=f"Could not complete your order right now: {str(e)}").model_dump()


@tool
async def get_user_cart(
    config: Annotated[RunnableConfig, InjectedToolArg] = None
) -> Dict[str, Any]:
    """
    Retrieve all items currently stored in the user's database shopping cart.
    """
    configurable = config.get("configurable", {}) if config else {}
    user_id = str(configurable.get("user_id", "guest"))

    if not user_id or not user_id.isdigit():
        return ToolResultOutput(
            success=False,
            message="Sign in required to view your cart. Please [Sign In to Continue](/login?next=/checkout)."
        ).model_dump()

    try:
        async with SessionLocal() as db:
            cart_items = await cart_service.get_cart(db, user_id=user_id)
            items_data = [
                {
                    "product_id": ci.product_id,
                    "title": ci.product.title,
                    "sku": ci.product.sku,
                    "quantity": ci.quantity,
                    "unit_price": ci.product.retail_price,
                    "subtotal": ci.quantity * ci.product.retail_price
                }
                for ci in cart_items if ci.product
            ]
            total_amount = sum(item["subtotal"] for item in items_data)
            return ToolResultOutput(
                success=True,
                message=f"Found {len(items_data)} items in your cart totaling ₹{total_amount:.2f}.",
                data={"items": items_data, "total": total_amount}
            ).model_dump()
    except Exception as e:
        return ToolResultOutput(success=False, message=f"Could not fetch cart items right now: {str(e)}").model_dump()


@tool(args_schema=GetOrderStatusInput)
async def get_order_status(
    order_id: int,
    config: Annotated[RunnableConfig, InjectedToolArg] = None
) -> Dict[str, Any]:
    """
    Retrieve details and status for a previously placed order using its numeric order_id.
    """
    try:
        async with SessionLocal() as db:
            order = await order_repository.get_by_id(db, order_id)
            if not order:
                return ToolResultOutput(success=False, message=f"Order #{order_id} was not found.").model_dump()

            return ToolResultOutput(
                success=True,
                message=f"Order #{order_id} is currently '{order.status.value}'.",
                data={
                    "id": order.id,
                    "user_id": order.user_id,
                    "status": order.status.value,
                    "total": order.total,
                    "order_type": order.order_type.value
                }
            ).model_dump()
    except Exception as e:
        return ToolResultOutput(success=False, message=f"Could not fetch order status right now: {str(e)}").model_dump()

# Search Product by price 
@tool(args_schema=SearchProductsByPriceInput)
async def search_products_by_price(
    min_price=None,
    max_price=None,
    category=None,
    sort_by="price_asc",
    limit=10,
    config: Annotated[
        RunnableConfig, InjectedToolArg
    ] = None,
) -> Dict[str, Any]:
    """
    Search the product catalog by price range.

    Use this tool when the user asks for products below, above,
    or between specified prices, or requests the cheapest or
    most expensive products.

    Prices use the store's configured currency.
    Returns matching products sorted by price.
    """

    try:
        async with SessionLocal() as db:
            products = await product_repository.search_by_price(
                db,
                min_price=min_price,
                max_price=max_price,
                category=category,
                sort_by=sort_by,
                limit=limit,
            )

            product_data = [
                {
                    "id": product.id,
                    "title": product.title,
                    "sku": product.sku,
                    "retail_price": str(product.retail_price),
                    "trade_price": str(product.trade_price),
                    "wholesale_price": str(product.wholesale_price),
                    "stock": product.stock,
                    "moq": product.moq,
                }
                for product in products
            ]

            if not product_data:
                return ToolResultOutput(
                    success=True,
                    message="No products matched the requested filters.",
                    data={
                        "products": [],
                        "count": 0,
                    },
                ).model_dump()

            return ToolResultOutput(
                success=True,
                message=f"Found {len(product_data)} matching products.",
                data={
                    "products": product_data,
                    "count": len(product_data),
                    "filters": {
                        "min_price": (
                            str(min_price)
                            if min_price is not None else None
                        ),
                        "max_price": (
                            str(max_price)
                            if max_price is not None else None
                        ),
                        "category": category,
                        "sort_by": sort_by,
                    },
                },
            ).model_dump()

    except Exception as e:

        return ToolResultOutput(
            success=False,
            message=f"Unable to search products right now: {str(e)}",
            data=None,
        ).model_dump()

all_tools = [
    list_product,
    update_stock,
    get_merchant_inventory,
    search_catalog,
    add_to_cart,
    remove_from_cart,
    get_user_cart,
    checkout_cart,
    get_order_status,
    search_products_by_price
]
