"""
Auth API Presentation Endpoint Router.
Handles HTTP request parameter extraction, delegation to AuthService, and envelope responses.
"""

from fastapi import APIRouter, Cookie, Depends, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse
from app.services.auth_service import auth_service
from app.core.response import success_response

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=status.HTTP_201_CREATED)
async def register(
    data: UserCreate,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """Register a new customer or merchant account."""
    user = await auth_service.register_user(db, data, response)
    return success_response(
        data=user.model_dump(),
        message="User registered successfully",
        status_code=status.HTTP_201_CREATED
    )


@router.post("/login")
async def login(
    data: UserLogin,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    """Authenticate user credentials and set session cookies."""
    user = await auth_service.login_user(db, data, response)
    return success_response(
        data=user.model_dump(),
        message="Login successful"
    )


@router.post("/refresh")
async def refresh(
    response: Response,
    refresh_token: str | None = Cookie(None),
    db: AsyncSession = Depends(get_db)
):
    """Refresh access token cookies using refresh token."""
    user = await auth_service.refresh_tokens(db, refresh_token, response)
    return success_response(
        data=user.model_dump(),
        message="Tokens refreshed successfully"
    )


@router.post("/logout")
async def logout(response: Response):
    """Clear user session authentication cookies."""
    auth_service.clear_auth_cookies(response)
    return success_response(
        data={"ok": True},
        message="Logged out successfully"
    )


@router.get("/me")
async def get_me(current_user: User = Depends(get_current_user)):
    """Retrieve profile data for current authenticated user."""
    user_dto = UserResponse.model_validate(current_user)
    return success_response(
        data=user_dto.model_dump(),
        message="Current user profile retrieved successfully"
    )
