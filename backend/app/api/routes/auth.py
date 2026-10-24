"""Authentication endpoints for commuter sign-up and OTP mobile verification."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.db.models import User
from app.api.deps import get_current_user
from app.schemas.auth import UserCreate, OTPRequest, OTPVerify, TokenResponse, UserResponse
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
def register(payload: UserCreate, db: Session = Depends(get_db)):
    """Register or update commuter profile, returns demo OTP in dev mode."""
    user, otp_code = AuthService.register_user(db, payload)
    return {
        "success": True,
        "message": f"Verification code sent to {user.mobile_number}",
        "user_id": user.id,
        "mobile_number": user.mobile_number,
        "demo_otp": otp_code,  # For easy manual or automated testing
    }


@router.post("/request-otp", response_model=dict)
def request_otp(payload: OTPRequest, db: Session = Depends(get_db)):
    """Request a fresh OTP for mobile verification."""
    user, otp_code = AuthService.request_otp(db, payload.mobile_number)
    return {
        "success": True,
        "message": f"Verification code sent to {user.mobile_number}",
        "mobile_number": user.mobile_number,
        "demo_otp": otp_code,
    }


@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(payload: OTPVerify, db: Session = Depends(get_db)):
    """Verify 6-digit OTP and return JWT access token."""
    return AuthService.verify_otp(db, payload.mobile_number, payload.otp_code)


@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    """Get current authenticated user profile."""
    return UserResponse.model_validate(current_user)
