"""Authentication service managing users, OTP generation/validation, and JWT tokens."""
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.core.config import settings
from app.core.security import generate_otp, create_access_token
from app.db.models import User, UserRole
from app.schemas.auth import UserCreate, UserResponse, TokenResponse


class AuthService:
    @staticmethod
    def get_user_by_mobile(db: Session, mobile_number: str) -> Optional[User]:
        return db.query(User).filter(User.mobile_number == mobile_number.strip()).first()

    @staticmethod
    def get_user_by_id(db: Session, user_id: str) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def register_user(db: Session, payload: UserCreate) -> Tuple[User, str]:
        mobile = payload.mobile_number.strip()
        existing = db.query(User).filter(User.mobile_number == mobile).first()
        if existing:
            # Update user details if already registered
            existing.full_name = payload.full_name
            existing.email = payload.email
            existing.role = payload.role
            user = existing
        else:
            user = User(
                full_name=payload.full_name,
                mobile_number=mobile,
                email=payload.email,
                role=payload.role,
                is_verified=False,
            )
            db.add(user)

        # Generate OTP
        otp_code = generate_otp(6)
        user.otp_code = otp_code
        user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
        db.commit()
        db.refresh(user)

        return user, otp_code

    @staticmethod
    def request_otp(db: Session, mobile_number: str) -> Tuple[User, str]:
        mobile = mobile_number.strip()
        user = db.query(User).filter(User.mobile_number == mobile).first()
        if not user:
            # Auto-create guest commuter user
            user = User(
                full_name="Metro Commuter",
                mobile_number=mobile,
                role=UserRole.PASSENGER,
                is_verified=False,
            )
            db.add(user)

        otp_code = generate_otp(6)
        user.otp_code = otp_code
        user.otp_expires_at = datetime.now(timezone.utc) + timedelta(minutes=10)
        db.commit()
        db.refresh(user)

        return user, otp_code

    @staticmethod
    def verify_otp(db: Session, mobile_number: str, otp_code: str) -> TokenResponse:
        mobile = mobile_number.strip()
        user = db.query(User).filter(User.mobile_number == mobile).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found with this mobile number",
            )

        # In dev mode, "123456" is always accepted
        is_dev_bypass = settings.APP_ENV == "development" and otp_code == "123456"

        if not is_dev_bypass:
            if not user.otp_code or user.otp_code != otp_code.strip():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid OTP code entered",
                )
            otp_expiry = user.otp_expires_at.replace(tzinfo=timezone.utc) if user.otp_expires_at and user.otp_expires_at.tzinfo is None else user.otp_expires_at
            if otp_expiry and otp_expiry < datetime.now(timezone.utc):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="OTP code has expired. Please request a new one.",
                )

        # Clear OTP and mark verified
        user.otp_code = None
        user.otp_expires_at = None
        user.is_verified = True
        db.commit()
        db.refresh(user)

        token = create_access_token(
            data={"sub": user.id, "mobile": user.mobile_number, "role": user.role.value}
        )

        return TokenResponse(
            access_token=token,
            token_type="bearer",
            user=UserResponse.model_validate(user),
        )
