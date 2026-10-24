"""Unit tests for StationPool business logic services."""
import pytest
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException

from app.db.models import (
    User,
    UserRole,
    DriverProfile,
    Journey,
    JourneyStatus,
    SeatRequest,
    Trip,
    TripStatus,
    VehicleCategory,
)
from app.schemas.auth import UserCreate
from app.schemas.driver import DriverRegisterRequest
from app.schemas.journey import JourneyCreate
from app.services.auth_service import AuthService
from app.services.driver_service import DriverService
from app.services.journey_service import JourneyService
from app.services.trip_service import TripService


def test_auth_service_full_flow(db_session):
    """Test user registration, OTP generation, and OTP verification issuing JWT token."""
    payload = UserCreate(
        full_name="Tanvi Joshi",
        mobile_number="+919876543230",
        email="tanvi@test.com",
        role=UserRole.PASSENGER,
    )
    user, otp_code = AuthService.register_user(db_session, payload)

    assert user.id is not None
    assert user.mobile_number == "+919876543230"
    assert user.is_verified is False
    assert len(otp_code) == 6

    # Test verification with wrong OTP
    with pytest.raises(HTTPException) as exc_info:
        AuthService.verify_otp(db_session, "+919876543230", "000000")
    assert exc_info.value.status_code == 400

    # Test verification with correct OTP
    token_res = AuthService.verify_otp(db_session, "+919876543230", otp_code)
    assert token_res.access_token is not None
    assert token_res.token_type == "bearer"
    assert token_res.user.is_verified is True


def test_driver_service_onboarding(db_session):
    """Test driver registration, automatic ID number masking, and role elevation."""
    user = User(
        full_name="Vikram Patil",
        mobile_number="+919876543231",
        role=UserRole.PASSENGER,
        is_verified=True,
    )
    db_session.add(user)
    db_session.commit()

    req = DriverRegisterRequest(
        id_type="Aadhaar",
        id_number="1234 5678 9012",
        dl_number="MH1220200012345",
        vehicle_category=VehicleCategory.FOUR_WHEELER,
        vehicle_make_model="Maruti Swift",
        vehicle_registration="MH 12 CD 3456",
        vehicle_capacity=3,
        has_helmet=False,
    )
    profile = DriverService.register_or_update_driver(db_session, user.id, req)

    assert profile.user_id == user.id
    # Ensure ID number is masked
    assert "9012" in profile.id_number_masked
    assert "1234" not in profile.id_number_masked[:4]
    # Ensure user role was elevated from PASSENGER to BOTH
    db_session.refresh(user)
    assert user.role == UserRole.BOTH


def test_journey_service_lifecycle(db_session):
    """Test publishing journey, search query matching, and seat reservation."""
    driver = User(
        full_name="Driver Priya",
        mobile_number="+919876543232",
        role=UserRole.DRIVER,
        is_verified=True,
    )
    passenger = User(
        full_name="Passenger Rohit",
        mobile_number="+919876543233",
        role=UserRole.PASSENGER,
        is_verified=True,
    )
    db_session.add_all([driver, passenger])
    db_session.commit()

    departure = datetime.now(timezone.utc) + timedelta(minutes=25)
    j_create = JourneyCreate(
        origin_station="Ramwadi",
        destination_zone="EON IT Park Kharadi",
        departure_time=departure,
        vehicle_category=VehicleCategory.FOUR_WHEELER,
        total_seats=3,
        estimated_total_cost=50.0,
    )
    journey = JourneyService.create_journey(db_session, driver.id, j_create)
    assert journey.id is not None
    assert journey.available_seats == 3

    # Search by station
    results = JourneyService.search_journeys(db_session, origin_station="Ramwadi")
    assert len(results) >= 1
    assert any(j.id == journey.id for j in results)

    # Search with no match
    no_results = JourneyService.search_journeys(db_session, origin_station="Kasarwadi")
    assert len(no_results) == 0

    # Request a seat
    seat_req = JourneyService.request_seat(db_session, journey.id, passenger.id, seats=2)
    assert seat_req.status.value == "accepted"

    db_session.refresh(journey)
    assert journey.available_seats == 1


def test_trip_service_and_pin_verification(db_session):
    """Test trip creation, dynamic PIN generation, driver verification, and completion metrics."""
    driver = User(full_name="Sanjay Rao", mobile_number="+919876543234", role=UserRole.DRIVER)
    passenger = User(full_name="Ananya Sen", mobile_number="+919876543235", role=UserRole.PASSENGER)
    db_session.add_all([driver, passenger])
    db_session.commit()

    journey = Journey(
        driver_id=driver.id,
        origin_station="Vanaz",
        destination_zone="Hinjawadi Phase 1",
        departure_time=datetime.now(timezone.utc) + timedelta(minutes=15),
        vehicle_category=VehicleCategory.FOUR_WHEELER,
        total_seats=3,
        available_seats=2,
        estimated_total_cost=65.0,
    )
    db_session.add(journey)
    db_session.commit()

    # 1. Start trip
    trip = TripService.get_or_create_trip(db_session, journey.id)
    assert trip.status == TripStatus.CONFIRMED

    # 2. Get dynamic PIN for passenger
    pin_data = TripService.get_dynamic_pin(db_session, trip.id, passenger.id)
    assert len(pin_data.pin) == 4
    assert pin_data.trip_id == trip.id
    assert pin_data.passenger_id == passenger.id
    raw_pin = pin_data.pin

    # 3. Test verification with wrong PIN
    verify_bad = TripService.verify_passenger_pin(db_session, trip.id, passenger.id, "0000")
    assert verify_bad.success is False
    assert verify_bad.attempts_remaining == 4
    assert verify_bad.is_trip_started is False

    # 4. Test verification with correct PIN
    verify_good = TripService.verify_passenger_pin(db_session, trip.id, passenger.id, raw_pin)
    assert verify_good.success is True
    assert verify_good.is_trip_started is True

    db_session.refresh(trip)
    assert trip.status == TripStatus.IN_PROGRESS
    assert trip.started_at is not None

    # 5. Complete trip
    completed_trip = TripService.complete_trip(db_session, trip.id)
    assert completed_trip.status == TripStatus.COMPLETED
    assert completed_trip.completed_at is not None

    # 6. Verify trip details & green metrics
    details = TripService.get_trip_details(db_session, trip.id)
    assert details.status == TripStatus.COMPLETED
    assert details.co2_saved_kg > 0.0
    assert details.total_fare == 65.0
