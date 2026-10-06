from fastapi import APIRouter
from .endpoints import admin, agent, auth, cart, orders, products

api_router = APIRouter(prefix="/api/v1")
for m in (auth, products, orders, cart, admin, agent):
    api_router.include_router(m.router)

