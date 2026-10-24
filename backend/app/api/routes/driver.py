"""Driver registration, document verification, and profile endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from app.api.deps import get_current_user
from app.schemas.driver import DriverRegisterRequest, DriverProfileResponse
from app.services.driver_service import DriverService

router = APIRouter(prefix="/driver", tags=["Driver"])


@router.post("/register", response_model=DriverProfileResponse, status_code=status.HTTP_201_CREATED)
def register_driver(
    payload: DriverRegisterRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Register driver profile with ID and vehicle details."""
    profile = DriverService.register_or_update_driver(db, current_user.id, payload)
    return DriverProfileResponse.model_validate(profile)


@router.get("/profile", response_model=DriverProfileResponse)
def get_driver_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieve driver profile for currently logged in user."""
    profile = DriverService.get_driver_profile(db, current_user.id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Driver profile not found. Please register as a driver first.",
        )
    return DriverProfileResponse.model_validate(profile)
