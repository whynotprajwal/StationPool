"""Unit tests for StationPool SQLAlchemy database models."""
import pytest
from datetime import datetime, timedelta, timezone
from sqlalchemy.exc import IntegrityError

from app.db.models import (
    User,
    UserRole,
    DriverProfile,
    VehicleCategory,
    VerificationStatus,
    Journey,
    JourneyStatus,
    SeatRequest,
    RequestStatus,
    Trip,
    TripStatus,
    TripVerification,
)
from app.core.security import hash_pin


def test_user_creation_and_defaults(db_session):
    """Test User model creation, default values and UUID generation."""
    user = User(
        full_name="Pooja Deshmukh",
        mobile_number="+919876543201",
        email="pooja@example.com",
        role=UserRole.PASSENGER,
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)

    assert user.id is not None
    assert len(user.id) == 36  # Valid UUID4 string
    assert user.full_name == "Pooja Deshmukh"
    assert user.mobile_number == "+919876543201"
    assert user.role == UserRole.PASSENGER
    assert user.is_verified is False
    assert user.is_active is True
    assert user.created_at is not None


def test_user_unique_mobile_constraint(db_session):
    """Test that mobile numbers must be unique across users."""
    user1 = User(full_name="User 1", mobile_number="+919999999999")
    user2 = User(full_name="User 2", mobile_number="+919999999999")

    db_session.add(user1)
    db_session.commit()

    db_session.add(user2)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


def test_driver_profile_relationship(db_session):
    """Test DriverProfile model creation and 1-to-1 relationship with User."""
    user = User(
        full_name="Rahul Deshmukh",
        mobile_number="+919876543202",
        role=UserRole.DRIVER,
        is_verified=True,
    )
    db_session.add(user)
    db_session.commit()

    profile = DriverProfile(
        user_id=user.id,
        id_type="Aadhaar",
        id_number_masked="•••• •••• 8842",
        dl_number="MH12-20180045612",
        dl_expiry="2038-04-12",
        id_verification_status=VerificationStatus.VERIFIED,
        dl_verification_status=VerificationStatus.VERIFIED,
        overall_status=VerificationStatus.VERIFIED,
        vehicle_category=VehicleCategory.FOUR_WHEELER,
        vehicle_make_model="Honda City",
        vehicle_registration="MH 12 QX 4509",
        vehicle_capacity=4,
        available_seats=3,
        has_helmet=False,
    )
    db_session.add(profile)
    db_session.commit()
    db_session.refresh(user)
    db_session.refresh(profile)

    assert user.driver_profile is not None
    assert user.driver_profile.dl_number == "MH12-20180045612"
    assert profile.user.full_name == "Rahul Deshmukh"
    assert profile.id_number_masked.startswith("••••")
    assert profile.overall_status == VerificationStatus.VERIFIED


def test_journey_model_and_relationships(db_session):
    """Test Journey creation, route attributes, departure time, and driver relationship."""
    driver = User(
        full_name="Amit Kulkarni",
        mobile_number="+919876543203",
        role=UserRole.BOTH,
        is_verified=True,
    )
    db_session.add(driver)
    db_session.commit()

    now = datetime.now(timezone.utc)
    departure = now + timedelta(minutes=20)

    journey = Journey(
        driver_id=driver.id,
        origin_station="Ramwadi",
        destination_zone="EON IT Park Kharadi",
        destination_label="Gate 1 Main Hub",
        departure_time=departure,
        vehicle_category=VehicleCategory.FOUR_WHEELER,
        total_seats=3,
        available_seats=3,
        estimated_total_cost=55.0,
        status=JourneyStatus.OPEN,
    )
    db_session.add(journey)
    db_session.commit()
    db_session.refresh(journey)

    assert journey.id is not None
    assert journey.driver.full_name == "Amit Kulkarni"
    assert journey.origin_station == "Ramwadi"
    assert journey.destination_zone == "EON IT Park Kharadi"
    assert journey.available_seats == 3
    assert journey.status == JourneyStatus.OPEN


def test_seat_request_model(db_session):
    """Test SeatRequest creation, status, and associations with passenger and journey."""
    driver = User(full_name="Driver User", mobile_number="+919876543204", role=UserRole.DRIVER)
    passenger = User(full_name="Passenger User", mobile_number="+919876543205", role=UserRole.PASSENGER)
    db_session.add_all([driver, passenger])
    db_session.commit()

    journey = Journey(
        driver_id=driver.id,
        origin_station="Vanaz",
        destination_zone="Hinjawadi Phase 1",
        departure_time=datetime.now(timezone.utc) + timedelta(minutes=30),
        vehicle_category=VehicleCategory.FOUR_WHEELER,
        total_seats=4,
        available_seats=4,
        status=JourneyStatus.OPEN,
    )
    db_session.add(journey)
    db_session.commit()

    seat_req = SeatRequest(
        journey_id=journey.id,
        passenger_id=passenger.id,
        seats_requested=1,
        status=RequestStatus.ACCEPTED,
    )
    db_session.add(seat_req)
    db_session.commit()
    db_session.refresh(seat_req)

    assert seat_req.id is not None
    assert seat_req.seats_requested == 1
    assert seat_req.status == RequestStatus.ACCEPTED
    assert seat_req.passenger.full_name == "Passenger User"
    assert seat_req.journey.origin_station == "Vanaz"


def test_trip_and_verification_pin_security(db_session):
    """Test Trip creation and TripVerification dynamic SHA-256 PIN security."""
    driver = User(full_name="Trip Driver", mobile_number="+919876543206", role=UserRole.DRIVER)
    passenger = User(full_name="Trip Passenger", mobile_number="+919876543207", role=UserRole.PASSENGER)
    db_session.add_all([driver, passenger])
    db_session.commit()

    journey = Journey(
        driver_id=driver.id,
        origin_station="Civil Court",
        destination_zone="Magarpatta City",
        departure_time=datetime.now(timezone.utc) + timedelta(minutes=15),
        vehicle_category=VehicleCategory.FOUR_WHEELER,
        total_seats=3,
        available_seats=2,
    )
    db_session.add(journey)
    db_session.commit()

    trip = Trip(
        journey_id=journey.id,
        status=TripStatus.CONFIRMED,
    )
    db_session.add(trip)
    db_session.commit()
    db_session.refresh(trip)

    assert trip.id is not None
    assert trip.status == TripStatus.CONFIRMED
    assert trip.journey.origin_station == "Civil Court"

    # Test dynamic PIN hashing: never store raw PIN, only SHA-256
    raw_pin = "4892"
    hashed_pin = hash_pin(raw_pin)
    expiry = datetime.now(timezone.utc) + timedelta(minutes=20)

    ver = TripVerification(
        trip_id=trip.id,
        passenger_id=passenger.id,
        pin_hash=hashed_pin,
        pin_expires_at=expiry,
        attempt_count=0,
        max_attempts=5,
        is_verified=False,
    )
    db_session.add(ver)
    db_session.commit()
    db_session.refresh(ver)

    assert ver.pin_hash == hashed_pin
    assert ver.pin_hash != raw_pin
    assert ver.is_verified is False
    assert ver.attempt_count == 0

    # Verification simulation
    test_input = "4892"
    assert hash_pin(test_input) == ver.pin_hash

    # Mark verified
    ver.is_verified = True
    ver.verified_at = datetime.now(timezone.utc)
    trip.status = TripStatus.IN_PROGRESS
    trip.started_at = datetime.now(timezone.utc)
    db_session.commit()

    db_session.refresh(ver)
    db_session.refresh(trip)
    assert ver.is_verified is True
    assert trip.status == TripStatus.IN_PROGRESS
    assert trip.started_at is not None
