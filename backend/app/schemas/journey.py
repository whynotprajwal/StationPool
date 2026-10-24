"""Journey and Matching schemas."""
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field
from app.db.models import VehicleCategory, JourneyStatus, RequestStatus


class JourneyCreate(BaseModel):
    origin_station: str = Field(..., description="Metro Station name, e.g. Vanaz, Civil Court, Ramwadi")
    destination_zone: str = Field(..., description="Tech park, office hub or zone, e.g. Hinjawadi Phase 1, Magarpatta, EON Kharadi")
    destination_label: Optional[str] = "Tech Park Gate 2"
    departure_time: datetime
    vehicle_category: VehicleCategory = VehicleCategory.FOUR_WHEELER
    total_seats: int = Field(default=3, ge=1, le=8)
    estimated_total_cost: float = Field(default=60.0, ge=0.0)


class DriverSummary(BaseModel):
    id: str
    full_name: str
    mobile_number: str
    is_verified: bool
    rating: float = 4.9
    vehicle_model: Optional[str] = None
    vehicle_registration: Optional[str] = None


class JourneyResponse(BaseModel):
    id: str
    driver_id: str
    origin_station: str
    destination_zone: str
    destination_label: Optional[str] = None
    departure_time: datetime
    vehicle_category: VehicleCategory
    total_seats: int
    available_seats: int
    estimated_total_cost: float
    status: JourneyStatus
    created_at: Optional[datetime] = None
    driver: Optional[DriverSummary] = None

    class Config:
        from_attributes = True


class SeatRequestCreate(BaseModel):
    journey_id: str
    seats_requested: int = Field(default=1, ge=1, le=4)


class SeatRequestResponse(BaseModel):
    id: str
    journey_id: str
    passenger_id: str
    seats_requested: int
    status: RequestStatus
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class JourneySearchQuery(BaseModel):
    origin_station: Optional[str] = None
    destination_zone: Optional[str] = None
    vehicle_category: Optional[VehicleCategory] = None
