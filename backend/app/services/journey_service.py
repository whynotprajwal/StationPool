"""Journey publishing, search, and matching service for Pune Metro stations."""
from datetime import datetime, timezone
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status

from app.db.models import Journey, JourneyStatus, SeatRequest, RequestStatus, User, DriverProfile, VehicleCategory
from app.schemas.journey import JourneyCreate, JourneyResponse, DriverSummary


# Pune Metro Station Directory & Common Feeder Zones
PUNE_METRO_STATIONS = [
    # Aqua Line (Line 2: Vanaz to Ramwadi)
    "Vanaz",
    "Anand Nagar",
    "Ideal Colony",
    "Nal Stop",
    "Garware College",
    "Deccan Gymkhana",
    "Chhatrapati Sambhaji Udyan",
    "PMC",
    "Civil Court",
    "Mangalwar Peth",
    "Pune Railway Station",
    "Ruby Hall Clinic",
    "Bund Garden",
    "Kalyani Nagar",
    "Ramwadi",
    # Purple Line (Line 1: PCMC to Swargate)
    "PCMC",
    "Sant Tukaram Nagar",
    "Bhosari",
    "Kasarwadi",
    "Phugewadi",
    "Dapodi",
    "Bopodi",
    "Shivaji Nagar",
    "Civil Court",
    "Budhwar Peth",
    "Mandai",
    "Swargate",
]

COMMON_FEEDER_DESTINATIONS = [
    "Hinjawadi Phase 1",
    "Hinjawadi Phase 2",
    "Hinjawadi Phase 3",
    "Magarpatta City",
    "EON IT Park Kharadi",
    "Viman Nagar Symbiosis",
    "Aundh ITI Road",
    "Baner Balewadi High Street",
    "Senapati Bapat Road",
    "Yerawada Commerzone",
    "Kalyani Nagar Cerebrum",
    "Hadapsar SP Infocity",
]


class JourneyService:
    @staticmethod
    def create_journey(db: Session, driver_id: str, payload: JourneyCreate) -> Journey:
        user = db.query(User).filter(User.id == driver_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Driver not found")

        journey = Journey(
            driver_id=driver_id,
            origin_station=payload.origin_station.strip(),
            destination_zone=payload.destination_zone.strip(),
            destination_label=payload.destination_label or "Feeder Drop Point",
            departure_time=payload.departure_time,
            vehicle_category=payload.vehicle_category,
            total_seats=payload.total_seats,
            available_seats=payload.total_seats,
            estimated_total_cost=payload.estimated_total_cost,
            status=JourneyStatus.OPEN,
        )
        db.add(journey)
        db.commit()
        db.refresh(journey)
        return journey

    @staticmethod
    def get_journey_by_id(db: Session, journey_id: str) -> Optional[Journey]:
        return db.query(Journey).filter(Journey.id == journey_id).first()

    @staticmethod
    def search_journeys(
        db: Session,
        origin_station: Optional[str] = None,
        destination_zone: Optional[str] = None,
        vehicle_category: Optional[VehicleCategory] = None,
    ) -> List[Journey]:
        query = db.query(Journey).filter(
            Journey.status == JourneyStatus.OPEN,
            Journey.available_seats > 0
        )

        if origin_station:
            query = query.filter(
                Journey.origin_station.ilike(f"%{origin_station.strip()}%")
            )
        if destination_zone:
            query = query.filter(
                Journey.destination_zone.ilike(f"%{destination_zone.strip()}%")
            )
        if vehicle_category:
            query = query.filter(Journey.vehicle_category == vehicle_category)

        return query.order_by(Journey.departure_time.asc()).limit(20).all()

    @staticmethod
    def request_seat(db: Session, journey_id: str, passenger_id: str, seats: int = 1) -> SeatRequest:
        journey = db.query(Journey).filter(Journey.id == journey_id).first()
        if not journey:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journey not found")

        if journey.status != JourneyStatus.OPEN or journey.available_seats < seats:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No available seats on this journey",
            )

        if journey.driver_id == passenger_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Driver cannot request seats on their own journey",
            )

        # Check existing request
        req = db.query(SeatRequest).filter(
            SeatRequest.journey_id == journey_id,
            SeatRequest.passenger_id == passenger_id,
            SeatRequest.status.in_([RequestStatus.PENDING, RequestStatus.ACCEPTED])
        ).first()

        if req:
            return req

        seat_req = SeatRequest(
            journey_id=journey_id,
            passenger_id=passenger_id,
            seats_requested=seats,
            status=RequestStatus.ACCEPTED,  # Auto-confirm for instant pool matching
        )
        journey.available_seats -= seats
        if journey.available_seats <= 0:
            journey.status = JourneyStatus.FULL

        db.add(seat_req)
        db.commit()
        db.refresh(seat_req)
        db.refresh(journey)
        return seat_req

    @staticmethod
    def to_journey_response(journey: Journey, db: Session) -> JourneyResponse:
        driver = db.query(User).filter(User.id == journey.driver_id).first()
        profile = (
            db.query(DriverProfile).filter(DriverProfile.user_id == journey.driver_id).first()
        )

        driver_summary = None
        if driver:
            driver_summary = DriverSummary(
                id=driver.id,
                full_name=driver.full_name,
                mobile_number=driver.mobile_number,
                is_verified=driver.is_verified,
                rating=4.9,
                vehicle_model=profile.vehicle_make_model if profile else "Sedan",
                vehicle_registration=profile.vehicle_registration if profile else "MH 12 AB 1234",
            )

        return JourneyResponse(
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
