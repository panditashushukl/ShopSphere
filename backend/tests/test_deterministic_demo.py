"""
Deterministic Flow Integration Test for Layered Architecture.
Tests Wholesaler listing, stock updates, catalog searching, cart staging, and checkout.
Verifies tool execution with injected RunnableConfig authorization contexts and typed output contracts.
"""

import pytest
import uuid
from langchain_core.runnables import RunnableConfig
from app.agent.tools import (
    list_product, update_stock, get_merchant_inventory,
    search_catalog, add_to_cart, checkout_cart, get_order_status
)


@pytest.mark.anyio
async def test_wholesaler_and_buyer_flow():
    """Executes deterministic integration test for merchant and buyer agent tools."""
    unique_sku = f"SKU-COTTON-{uuid.uuid4().hex[:6]}"

    # ------------------------------------------------------------------------
    # Flow 1: Wholesaler Listing & Inventory Management
    # ------------------------------------------------------------------------
    wholesaler_config: RunnableConfig = {
        "configurable": {
            "user_id": "2",
            "role": "WHOLESALER",
            "merchant_id": "M_WHOLESALER_2"
        }
    }

    list_res = await list_product.ainvoke({
        "title": "Organic Cotton Bulk Fabric",
        "sku": unique_sku,
        "price": 12.50,
        "stock": 500,
        "description": "Premium bulk cotton fabric",
        "moq": 50
    }, config=wholesaler_config)

    assert list_res["success"] is True, f"Failed listing product: {list_res}"
    assert list_res["data"]["sku"] == unique_sku
    product_id = list_res["data"]["id"]

    inv_res = await get_merchant_inventory.ainvoke({}, config=wholesaler_config)
    assert inv_res["success"] is True
    assert len(inv_res["data"]) >= 1

    stock_res = await update_stock.ainvoke({
        "product_id": product_id,
        "new_stock": 600
    }, config=wholesaler_config)

    assert stock_res["success"] is True
    assert stock_res["data"]["stock"] == 600

    # ------------------------------------------------------------------------
    # Flow 2: Retailer / Buyer Browsing, Cart & Checkout Operations
    # ------------------------------------------------------------------------
    customer_config: RunnableConfig = {
        "configurable": {
            "user_id": "4",
            "role": "CUSTOMER"
        }
    }

    search_res = await search_catalog.ainvoke({
        "query": "Cotton"
    }, config=customer_config)

    assert search_res["success"] is True
    assert len(search_res["data"]) >= 1

    cart_res = await add_to_cart.ainvoke({
        "product_id": product_id,
        "quantity": 50
    }, config=customer_config)

    assert cart_res["success"] is True
    assert cart_res["data"]["quantity"] == 50

    checkout_res = await checkout_cart.ainvoke({
        "items": [{"product_id": product_id, "quantity": 50}],
        "shipping_address": "742 Evergreen Terrace, Sector 4",
        "payment_method": "CREDIT_CARD"
    }, config=customer_config)

    assert checkout_res["success"] is True
    order_id = checkout_res["data"]["id"]
    assert order_id is not None

    order_res = await get_order_status.ainvoke({"order_id": order_id}, config=customer_config)
    assert order_res["success"] is True
    assert order_res["data"]["id"] == order_id
