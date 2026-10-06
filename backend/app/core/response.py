"""
Standardized API Response Envelopes for Production FastAPI Commerce Backend.
Provides generic success envelope wrappers and standard RFC-7807 compliant structures.
"""

from typing import Generic, TypeVar, Optional, Any
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from fastapi.responses import JSONResponse

T = TypeVar("T")


class APIResponse(BaseModel, Generic[T]):
    """Standardized API Success Response Envelope."""
    success: bool = Field(default=True, description="Indicates request success status")
    statusCode: int = Field(default=200, description="HTTP Status Code")
    data: Optional[T] = Field(default=None, description="Payload data returned by endpoint")
    message: str = Field(default="Operation completed successfully", description="Human-readable message")
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="ISO-8601 UTC Timestamp"
    )


class APIErrorDetails(BaseModel):
    """RFC-7807 Compliant Error Object."""
    code: str = Field(..., description="Machine-readable error domain code")
    message: str = Field(..., description="Human-readable error explanation")
    details: Optional[Any] = Field(default=None, description="Additional context or validation errors")


class APIErrorEnvelope(BaseModel):
    """Standardized API Error Response Envelope."""
    success: bool = Field(default=False, description="Indicates failure status")
    error: APIErrorDetails = Field(..., description="Error details payload")
    timestamp: str = Field(
        default_factory=lambda: datetime.now(timezone.utc).isoformat(),
        description="ISO-8601 UTC Timestamp"
    )


def success_response(
    data: Any = None,
    message: str = "Operation completed successfully",
    status_code: int = 200
) -> JSONResponse:
    """Utility to build standard JSON response envelope."""
    payload = APIResponse(
        success=True,
        statusCode=status_code,
        data=data,
        message=message,
        timestamp=datetime.now(timezone.utc).isoformat()
    ).model_dump(mode="json")
    return JSONResponse(status_code=status_code, content=payload)
