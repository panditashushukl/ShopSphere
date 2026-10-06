"""
API Endpoint Integration Tests for Standardized Response Envelopes and Exceptions.
Tests response envelope structure, RFC-7807 error formatting, and role authorization guards.
"""

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.mark.anyio
async def test_health_endpoint():
    """Verify health endpoint returns standardized success envelope."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/agent/health")
        assert response.status_code == 200
        json_data = response.json()
        assert json_data["success"] is True
        assert json_data["statusCode"] == 200
        assert json_data["data"]["status"] == "healthy"
        assert "timestamp" in json_data


@pytest.mark.anyio
async def test_unauthenticated_access_denied():
    """Verify protected endpoints return RFC-7807 error envelope when unauthenticated."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/v1/auth/me")
        assert response.status_code == 401
        json_data = response.json()
        assert json_data["success"] is False
        assert json_data["error"]["code"] == "UNAUTHENTICATED"
        assert "timestamp" in json_data


@pytest.mark.anyio
async def test_validation_error_format():
    """Verify payload validation errors return RFC-7807 error envelope with details."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/v1/auth/register", json={"email": "invalid-email"})
        assert response.status_code == 422
        json_data = response.json()
        assert json_data["success"] is False
        assert json_data["error"]["code"] == "VALIDATION_ERROR"
        assert isinstance(json_data["error"]["details"], list)
