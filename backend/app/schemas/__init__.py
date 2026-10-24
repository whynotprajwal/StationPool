from app.schemas.auth import (
    UserCreate,
    OTPRequest,
    OTPVerify,
    UserResponse,
    TokenResponse,
)
from app.schemas.driver import (
    DriverRegisterRequest,
    DriverProfileResponse,
)
from app.schemas.journey import (
    JourneyCreate,
    JourneyResponse,
    SeatRequestCreate,
    SeatRequestResponse,
    JourneySearchQuery,
)
from app.schemas.trip import (
    TripCreate,
    TripResponse,
    DynamicPinResponse,
    PinVerifyRequest,
    PinVerifyResponse,
)
