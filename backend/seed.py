"""
Database Seeding Script Entrypoint.
Runs migrations and populates shop.db with idempotent default seed data.
"""

import asyncio
import os
from alembic.config import Config
from alembic import command
from app.core.database import SessionLocal, engine
from app.db.seeders import seed_database
from app.core.logger import app_logger


def run_migrations(connection):
    alembic_cfg_path = os.path.join(os.path.dirname(__file__), "alembic.ini")
    alembic_cfg = Config(alembic_cfg_path)
    alembic_cfg.attributes["connection"] = connection
    command.upgrade(alembic_cfg, "head")


async def main():
    app_logger.info("Executing database migration upgrade...")
    async with engine.begin() as conn:
        await conn.run_sync(run_migrations)

    async with SessionLocal() as session:
        await seed_database(session)

    print("Seeding successful! All seed users password: Passw0rd!")


if __name__ == "__main__":
    asyncio.run(main())
