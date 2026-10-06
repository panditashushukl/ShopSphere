"""
Core Middleware Module for Request Correlation Tracking & Observability.
Generates or propagates X-Request-ID header and binds it to request state.
"""

import uuid
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

HEADER_REQUEST_ID = "X-Request-ID"


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Middleware for generating and attaching correlation request IDs."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        request_id = request.headers.get(HEADER_REQUEST_ID) or str(uuid.uuid4())
        request.state.request_id = request_id

        response = await call_next(request)
        response.headers[HEADER_REQUEST_ID] = request_id
        return response
