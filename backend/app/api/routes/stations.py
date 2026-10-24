"""Pune Metro Stations and Feeder Zones directory endpoints."""
from fastapi import APIRouter
from app.services.journey_service import PUNE_METRO_STATIONS, COMMON_FEEDER_DESTINATIONS

router = APIRouter(prefix="/stations", tags=["Stations"])


@router.get("")
def list_stations():
    """List all Pune Metro stations (Line 1 Purple + Line 2 Aqua)."""
    return {
        "stations": PUNE_METRO_STATIONS,
        "feeder_destinations": COMMON_FEEDER_DESTINATIONS,
        "lines": [
            {
                "name": "Aqua Line (Line 2)",
                "color": "#0378b7",
                "terminals": ["Vanaz", "Ramwadi"],
                "stations": PUNE_METRO_STATIONS[:15],
            },
            {
                "name": "Purple Line (Line 1)",
                "color": "#7928ca",
                "terminals": ["PCMC", "Swargate"],
                "stations": PUNE_METRO_STATIONS[15:],
            },
        ],
    }
