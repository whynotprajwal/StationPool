"""Driver schemas."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.db.models import VehicleCategory, VerificationStatus


class DriverRegisterRequest(BaseModel):
    id_type: str = Field(..., description="Aadhaar, Voter ID, PAN, etc.")
    id_number: str = Field(..., description="Raw ID number to be masked")
    dl_number: str = Field(..., description="Driving License number")
    dl_expiry: Optional[str] = None
    vehicle_category: VehicleCategory = VehicleCategory.FOUR_WHEELER
    vehicle_make_model: str = Field(..., min_length=2)
    vehicle_registration: str = Field(..., min_length=4)
    vehicle_capacity: int = Field(default=3, ge=1, le=8)
    has_helmet: bool = False


class DriverProfileResponse(BaseModel):
    id: str
    user_id: str
    id_type: Optional[str] = None
    id_number_masked: Optional[str] = None
    dl_number: Optional[str] = None
    dl_expiry: Optional[str] = None
    id_verification_status: VerificationStatus
    dl_verification_status: VerificationStatus
    overall_status: VerificationStatus
    vehicle_category: Optional[VehicleCategory] = None
    vehicle_make_model: Optional[str] = None
    vehicle_registration: Optional[str] = None
    vehicle_capacity: int
    available_seats: int
    has_helmet: bool
    submitted_at: Optional[datetime] = None
    verified_at: Optional[datetime] = None

    class Config:
        from_attributes = True
