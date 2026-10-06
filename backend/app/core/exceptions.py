"""
Custom Domain Exception Hierarchy and Global Exception Handlers for FastAPI.
Converts domain exceptions and validation errors into uniform RFC-7807 error envelopes.
"""

from typing import Any, Optional, List, Dict
from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.logger import app_logger
from app.core.response import APIErrorEnvelope, APIErrorDetails


# ============================================================================
# Base and Custom Domain Exceptions
# ============================================================================

class AppException(Exception):
    """Base Application Exception for all domain errors."""
    def __init__(
        self,
        message: str,
        code: str = "INTERNAL_SERVER_ERROR",
        status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
        details: Optional[Any] = None
    ):
        super().__init__(message)
        self.message = message
        self.code = code
        self.status_code = status_code
        self.details = details


class EntityNotFoundError(AppException):
    def __init__(self, entity_name: str, entity_id: Any):
        super().__init__(
            message=f"{entity_name} with id '{entity_id}' was not found.",
            code="ENTITY_NOT_FOUND",
            status_code=status.HTTP_404_NOT_FOUND
        )


class DuplicateEntityError(AppException):
    def __init__(self, entity_name: str, field_name: str, value: Any):
        super().__init__(
            message=f"{entity_name} with {field_name} '{value}' already exists.",
            code="DUPLICATE_ENTITY",
            status_code=status.HTTP_409_CONFLICT
        )


class InsufficientStockError(AppException):
    def __init__(self, sku: str, requested: int, available: int):
        super().__init__(
            message=f"Insufficient stock for SKU '{sku}'. Requested {requested}, available {available}.",
            code="INSUFFICIENT_STOCK",
            status_code=status.HTTP_409_CONFLICT,
            details={"sku": sku, "requested": requested, "available": available}
        )


class MinimumOrderQuantityError(AppException):
    def __init__(self, sku: str, moq: int, requested: int):
        super().__init__(
            message=f"Minimum order quantity for SKU '{sku}' is {moq}. Requested: {requested}.",
            code="MINIMUM_ORDER_QUANTITY_NOT_MET",
            status_code=getattr(status, "HTTP_422_UNPROCESSABLE_CONTENT", 422),
            details={"sku": sku, "moq": moq, "requested": requested}
        )


class ForbiddenRoleError(AppException):
    def __init__(self, message: str = "Forbidden: Insufficient role permissions or unverified account."):
        super().__init__(
            message=message,
            code="FORBIDDEN_ROLE",
            status_code=status.HTTP_403_FORBIDDEN
        )


class AuthenticationError(AppException):
    def __init__(self, message: str = "Authentication credentials were not provided or invalid."):
        super().__init__(
            message=message,
            code="UNAUTHENTICATED",
            status_code=status.HTTP_401_UNAUTHORIZED
        )


class InvalidCredentialsError(AppException):
    def __init__(self, message: str = "Invalid email or password."):
        super().__init__(
            message=message,
            code="INVALID_CREDENTIALS",
            status_code=status.HTTP_401_UNAUTHORIZED
        )


class AgentWorkflowError(AppException):
    def __init__(self, message: str, details: Optional[Any] = None):
        super().__init__(
            message=message,
            code="AGENT_WORKFLOW_ERROR",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details=details
        )


# ============================================================================
# Global FastAPI Exception Handler Registration
# ============================================================================

def register_exception_handlers(app: FastAPI) -> None:
    """Registers global exception handlers for uniform RFC-7807 error envelopes."""

    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
        request_id = getattr(request.state, "request_id", "N/A")
        app_logger.warning(
            f"Domain Exception [{exc.code}] on {request.method} {request.url.path}: {exc.message}",
            extra={"context": {"request_id": request_id, "code": exc.code, "details": exc.details}}
        )
        envelope = APIErrorEnvelope(
            success=False,
            error=APIErrorDetails(
                code=exc.code,
                message=exc.message,
                details=exc.details
            )
        )
        return JSONResponse(status_code=exc.status_code, content=envelope.model_dump(mode="json"))

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
        request_id = getattr(request.state, "request_id", "N/A")
        app_logger.warning(
            f"Validation Error on {request.method} {request.url.path}: {exc.errors()}",
            extra={"context": {"request_id": request_id, "errors": exc.errors()}}
        )
        formatted_errors: List[Dict[str, Any]] = [
            {"loc": list(err.get("loc", [])), "msg": err.get("msg"), "type": err.get("type")}
            for err in exc.errors()
        ]
        envelope = APIErrorEnvelope(
            success=False,
            error=APIErrorDetails(
                code="VALIDATION_ERROR",
                message="Request payload parameters or structure failed validation.",
                details=formatted_errors
            )
        )
        return JSONResponse(status_code=getattr(status, "HTTP_422_UNPROCESSABLE_CONTENT", 422), content=envelope.model_dump(mode="json"))

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
        request_id = getattr(request.state, "request_id", "N/A")
        code_map = {
            401: "UNAUTHENTICATED",
            403: "FORBIDDEN",
            404: "NOT_FOUND",
            405: "METHOD_NOT_ALLOWED",
            409: "CONFLICT",
            422: "UNPROCESSABLE_ENTITY"
        }
        code = code_map.get(exc.status_code, "HTTP_ERROR")
        envelope = APIErrorEnvelope(
            success=False,
            error=APIErrorDetails(
                code=code,
                message=str(exc.detail),
                details=None
            )
        )
        return JSONResponse(status_code=exc.status_code, content=envelope.model_dump())

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
        request_id = getattr(request.state, "request_id", "N/A")
        app_logger.error(
            f"Unhandled Internal Error on {request.method} {request.url.path}: {str(exc)}",
            exc_info=True,
            extra={"context": {"request_id": request_id, "error": str(exc)}}
        )
        envelope = APIErrorEnvelope(
            success=False,
            error=APIErrorDetails(
                code="INTERNAL_SERVER_ERROR",
                message="An unexpected internal server error occurred. Please contact support.",
                details=None
            )
        )
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=envelope.model_dump())
