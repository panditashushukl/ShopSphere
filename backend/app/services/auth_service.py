"""
Authentication Domain Service Layer.
Handles user registration, authentication, JWT token generation, cookie setting, and security checks.
"""

from fastapi import Response
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, Role
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.repositories.user_repository import user_repository
from app.core.security import hash_password, verify_password, create_token, decode_token
from app.core.config import settings
from app.core.exceptions import (
    DuplicateEntityError, ForbiddenRoleError, InvalidCredentialsError, AuthenticationError
)


class AuthService:
    """Business logic for User Authentication and JWT identity management."""

    def set_auth_cookies(self, response: Response, user: User) -> str:
        """Sets HTTP-only secure cookies for access and refresh tokens and returns access_token."""
        cookie_options = {
            "httponly": True,
            "secure": settings.COOKIE_SECURE,
            "samesite": "lax",
            "path": "/"
        }
        access_token = create_token(user.id, user.role.value, kind="access")
        refresh_token = create_token(user.id, user.role.value, kind="refresh")

        response.set_cookie(
            "access_token",
            access_token,
            max_age=settings.ACCESS_MINUTES * 60,
            **cookie_options
        )
        response.set_cookie(
            "refresh_token",
            refresh_token,
            max_age=settings.REFRESH_DAYS * 86400,
            **cookie_options
        )
        return access_token

    def clear_auth_cookies(self, response: Response) -> None:
        """Removes access and refresh token cookies."""
        response.delete_cookie("access_token", path="/")
        response.delete_cookie("refresh_token", path="/")

    async def register_user(self, db: AsyncSession, data: UserCreate, response: Response | None = None) -> UserResponse:
        """Registers a new user account."""
        if data.account_type == Role.SUPER_ADMIN:
            raise ForbiddenRoleError("Self-registration as SUPER_ADMIN is strictly forbidden.")

        existing_user = await user_repository.get_by_email(db, data.email)
        if existing_user:
            raise DuplicateEntityError("User", "email", data.email)

        # B2B accounts (WHOLESALER / RETAILER) start unverified pending admin approval
        is_verified = (data.account_type == Role.CUSTOMER)

        user = User(
            email=data.email,
            full_name=data.full_name,
            role=data.account_type,
            hashed_password=hash_password(data.password),
            is_verified=is_verified
        )
        user = await user_repository.create(db, user)
        token = self.set_auth_cookies(response, user) if response else create_token(user.id, user.role.value, kind="access")
        res = UserResponse.model_validate(user)
        res.access_token = token
        return res

    async def login_user(self, db: AsyncSession, data: UserLogin, response: Response | None = None) -> UserResponse:
        """Authenticates user credentials."""
        user = await user_repository.get_by_email(db, data.email)
        if not user or not verify_password(data.password, user.hashed_password):
            raise InvalidCredentialsError()

        token = self.set_auth_cookies(response, user) if response else create_token(user.id, user.role.value, kind="access")
        res = UserResponse.model_validate(user)
        res.access_token = token
        return res

    async def refresh_tokens(self, db: AsyncSession, refresh_token: str | None, response: Response | None = None) -> UserResponse:
        """Refreshes authentication tokens using refresh cookie."""
        if not refresh_token:
            raise AuthenticationError("Refresh token missing.")

        payload = decode_token(refresh_token, kind="refresh")
        if not payload:
            raise AuthenticationError("Invalid or expired refresh token.")

        user_id = int(payload.get("sub", 0))
        user = await user_repository.get_by_id(db, user_id)
        if not user:
            raise AuthenticationError("User associated with token no longer exists.")

        token = self.set_auth_cookies(response, user) if response else create_token(user.id, user.role.value, kind="access")
        res = UserResponse.model_validate(user)
        res.access_token = token
        return res


auth_service = AuthService()
