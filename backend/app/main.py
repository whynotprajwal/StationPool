"""StationPool — Pune Metro Carpool API Backend Main Application"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.db.database import init_db
from app.api.routes import auth, driver, journeys, trips, stations, seed
from app.api.routes.seed import auto_seed_if_empty


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB tables on application startup
    init_db()
    if settings.AUTO_SEED:
        auto_seed_if_empty()
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Metro-first commuter carpooling backend for Pune commuters and feeder routes",
    lifespan=lifespan,
)

# Enable CORS for frontend development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins in dev for seamless preview and local testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers under /api prefix
app.include_router(auth.router, prefix="/api")
app.include_router(driver.router, prefix="/api")
app.include_router(journeys.router, prefix="/api")
app.include_router(trips.router, prefix="/api")
app.include_router(stations.router, prefix="/api")
app.include_router(seed.router, prefix="/api")


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "environment": settings.APP_ENV,
    }


@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to StationPool Pune Metro Carpooling API",
        "docs": "/docs",
        "health": "/health",
    }
