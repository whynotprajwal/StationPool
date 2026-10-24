"""Trip schemas for active rides, dynamic PIN verification, and completion."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.db.models import TripStatus, VehicleCategory
from app.schemas.journey import JourneyResponse, DriverSummary


class TripCreate(BaseModel):
    journey_id: str


class DynamicPinResponse(BaseModel):
    pin: str
    expires_at: datetime
    qr_payload: str
    passenger_id: str
    trip_id: str


class PinVerifyRequest(BaseModel):
    trip_id: str
    passenger_id: str
    pin: str = Field(..., min_length=4, max_length=6)


class PinVerifyResponse(BaseModel):
    success: bool
    message: str
    attempts_remaining: int
    is_trip_started: bool


class TripPassengerSummary(BaseModel):
    id: str
    full_name: str
    mobile_number: str
    seats_requested: int
    is_verified: bool
    verified_at: Optional[datetime] = None


class TripResponse(BaseModel):
    id: str
    journey_id: str
    status: TripStatus
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    journey: Optional[JourneyResponse] = None
    passengers: List[TripPassengerSummary] = []
    total_fare: float = 0.0
    co2_saved_kg: float = 0.0

    class Config:
        from_attributes = True


class CompleteTripRequest(BaseModel):
    trip_id: str
