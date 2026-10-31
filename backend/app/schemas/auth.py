"""Authentication and User schemas."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from app.db.models import UserRole


class UserCreate(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=120)
    mobile_number: str = Field(..., pattern=r"^[0-9+\s\-]{10,15}$")
    email: Optional[str] = None
    role: UserRole = UserRole.PASSENGER


class OTPRequest(BaseModel):
    mobile_number: str = Field(..., min_length=10, max_length=15)


class OTPVerify(BaseModel):
    mobile_number: str = Field(..., min_length=10, max_length=15)
    otp_code: str = Field(..., min_length=4, max_length=8)


class UserResponse(BaseModel):
    id: str
    full_name: str
    mobile_number: str
    email: Optional[str] = None
    role: UserRole
    is_verified: bool
    is_active: bool
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
