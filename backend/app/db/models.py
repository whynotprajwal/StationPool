"""Database models using SQLAlchemy ORM."""
import uuid
from datetime import datetime, timezone
from enum import Enum as PyEnum

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    Enum,
)
from sqlalchemy.orm import relationship, DeclarativeBase


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def new_uuid() -> str:
    return str(uuid.uuid4())


class Base(DeclarativeBase):
    pass


# ─── Enums ───────────────────────────────────────────────────────────────────

class UserRole(str, PyEnum):
    PASSENGER = "passenger"
    DRIVER = "driver"
    BOTH = "both"


class VerificationStatus(str, PyEnum):
    NOT_SUBMITTED = "not_submitted"
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"


class VehicleCategory(str, PyEnum):
    TWO_WHEELER = "two_wheeler"
    FOUR_WHEELER = "four_wheeler"


class JourneyStatus(str, PyEnum):
    OPEN = "open"
    FULL = "full"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class RequestStatus(str, PyEnum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    REJECTED = "rejected"
    CANCELLED = "cancelled"


class TripStatus(str, PyEnum):
    CONFIRMED = "confirmed"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


# ─── Models ──────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=new_uuid)
    full_name = Column(String(120), nullable=False)
    mobile_number = Column(String(15), unique=True, nullable=False, index=True)
    email = Column(String(120), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.PASSENGER, nullable=False)
    is_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    # OTP
    otp_code = Column(String(10), nullable=True)
    otp_expires_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    driver_profile = relationship("DriverProfile", back_populates="user", uselist=False)
    journeys = relationship("Journey", back_populates="driver")
    seat_requests = relationship("SeatRequest", back_populates="passenger")


class DriverProfile(Base):
    __tablename__ = "driver_profiles"

    id = Column(String, primary_key=True, default=new_uuid)
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)

    # Verification
    id_type = Column(String(50), nullable=True)
    id_number_masked = Column(String(50), nullable=True)  # Always masked, e.g. XXXX XXXX 1234
    dl_number = Column(String(50), nullable=True)
    dl_expiry = Column(String(20), nullable=True)
    id_verification_status = Column(
        Enum(VerificationStatus), default=VerificationStatus.NOT_SUBMITTED
    )
    dl_verification_status = Column(
        Enum(VerificationStatus), default=VerificationStatus.NOT_SUBMITTED
    )
    overall_status = Column(
        Enum(VerificationStatus), default=VerificationStatus.NOT_SUBMITTED
    )

    # Vehicle
    vehicle_category = Column(Enum(VehicleCategory), nullable=True)
    vehicle_make_model = Column(String(100), nullable=True)
    vehicle_registration = Column(String(20), nullable=True)
    vehicle_capacity = Column(Integer, default=1)  # total passenger seats
    available_seats = Column(Integer, default=1)
    has_helmet = Column(Boolean, default=False)

    submitted_at = Column(DateTime(timezone=True), nullable=True)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=utcnow)

    # Relationships
    user = relationship("User", back_populates="driver_profile")


class Journey(Base):
    __tablename__ = "journeys"

    id = Column(String, primary_key=True, default=new_uuid)
    driver_id = Column(String, ForeignKey("users.id"), nullable=False)

    # Route
    origin_station = Column(String(100), nullable=False)
    destination_zone = Column(String(100), nullable=False)
    destination_label = Column(String(200), nullable=True)

    # Timing
    departure_time = Column(DateTime(timezone=True), nullable=False)

    # Vehicle
    vehicle_category = Column(Enum(VehicleCategory), nullable=False)
    total_seats = Column(Integer, nullable=False)
    available_seats = Column(Integer, nullable=False)

    # Cost
    estimated_total_cost = Column(Float, default=0.0)

    # Status
    status = Column(Enum(JourneyStatus), default=JourneyStatus.OPEN)

    created_at = Column(DateTime(timezone=True), default=utcnow)

    # Relationships
    driver = relationship("User", back_populates="journeys")
    seat_requests = relationship("SeatRequest", back_populates="journey")
    trip = relationship("Trip", back_populates="journey", uselist=False)


class SeatRequest(Base):
    __tablename__ = "seat_requests"

    id = Column(String, primary_key=True, default=new_uuid)
    journey_id = Column(String, ForeignKey("journeys.id"), nullable=False)
    passenger_id = Column(String, ForeignKey("users.id"), nullable=False)

    seats_requested = Column(Integer, default=1)
    status = Column(Enum(RequestStatus), default=RequestStatus.PENDING)

    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    # Relationships
    journey = relationship("Journey", back_populates="seat_requests")
    passenger = relationship("User", back_populates="seat_requests")


class Trip(Base):
    __tablename__ = "trips"

    id = Column(String, primary_key=True, default=new_uuid)
    journey_id = Column(String, ForeignKey("journeys.id"), unique=True, nullable=False)

    status = Column(Enum(TripStatus), default=TripStatus.CONFIRMED)

    started_at = Column(DateTime(timezone=True), nullable=True)
    completed_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=utcnow)

    # Relationships
    journey = relationship("Journey", back_populates="trip")
    verifications = relationship("TripVerification", back_populates="trip")


class TripVerification(Base):
    __tablename__ = "trip_verifications"

    id = Column(String, primary_key=True, default=new_uuid)
    trip_id = Column(String, ForeignKey("trips.id"), nullable=False)
    passenger_id = Column(String, ForeignKey("users.id"), nullable=False)

    # Store only the hash, never the raw PIN
    pin_hash = Column(String(64), nullable=False)
    pin_expires_at = Column(DateTime(timezone=True), nullable=False)

    attempt_count = Column(Integer, default=0)
    max_attempts = Column(Integer, default=5)
    is_verified = Column(Boolean, default=False)
    verified_at = Column(DateTime(timezone=True), nullable=True)

    created_at = Column(DateTime(timezone=True), default=utcnow)

    # Relationships
    trip = relationship("Trip", back_populates="verifications")
