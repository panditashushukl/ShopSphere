"""
FastAPI Enterprise Application Factory Entrypoint.
Initializes lifespan migrations, global RFC-7807 exception handlers, RequestID correlation middleware,
hardened CORS, and mounts API v1 routes.
"""

import os
from contextlib import asynccontextmanager
from alembic.config import Config
from alembic import command
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import settings
from app.core.database import engine
from app.core.middleware import RequestIDMiddleware, AuthenticationMiddleware
from app.core.exceptions import register_exception_handlers
from app.core.logger import app_logger

# Register database tables metadata for reflection
import app.models.user
import app.models.product
import app.models.order
import app.models.agent_session
import app.models.cart


def run_migrations(connection):
    alembic_cfg_path = os.path.join(os.path.dirname(__file__), "..", "alembic.ini")
    alembic_cfg = Config(alembic_cfg_path)
    alembic_cfg.attributes["connection"] = connection
    command.upgrade(alembic_cfg, "head")


@asynccontextmanager
async def lifespan(_: FastAPI):
    app_logger.info("Executing async startup database migrations...")
    async with engine.begin() as conn:
        await conn.run_sync(run_migrations)
    app_logger.info("Application startup completed successfully.")
    yield
    app_logger.info("Application shutting down.")


app = FastAPI(
    title="Multi-tier Enterprise Commerce API",
    description="Production-Grade Layered Architecture with FastAPI & LangGraph AI Agent Workflow",
    version="2.0.0",
    lifespan=lifespan
)

# Cross-Cutting Middlewares
app.add_middleware(RequestIDMiddleware)
app.add_middleware(AuthenticationMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN, "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Request-ID"]
)

# Global RFC-7807 Exception Handlers
register_exception_handlers(app)

# Router Mounting
app.include_router(api_router)
