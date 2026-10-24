"""StationPool Backend - Configuration using standard Pydantic and os.environ."""
import os
from typing import List
from pydantic import BaseModel


class Settings(BaseModel):
    # App
    APP_NAME: str = os.getenv("APP_NAME", "StationPool API")
    APP_VERSION: str = os.getenv("APP_VERSION", "1.0.0")
    APP_ENV: str = os.getenv("APP_ENV", "development")

    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "stationpool-dev-secret-key-change-in-production-2024")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "10080"))

    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./stationpool.db")

    # CORS
    CORS_ORIGINS: str = os.getenv("CORS_ORIGINS", "http://localhost:5173,http://localhost:3000")

    # Demo OTP (development only)
    DEMO_OTP_ENABLED: bool = True
    DEMO_OTP_CODE: str = "123456"

    # Matching
    MATCH_WINDOW_MINUTES: int = 15

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]


settings = Settings()
