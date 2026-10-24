"""Driver profile and onboarding service."""
from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.db.models import DriverProfile, User, UserRole, VerificationStatus
from app.schemas.driver import DriverRegisterRequest, DriverProfileResponse


def mask_id_number(id_str: str) -> str:
    cleaned = "".join(id_str.split())
    if len(cleaned) <= 4:
        return "•••• " + cleaned
    return "•••• •••• " + cleaned[-4:]


class DriverService:
    @staticmethod
    def get_driver_profile(db: Session, user_id: str) -> Optional[DriverProfile]:
        return db.query(DriverProfile).filter(DriverProfile.user_id == user_id).first()

    @staticmethod
    def register_or_update_driver(
        db: Session, user_id: str, payload: DriverRegisterRequest
    ) -> DriverProfile:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

        # Upgrade user role if passenger
        if user.role == UserRole.PASSENGER:
            user.role = UserRole.BOTH

        profile = db.query(DriverProfile).filter(DriverProfile.user_id == user_id).first()
        now = datetime.now(timezone.utc)
        masked_id = mask_id_number(payload.id_number)

        if not profile:
            profile = DriverProfile(
                user_id=user_id,
                id_type=payload.id_type,
                id_number_masked=masked_id,
                dl_number=payload.dl_number.upper(),
                dl_expiry=payload.dl_expiry,
                id_verification_status=VerificationStatus.VERIFIED,  # Simulated fast verification
                dl_verification_status=VerificationStatus.VERIFIED,
                overall_status=VerificationStatus.VERIFIED,
                vehicle_category=payload.vehicle_category,
                vehicle_make_model=payload.vehicle_make_model,
                vehicle_registration=payload.vehicle_registration.upper(),
                vehicle_capacity=payload.vehicle_capacity,
                available_seats=payload.vehicle_capacity,
                has_helmet=payload.has_helmet,
                submitted_at=now,
                verified_at=now,
            )
            db.add(profile)
        else:
            profile.id_type = payload.id_type
            profile.id_number_masked = masked_id
            profile.dl_number = payload.dl_number.upper()
            profile.dl_expiry = payload.dl_expiry
            profile.vehicle_category = payload.vehicle_category
            profile.vehicle_make_model = payload.vehicle_make_model
            profile.vehicle_registration = payload.vehicle_registration.upper()
            profile.vehicle_capacity = payload.vehicle_capacity
            profile.available_seats = payload.vehicle_capacity
            profile.has_helmet = payload.has_helmet
            profile.overall_status = VerificationStatus.VERIFIED
            profile.verified_at = now

        db.commit()
        db.refresh(profile)
        db.refresh(user)
        return profile
