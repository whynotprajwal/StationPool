import axios from "axios";
import { User, Journey, Trip, DynamicPinData } from "../types";

const getApiBase = () => {
  if (typeof window !== "undefined" && window.location.hostname) {
    return `http://${window.location.hostname}:8000/api`;
  }
  return "http://127.0.0.1:8000/api";
};

const API_BASE = getApiBase();

export const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("stationpool_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const apiService = {
  // Auth
  register: async (data: { full_name: string; mobile_number: string; email?: string; role: string }) => {
    const res = await api.post("/auth/register", data);
    return res.data;
  },
  requestOtp: async (mobile_number: string) => {
    const res = await api.post("/auth/request-otp", { mobile_number });
    return res.data;
  },
  verifyOtp: async (mobile_number: string, otp_code: string) => {
    const res = await api.post("/auth/verify-otp", { mobile_number, otp_code });
    if (res.data.access_token) {
      localStorage.setItem("stationpool_token", res.data.access_token);
      localStorage.setItem("stationpool_user", JSON.stringify(res.data.user));
    }
    return res.data;
  },
  getMe: async (): Promise<User> => {
    const res = await api.get("/auth/me");
    return res.data;
  },

  // Stations
  getStations: async () => {
    const res = await api.get("/stations");
    return res.data;
  },

  // Journeys
  searchJourneys: async (params?: { origin_station?: string; destination_zone?: string }): Promise<Journey[]> => {
    const res = await api.get("/journeys/search", { params });
    return res.data;
  },
  getJourney: async (journeyId: string): Promise<Journey> => {
    const res = await api.get(`/journeys/${journeyId}`);
    return res.data;
  },
  publishJourney: async (data: any): Promise<Journey> => {
    const res = await api.post("/journeys/publish", data);
    return res.data;
  },
  requestSeat: async (journey_id: string, seats_requested: number = 1) => {
    const res = await api.post("/journeys/request-seat", { journey_id, seats_requested });
    return res.data;
  },

  // Trips
  startTrip: async (journey_id: string): Promise<Trip> => {
    const res = await api.post("/trips/start", { journey_id });
    return res.data;
  },
  getTrip: async (tripId: string): Promise<Trip> => {
    const res = await api.get(`/trips/${tripId}`);
    return res.data;
  },
  getPassengerPin: async (tripId: string, passengerId?: string): Promise<DynamicPinData> => {
    const res = await api.get(`/trips/${tripId}/pin`, {
      params: passengerId ? { passenger_id: passengerId } : undefined,
    });
    return res.data;
  },
  verifyPin: async (trip_id: string, passenger_id: string, pin: string) => {
    const res = await api.post("/trips/verify-pin", { trip_id, passenger_id, pin });
    return res.data;
  },
  completeTrip: async (trip_id: string): Promise<Trip> => {
    const res = await api.post("/trips/complete", { trip_id });
    return res.data;
  },

  // Driver
  registerDriver: async (data: any) => {
    const res = await api.post("/driver/register", data);
    return res.data;
  },
  getDriverProfile: async () => {
    const res = await api.get("/driver/profile");
    return res.data;
  },
};
