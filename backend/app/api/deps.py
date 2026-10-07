"""
Dependency Injection Providers for FastAPI Routes.
Provides session dependencies, current user extraction, and RBAC role guards.
"""

from typing import List, Optional
from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.exceptions import AuthenticationError, ForbiddenRoleError
from app.models.user import Role, User
from app.repositories.user_repository import user_repository


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> User:
    """Extracts and verifies current user from entrypoint middleware state."""
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        raise AuthenticationError("Not authenticated. Session token missing or expired.")

    user = await user_repository.get_by_id(db, user_id)
    if not user:
        raise AuthenticationError("Authenticated user account no longer exists.")

    return user


# Readable alias for routes requiring strict auth
require_authenticated_user = get_current_user


def require_role(roles: List[str]):
    """Role-based Access Control (RBAC) dependency factory."""
    allowed_roles = {Role(r) for r in roles}

    async def role_checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_roles:
            raise ForbiddenRoleError(f"Forbidden: Action requires one of roles: {roles}.")

        if user.role in (Role.RETAILER, Role.WHOLESALER) and not user.is_verified:
            raise ForbiddenRoleError("Account pending admin approval.")

        return user

    return role_checker


async def optional_user(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """Optional user dependency that returns None for unauthenticated requests."""
    user_id = getattr(request.state, "user_id", None)
    if not user_id:
        return None

    return await user_repository.get_by_id(db, user_id)


async def get_user_id_str(
    request: Request,
    user: Optional[User] = Depends(optional_user)
) -> str:
    """Extracts string user ID for authenticated users or unique guest session ID from cookie/header."""
    if user:
        return str(user.id)

    guest_id = (
        request.cookies.get("shopsphere_guest_id") or
        request.headers.get("x-guest-id")
    )
    return guest_id if guest_id else "guest"