"""
Dependency Injection Providers for FastAPI Routes.
Provides session dependencies, current user extraction, and RBAC role guards.
"""

from typing import List, Optional
from fastapi import Cookie, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import decode_token
from app.models.user import User, Role
from app.repositories.user_repository import user_repository
from app.core.exceptions import AuthenticationError, ForbiddenRoleError


async def get_current_user(
    access_token: Optional[str] = Cookie(None),
    db: AsyncSession = Depends(get_db)
) -> User:
    """Extracts and verifies current user from access token cookie."""
    if not access_token:
        raise AuthenticationError("Not authenticated. Token cookie missing.")

    payload = decode_token(access_token, kind="access")
    if not payload:
        raise AuthenticationError("Session expired or invalid access token.")

    user_id = int(payload.get("sub", 0))
    user = await user_repository.get_by_id(db, user_id)
    if not user:
        raise AuthenticationError("Authenticated user account no longer exists.")

    return user


require_authenticated_user = get_current_user


def require_role(roles: List[str]):
    """Role-based Access Control (RBAC) dependency factory."""
    allowed_roles = {Role(r) for r in roles}

    async def role_checker(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed_roles:
            raise ForbiddenRoleError(f"Forbidden: Action requires role in {roles}.")

        if user.role in (Role.RETAILER, Role.WHOLESALER) and not user.is_verified:
            raise ForbiddenRoleError("Account pending admin approval.")

        return user

    return role_checker


async def optional_user(
    access_token: Optional[str] = Cookie(None),
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """Optional user dependency that returns None for unauthenticated requests."""
    if not access_token:
        return None

    payload = decode_token(access_token, kind="access")
    if not payload:
        return None

    user_id = int(payload.get("sub", 0))
    return await user_repository.get_by_id(db, user_id)
