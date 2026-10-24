"""End-to-end API integration tests for StationPool routes."""
import pytest


def test_api_health_check(client):
    """Test /health endpoint."""
    res = client.get("/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "healthy"
    assert data["app"] == "StationPool API"


def test_api_stations(client):
    """Test /api/stations directory endpoint."""
    res = client.get("/api/stations")
    assert res.status_code == 200
    data = res.json()
    assert "Ramwadi" in data["stations"]
    assert "Vanaz" in data["stations"]
    assert "EON IT Park Kharadi" in data["feeder_destinations"]
    assert len(data["lines"]) == 2


def test_api_auth_register_and_verify(client):
    """Test /api/auth/register and /api/auth/verify-otp."""
    reg_res = client.post(
        "/api/auth/register",
        json={
            "full_name": "API Commuter",
            "mobile_number": "+919876543299",
            "role": "passenger",
        },
    )
    assert reg_res.status_code == 201
    reg_data = reg_res.json()
    assert reg_data["success"] is True
    demo_otp = reg_data["demo_otp"]

    verify_res = client.post(
        "/api/auth/verify-otp",
        json={
            "mobile_number": "+919876543299",
            "otp_code": demo_otp,
        },
    )
    assert verify_res.status_code == 200
    token_data = verify_res.json()
    assert "access_token" in token_data
    token = token_data["access_token"]

    # Test /api/auth/me
    me_res = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert me_res.status_code == 200
    assert me_res.json()["full_name"] == "API Commuter"


def test_api_seed_and_search_journeys(client):
    """Test /api/seed and /api/journeys/search."""
    seed_res = client.post("/api/seed")
    assert seed_res.status_code == 200
    assert seed_res.json()["status"] == "success"

    # Search journeys
    search_res = client.get("/api/journeys/search?origin_station=Ramwadi")
    assert search_res.status_code == 200
    journeys = search_res.json()
    assert len(journeys) >= 1
    assert journeys[0]["origin_station"] == "Ramwadi"
    assert journeys[0]["driver"]["full_name"] == "Rahul Deshmukh"
