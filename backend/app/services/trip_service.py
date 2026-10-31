"""Trip service handling active rides, dynamic PIN security verification, and trip completion."""
from datetime import datetime, timedelta, timezone
from typing import Optional, List, Dict
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from fastapi import HTTPException, status

from app.core.security import hash_pin, generate_trip_pin
from app.db.models import (
    Trip,
    TripStatus,
    Journey,
    JourneyStatus,
    SeatRequest,
    RequestStatus,
    TripVerification,
    User,
    DriverProfile,
)
from app.schemas.trip import (
    DynamicPinResponse,
    PinVerifyResponse,
    TripResponse,
    TripPassengerSummary,
)
from app.schemas.journey import JourneyResponse, DriverSummary

# In-memory transient store for cleartext PIN display to passenger in dev/app session
# In production this would be delivered via encrypted secure channel or SMS
_ACTIVE_PINS: Dict[str, str] = {}


def to_utc(dt: Optional[datetime]) -> Optional[datetime]:
    if dt is None:
        return None
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


class TripService:
    @staticmethod
    def get_or_create_trip(db: Session, journey_id: str) -> Trip:
        journey = db.query(Journey).filter(Journey.id == journey_id).first()
        if not journey:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journey not found")

        trip = db.query(Trip).filter(Trip.journey_id == journey_id).first()
        if not trip:
            trip = Trip(
                journey_id=journey_id,
                status=TripStatus.CONFIRMED,
            )
            db.add(trip)
            db.commit()
            db.refresh(trip)

        return trip

    @staticmethod
    def get_dynamic_pin(db: Session, trip_id: str, passenger_id: str) -> DynamicPinResponse:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

        # Check existing verification record
        verification = db.query(TripVerification).filter(
            TripVerification.trip_id == trip_id,
            TripVerification.passenger_id == passenger_id,
        ).first()

        now = datetime.now(timezone.utc)
        cache_key = f"{trip_id}:{passenger_id}"

        if verification and to_utc(verification.pin_expires_at) > now and cache_key in _ACTIVE_PINS:
            pin = _ACTIVE_PINS[cache_key]
            expires_at = verification.pin_expires_at
        else:
            # Generate new 4-digit PIN
            pin = generate_trip_pin(4)
            _ACTIVE_PINS[cache_key] = pin
            expires_at = now + timedelta(minutes=30)
            hashed = hash_pin(pin)

            if not verification:
                verification = TripVerification(
                    trip_id=trip_id,
                    passenger_id=passenger_id,
                    pin_hash=hashed,
                    pin_expires_at=expires_at,
                    attempt_count=0,
                    is_verified=False,
                )
                db.add(verification)
            else:
                verification.pin_hash = hashed
                verification.pin_expires_at = expires_at
                verification.attempt_count = 0
                verification.is_verified = False

            db.commit()
            db.refresh(verification)

        qr_payload = f"STATIONPOOL:{trip_id}:{passenger_id}:{pin}"

        return DynamicPinResponse(
            pin=pin,
            expires_at=expires_at,
            qr_payload=qr_payload,
            passenger_id=passenger_id,
            trip_id=trip_id,
        )

    @staticmethod
    def verify_passenger_pin(
        db: Session, trip_id: str, passenger_id: str, entered_pin: str
    ) -> PinVerifyResponse:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

        verification = db.query(TripVerification).filter(
            TripVerification.trip_id == trip_id,
            TripVerification.passenger_id == passenger_id,
        ).first()

        if not verification:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Verification record not found for this passenger and trip",
            )

        if verification.is_verified:
            return PinVerifyResponse(
                success=True,
                message="Passenger already verified",
                attempts_remaining=5,
                is_trip_started=trip.status == TripStatus.IN_PROGRESS,
            )

        if verification.attempt_count >= verification.max_attempts:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Maximum verification attempts exceeded. Please regenerate PIN.",
            )

        if to_utc(verification.pin_expires_at) < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="PIN has expired. Please ask passenger to refresh screen.",
            )

        hashed_input = hash_pin(entered_pin.strip())
        if hashed_input != verification.pin_hash:
            verification.attempt_count += 1
            db.commit()
            remaining = verification.max_attempts - verification.attempt_count
            return PinVerifyResponse(
                success=False,
                message=f"Invalid PIN. {remaining} attempt(s) remaining.",
                attempts_remaining=remaining,
                is_trip_started=False,
            )

        # Successfully verified!
        verification.is_verified = True
        verification.verified_at = datetime.now(timezone.utc)

        # Check if all passengers for this trip are verified or at least one is verified to begin
        trip.status = TripStatus.IN_PROGRESS
        trip.started_at = datetime.now(timezone.utc)

        journey = db.query(Journey).filter(Journey.id == trip.journey_id).first()
        if journey:
            journey.status = JourneyStatus.IN_PROGRESS

        db.commit()
        db.refresh(verification)
        db.refresh(trip)

        return PinVerifyResponse(
            success=True,
            message="Passenger PIN verified successfully! Journey in transit.",
            attempts_remaining=5,
            is_trip_started=True,
        )

    @staticmethod
    def get_user_trips(db: Session, user_id: str) -> List[TripResponse]:
        """All trips the user is involved in, as driver or accepted passenger."""
        trip_rows = (
            db.query(Trip)
            .join(Journey, Trip.journey_id == Journey.id)
            .outerjoin(SeatRequest, SeatRequest.journey_id == Journey.id)
            .filter(
                or_(
                    Journey.driver_id == user_id,
                    and_(
                        SeatRequest.passenger_id == user_id,
                        SeatRequest.status == RequestStatus.ACCEPTED,
                    ),
                )
            )
            .distinct()
            .order_by(Trip.created_at.desc())
            .all()
        )
        return [TripService.get_trip_details(db, t.id) for t in trip_rows]

    @staticmethod
    def complete_trip(db: Session, trip_id: str) -> Trip:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

        trip.status = TripStatus.COMPLETED
        trip.completed_at = datetime.now(timezone.utc)

        journey = db.query(Journey).filter(Journey.id == trip.journey_id).first()
        if journey:
            journey.status = JourneyStatus.COMPLETED

        db.commit()
        db.refresh(trip)
        return trip

    @staticmethod
    def get_trip_details(db: Session, trip_id: str) -> TripResponse:
        trip = db.query(Trip).filter(Trip.id == trip_id).first()
        if not trip:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Trip not found")

        journey = db.query(Journey).filter(Journey.id == trip.journey_id).first()
        passengers_summary: List[TripPassengerSummary] = []

        if journey:
            requests = db.query(SeatRequest).filter(
                SeatRequest.journey_id == journey.id,
                SeatRequest.status == RequestStatus.ACCEPTED,
            ).all()

            for req in requests:
                user = db.query(User).filter(User.id == req.passenger_id).first()
                ver = db.query(TripVerification).filter(
                    TripVerification.trip_id == trip.id,
                    TripVerification.passenger_id == req.passenger_id,
                ).first()

                if user:
                    passengers_summary.append(
                        TripPassengerSummary(
                            id=user.id,
                            full_name=user.full_name,
                            mobile_number=user.mobile_number,
                            seats_requested=req.seats_requested,
                            is_verified=ver.is_verified if ver else False,
                            verified_at=ver.verified_at if ver else None,
                        )
                    )

        # Build driver and journey response
        driver_summary = None
        if journey:
            driver = db.query(User).filter(User.id == journey.driver_id).first()
            profile = db.query(DriverProfile).filter(DriverProfile.user_id == journey.driver_id).first()
            if driver:
                driver_summary = DriverSummary(
                    id=driver.id,
                    full_name=driver.full_name,
                    mobile_number=driver.mobile_number,
                    is_verified=driver.is_verified,
                    rating=4.9,
                    vehicle_model=profile.vehicle_make_model if profile else "Honda City",
                    vehicle_registration=profile.vehicle_registration if profile else "MH 12 AB 1234",
                )

        journey_res = None
        if journey:
            journey_res = JourneyResponse(
                id=journey.id,
                driver_id=journey.driver_id,
                origin_station=journey.origin_station,
                destination_zone=journey.destination_zone,
                destination_label=journey.destination_label,
                departure_time=journey.departure_time,
                vehicle_category=journey.vehicle_category,
                total_seats=journey.total_seats,
                available_seats=journey.available_seats,
                estimated_total_cost=journey.estimated_total_cost,
                status=journey.status,
                created_at=journey.created_at,
                driver=driver_summary,
            )

        # Calculate metrics: ~1.8kg CO2 saved per passenger, fare calculation
        num_passengers = max(len(passengers_summary), 1)
        co2_saved = round(num_passengers * 1.84, 1)
        fare = journey.estimated_total_cost if journey else 60.0

        return TripResponse(
            id=trip.id,
            journey_id=trip.journey_id,
            status=trip.status,
            started_at=trip.started_at,
            completed_at=trip.completed_at,
            journey=journey_res,
            passengers=passengers_summary,
            total_fare=fare,
            co2_saved_kg=co2_saved,
        )
