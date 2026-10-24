"""Database seeder with Pune Metro stations, sample verified drivers, and live journeys."""
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
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


@router.post("")
def seed_sample_data(db: Session = Depends(get_db)):
    """Seed sample drivers, vehicles, and active journeys for immediate testing."""
    now = datetime.now(timezone.utc)

    # 1. Driver: Rahul Deshmukh
    rahul = db.query(User).filter(User.mobile_number == "+919876543210").first()
    if not rahul:
        rahul = User(
            full_name="Rahul Deshmukh",
            mobile_number="+919876543210",
            email="rahul.deshmukh@cognizant.com",
            role=UserRole.BOTH,
            is_verified=True,
        )
        db.add(rahul)
        db.commit()
        db.refresh(rahul)

        rahul_profile = DriverProfile(
            user_id=rahul.id,
            id_type="Aadhaar",
            id_number_masked="•••• •••• 8842",
            dl_number="MH12-20180045612",
            dl_expiry="2038-04-12",
            id_verification_status=VerificationStatus.VERIFIED,
            dl_verification_status=VerificationStatus.VERIFIED,
            overall_status=VerificationStatus.VERIFIED,
            vehicle_category=VehicleCategory.FOUR_WHEELER,
            vehicle_make_model="Honda City (Silver)",
            vehicle_registration="MH 12 QX 4509",
            vehicle_capacity=4,
            available_seats=3,
            has_helmet=False,
            submitted_at=now,
            verified_at=now,
        )
        db.add(rahul_profile)
        db.commit()

    # 2. Driver: Priya Sharma
    priya = db.query(User).filter(User.mobile_number == "+919876543211").first()
    if not priya:
        priya = User(
            full_name="Priya Sharma",
            mobile_number="+919876543211",
            email="priya.sharma@tcs.com",
            role=UserRole.BOTH,
            is_verified=True,
        )
        db.add(priya)
        db.commit()
        db.refresh(priya)

        priya_profile = DriverProfile(
            user_id=priya.id,
            id_type="PAN Card",
            id_number_masked="•••• •••• 1928",
            dl_number="MH14-20200089332",
            dl_expiry="2040-08-25",
            id_verification_status=VerificationStatus.VERIFIED,
            dl_verification_status=VerificationStatus.VERIFIED,
            overall_status=VerificationStatus.VERIFIED,
            vehicle_category=VehicleCategory.FOUR_WHEELER,
            vehicle_make_model="Hyundai Creta (White)",
            vehicle_registration="MH 14 DE 7731",
            vehicle_capacity=4,
            available_seats=2,
            has_helmet=False,
            submitted_at=now,
            verified_at=now,
        )
        db.add(priya_profile)
        db.commit()

    # 3. Passenger: Tanvi Joshi
    tanvi = db.query(User).filter(User.mobile_number == "+919876543220").first()
    if not tanvi:
        tanvi = User(
            full_name="Tanvi Joshi",
            mobile_number="+919876543220",
            email="tanvi.joshi@infosys.com",
            role=UserRole.PASSENGER,
            is_verified=True,
        )
        db.add(tanvi)
        db.commit()
        db.refresh(tanvi)

    # 4. Journeys
    j1 = db.query(Journey).filter(Journey.driver_id == rahul.id).first()
    if not j1:
        j1 = Journey(
            driver_id=rahul.id,
            origin_station="Ramwadi",
            destination_zone="EON IT Park Kharadi",
            destination_label="Gate 1 (Near Tower A)",
            departure_time=now + timedelta(minutes=15),
            vehicle_category=VehicleCategory.FOUR_WHEELER,
            total_seats=3,
            available_seats=2,
            estimated_total_cost=55.0,
            status=JourneyStatus.OPEN,
        )
        db.add(j1)
        db.commit()
        db.refresh(j1)

        # Passenger booking
        req1 = SeatRequest(
            journey_id=j1.id,
            passenger_id=tanvi.id,
            seats_requested=1,
            status=RequestStatus.ACCEPTED,
        )
        db.add(req1)
        db.commit()

        # Seed Trip & dynamic PIN for j1
        trip1 = TripService.get_or_create_trip(db, j1.id)
        TripService.get_dynamic_pin(db, trip1.id, tanvi.id)

    j2 = db.query(Journey).filter(Journey.driver_id == priya.id).first()
    if not j2:
        j2 = Journey(
            driver_id=priya.id,
            origin_station="Vanaz",
            destination_zone="Hinjawadi Phase 1",
            destination_label="Wipro Circle",
            departure_time=now + timedelta(minutes=25),
            vehicle_category=VehicleCategory.FOUR_WHEELER,
            total_seats=3,
            available_seats=3,
            estimated_total_cost=75.0,
            status=JourneyStatus.OPEN,
        )
        db.add(j2)
        db.commit()
        db.refresh(j2)

    return {
        "status": "success",
        "message": "Sample Pune Metro drivers, commuters, and feeder journeys seeded successfully!",
        "seeded_journeys": [j1.id, j2.id if j2 else None],
    }
