"""
Core Middleware Module for Request Correlation Tracking & Observability.
Generates or propagates X-Request-ID header and binds it to request state.
"""

import uuid
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response
from app.core.security import decode_token

HEADER_REQUEST_ID = "X-Request-ID"


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Middleware for generating and attaching correlation request IDs."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        request_id = request.headers.get(HEADER_REQUEST_ID) or str(uuid.uuid4())
        request.state.request_id = request_id

        response = await call_next(request)
        response.headers[HEADER_REQUEST_ID] = request_id
        return response


class AuthenticationMiddleware(BaseHTTPMiddleware):
    """Industry-standard HTTP entrypoint middleware for JWT cookie/header extraction."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        token = request.cookies.get("access_token")
        if not token:
            auth_header = request.headers.get("authorization") or request.headers.get("Authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        request.state.is_authenticated = False
        request.state.user_id = None
        request.state.user_role = None

        if token:
            payload = decode_token(token, kind="access")
            if payload and "sub" in payload:
                try:
                    request.state.user_id = int(payload["sub"])
                    request.state.user_role = payload.get("role")
                    request.state.is_authenticated = True
                except (ValueError, TypeError):
                    pass

        response = await call_next(request)
        return response

