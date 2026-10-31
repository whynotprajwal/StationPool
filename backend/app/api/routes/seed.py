"""Database seeder with Pune Metro stations, sample verified drivers, and live journeys."""
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db, SessionLocal
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
)
from app.services.trip_service import TripService

router = APIRouter(prefix="/seed", tags=["Seed"])

DEMO_COMMUTERS = {
    "rahul": "+919876543210",
    "priya": "+919876543211",
    "amit": "+919876543212",
    "tanvi": "+919876543220",
    "rohit": "+919876543221",
}


def _get_or_create_user(
    db: Session,
    full_name: str,
    mobile: str,
    role: UserRole,
    email: str | None = None,
) -> User:
    user = db.query(User).filter(User.mobile_number == mobile).first()
    if user:
        return user
    user = User(
        full_name=full_name,
        mobile_number=mobile,
        email=email,
        role=role,
        is_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _get_or_create_driver_profile(
    db: Session,
    user: User,
    vehicle_model: str,
    vehicle_registration: str,
    capacity: int,
    available: int,
    vehicle_category: VehicleCategory = VehicleCategory.FOUR_WHEELER,
) -> DriverProfile:
    profile = db.query(DriverProfile).filter(DriverProfile.user_id == user.id).first()
    if profile:
        return profile
    profile = DriverProfile(
        user_id=user.id,
        id_type="Aadhaar",
        id_number_masked="•••• •••• 8842",
        dl_number="MH12-20180045612",
        dl_expiry="2038-04-12",
        id_verification_status=VerificationStatus.VERIFIED,
        dl_verification_status=VerificationStatus.VERIFIED,
        overall_status=VerificationStatus.VERIFIED,
        vehicle_category=vehicle_category,
        vehicle_make_model=vehicle_model,
        vehicle_registration=vehicle_registration,
        vehicle_capacity=capacity,
        available_seats=available,
        has_helmet=vehicle_category == VehicleCategory.TWO_WHEELER,
        submitted_at=datetime.now(timezone.utc),
        verified_at=datetime.now(timezone.utc),
    )
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


def _seed_completed_trip(
    db: Session,
    driver: User,
    passenger: User,
    origin: str,
    destination: str,
    cost: float,
    when: datetime,
) -> None:
    """Create a historical completed journey + trip for the activity feed."""
    existing = (
        db.query(Journey)
        .filter(
            Journey.driver_id == driver.id,
            Journey.origin_station == origin,
            Journey.destination_zone == destination,
            Journey.departure_time == when,
        )
        .first()
    )
    if existing:
        return

    journey = Journey(
        driver_id=driver.id,
        origin_station=origin,
        destination_zone=destination,
        destination_label="Main Gate",
        departure_time=when,
        vehicle_category=VehicleCategory.FOUR_WHEELER,
        total_seats=3,
        available_seats=2,
        estimated_total_cost=cost,
        status=JourneyStatus.COMPLETED,
    )
    db.add(journey)
    db.commit()
    db.refresh(journey)

    db.add(
        SeatRequest(
            journey_id=journey.id,
            passenger_id=passenger.id,
            seats_requested=1,
            status=RequestStatus.ACCEPTED,
        )
    )
    trip = Trip(
        journey_id=journey.id,
        status=TripStatus.COMPLETED,
        started_at=when,
        completed_at=when + timedelta(minutes=22),
    )
    db.add(trip)
    db.commit()


def seed_sample_data(db: Session) -> dict:
    """Seed demo drivers, passengers, live journeys, and trip history (idempotent)."""
    now = datetime.now(timezone.utc)

    rahul = _get_or_create_user(
        db, "Rahul Deshmukh", DEMO_COMMUTERS["rahul"], UserRole.BOTH, "rahul@cognizant.com"
    )
    _get_or_create_driver_profile(db, rahul, "Honda City (Silver)", "MH 12 QX 4509", 4, 3)

    priya = _get_or_create_user(
        db, "Priya Sharma", DEMO_COMMUTERS["priya"], UserRole.BOTH, "priya@tcs.com"
    )
    _get_or_create_driver_profile(db, priya, "Hyundai Creta (White)", "MH 14 DE 7731", 4, 2)

    amit = _get_or_create_user(
        db, "Amit Kulkarni", DEMO_COMMUTERS["amit"], UserRole.BOTH, "amit@infosys.com"
    )
    _get_or_create_driver_profile(
        db,
        amit,
        "Ather 450X (Space Grey)",
        "MH 12 AT 2210",
        1,
        1,
        vehicle_category=VehicleCategory.TWO_WHEELER,
    )

    tanvi = _get_or_create_user(
        db, "Tanvi Joshi", DEMO_COMMUTERS["tanvi"], UserRole.PASSENGER, "tanvi@infosys.com"
    )
    rohit = _get_or_create_user(
        db, "Rohit Patil", DEMO_COMMUTERS["rohit"], UserRole.PASSENGER, "rohit@persistent.com"
    )

    # Live journey #1 — Rahul, Ramwadi → EON IT Park
    j1 = db.query(Journey).filter(Journey.driver_id == rahul.id).first()
    if not j1:
        j1 = Journey(
            driver_id=rahul.id,
            origin_station="Ramwadi",
            destination_zone="EON IT Park Kharadi",
            destination_label="Gate 1 (Near Tower A)",
            departure_time=now + timedelta(minutes=12),
            vehicle_category=VehicleCategory.FOUR_WHEELER,
            total_seats=3,
            available_seats=2,
            estimated_total_cost=55.0,
            status=JourneyStatus.OPEN,
        )
        db.add(j1)
        db.commit()
        db.refresh(j1)

        db.add(
            SeatRequest(
                journey_id=j1.id,
                passenger_id=tanvi.id,
                seats_requested=1,
                status=RequestStatus.ACCEPTED,
            )
        )
        db.commit()

        trip1 = TripService.get_or_create_trip(db, j1.id)
        TripService.get_dynamic_pin(db, trip1.id, tanvi.id)

    # Live journey #2 — Priya, Vanaz → Hinjawadi Phase 1
    j2 = db.query(Journey).filter(Journey.driver_id == priya.id).first()
    if not j2:
        j2 = Journey(
            driver_id=priya.id,
            origin_station="Vanaz",
            destination_zone="Hinjawadi Phase 1",
            destination_label="Wipro Circle",
            departure_time=now + timedelta(minutes=24),
            vehicle_category=VehicleCategory.FOUR_WHEELER,
            total_seats=3,
            available_seats=3,
            estimated_total_cost=75.0,
            status=JourneyStatus.OPEN,
        )
        db.add(j2)
        db.commit()
        db.refresh(j2)

    # Live journey #3 — Amit (bike pool), Kalyani Nagar → Magarpatta
    j3 = db.query(Journey).filter(Journey.driver_id == amit.id).first()
    if not j3:
        j3 = Journey(
            driver_id=amit.id,
            origin_station="Kalyani Nagar",
            destination_zone="Magarpatta City",
            destination_label="Destination Gate 3",
            departure_time=now + timedelta(minutes=8),
            vehicle_category=VehicleCategory.TWO_WHEELER,
            total_seats=1,
            available_seats=1,
            estimated_total_cost=40.0,
            status=JourneyStatus.OPEN,
        )
        db.add(j3)
        db.commit()
        db.refresh(j3)

    # Historical trips for the activity feed
    _seed_completed_trip(
        db, rahul, tanvi, "Ramwadi", "EON IT Park Kharadi", 55.0, now - timedelta(days=1, hours=2)
    )
    _seed_completed_trip(
        db, priya, tanvi, "Vanaz", "Hinjawadi Phase 1", 75.0, now - timedelta(days=2, hours=10)
    )
    _seed_completed_trip(
        db, rahul, rohit, "Pune Railway Station", "Magarpatta City", 65.0, now - timedelta(days=3)
    )

    return {
        "status": "success",
        "message": "Sample Pune Metro drivers, commuters, and feeder journeys seeded successfully!",
        "seeded_journeys": [j1.id, j2.id if j2 else None, j3.id if j3 else None],
    }


@router.post("")
def seed_endpoint(db: Session = Depends(get_db)):
    """Seed sample drivers, vehicles, and active journeys for immediate testing."""
    return seed_sample_data(db)


def auto_seed_if_empty() -> None:
    """Populate demo data on first startup so the prototype is never empty."""
    db = SessionLocal()
    try:
        if db.query(Journey).count() == 0:
            seed_sample_data(db)
    finally:
        db.close()
