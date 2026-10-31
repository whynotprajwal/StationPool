"""Active Trip and Dynamic PIN verification endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from app.api.deps import get_current_user
from app.schemas.trip import (
    TripCreate,
    TripResponse,
    DynamicPinResponse,
    PinVerifyRequest,
    PinVerifyResponse,
    CompleteTripRequest,
)
from app.services.trip_service import TripService

router = APIRouter(prefix="/trips", tags=["Trips"])


@router.post("/start", response_model=TripResponse, status_code=status.HTTP_201_CREATED)
def start_trip(payload: TripCreate, db: Session = Depends(get_db)):
    """Initialize or get active trip for a journey."""
    trip = TripService.get_or_create_trip(db, payload.journey_id)
    return TripService.get_trip_details(db, trip.id)


@router.get("/mine", response_model=list[TripResponse])
def my_trips(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Trip history for the signed-in commuter (driver or passenger)."""
    return TripService.get_user_trips(db, current_user.id)


@router.get("/{trip_id}", response_model=TripResponse)
def get_trip(trip_id: str, db: Session = Depends(get_db)):
    """Get active trip details, passengers, and status."""
    return TripService.get_trip_details(db, trip_id)


@router.get("/{trip_id}/pin", response_model=DynamicPinResponse)
def get_passenger_pin(
    trip_id: str,
    passenger_id: str = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get or generate the dynamic 4-digit verification PIN and QR payload for a passenger."""
    effective_passenger_id = passenger_id if passenger_id else current_user.id
    return TripService.get_dynamic_pin(db, trip_id, effective_passenger_id)


@router.post("/verify-pin", response_model=PinVerifyResponse)
def verify_pin(
    payload: PinVerifyRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Driver verifies passenger entered PIN at the station gate/pickup point."""
    return TripService.verify_passenger_pin(
        db, payload.trip_id, payload.passenger_id, payload.pin
    )


@router.post("/complete", response_model=TripResponse)
def complete_trip(
    payload: CompleteTripRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Mark trip completed and calculate metrics."""
    trip = TripService.complete_trip(db, payload.trip_id)
    return TripService.get_trip_details(db, trip.id)
