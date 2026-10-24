"""Journey publishing, search, and seat booking endpoints."""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User, VehicleCategory
from app.api.deps import get_current_user, get_optional_current_user
from app.schemas.journey import (
    JourneyCreate,
    JourneyResponse,
    SeatRequestCreate,
    SeatRequestResponse,
)
from app.services.journey_service import JourneyService

router = APIRouter(prefix="/journeys", tags=["Journeys"])


@router.post("/publish", response_model=JourneyResponse, status_code=status.HTTP_201_CREATED)
def publish_journey(
    payload: JourneyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Publish a commuter journey from a Pune Metro station to an onward zone."""
    journey = JourneyService.create_journey(db, current_user.id, payload)
    return JourneyService.to_journey_response(journey, db)


@router.get("/search", response_model=List[JourneyResponse])
def search_journeys(
    origin_station: Optional[str] = Query(None, description="Station name (e.g. Vanaz, Civil Court)"),
    destination_zone: Optional[str] = Query(None, description="Destination zone (e.g. Hinjawadi, Magarpatta)"),
    vehicle_category: Optional[VehicleCategory] = Query(None),
    db: Session = Depends(get_db),
):
    """Search available carpool journeys from metro stations."""
    journeys = JourneyService.search_journeys(
        db, origin_station, destination_zone, vehicle_category
    )
    return [JourneyService.to_journey_response(j, db) for j in journeys]


@router.get("/{journey_id}", response_model=JourneyResponse)
def get_journey(journey_id: str, db: Session = Depends(get_db)):
    """Get details of a specific journey."""
    journey = JourneyService.get_journey_by_id(db, journey_id)
    if not journey:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Journey not found")
    return JourneyService.to_journey_response(journey, db)


@router.post("/request-seat", response_model=SeatRequestResponse)
def request_seat(
    payload: SeatRequestCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Request and instantly reserve seat on a journey."""
    req = JourneyService.request_seat(db, payload.journey_id, current_user.id, payload.seats_requested)
    return SeatRequestResponse.model_validate(req)
