import axios from "axios";
import type { User, Journey, Trip, DynamicPinData, DriverProfile } from "../types";

const getApiBase = () => {
  const configured = import.meta.env.VITE_API_URL as string | undefined;
  if (configured) return configured;
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && !error.config?.url?.includes("/auth/")) {
      localStorage.removeItem("stationpool_token");
      localStorage.removeItem("stationpool_user");
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Auth
  register: async (data: {
    full_name: string;
    mobile_number: string;
    email?: string;
    role: string;
  }) => {
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
  demoLogin: async (mobile_number: string) => {
    await api.post("/auth/request-otp", { mobile_number });
    return apiService.verifyOtp(mobile_number, "123456");
  },

  // Stations
  getStations: async (): Promise<{
    stations: string[];
    feeder_destinations: string[];
    lines: { name: string; color: string; terminals: string[]; stations: string[] }[];
  }> => {
    const res = await api.get("/stations");
    return res.data;
  },

  // Journeys
  searchJourneys: async (params?: {
    origin_station?: string;
    destination_zone?: string;
    vehicle_category?: string;
  }): Promise<Journey[]> => {
    const res = await api.get("/journeys/search", { params });
    return res.data;
  },
  getJourney: async (journeyId: string): Promise<Journey> => {
    const res = await api.get(`/journeys/${journeyId}`);
    return res.data;
  },
  getMyJourneys: async (): Promise<Journey[]> => {
    const res = await api.get("/journeys/mine");
    return res.data;
  },
  publishJourney: async (data: unknown): Promise<Journey> => {
    const res = await api.post("/journeys/publish", data);
    return res.data;
  },
  requestSeat: async (journey_id: string, seats_requested: number = 1) => {
    const res = await api.post("/journeys/request-seat", { journey_id, seats_requested });
    return res.data;
  },
  cancelJourney: async (journeyId: string): Promise<Journey> => {
    const res = await api.post(`/journeys/${journeyId}/cancel`);
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
  getMyTrips: async (): Promise<Trip[]> => {
    const res = await api.get("/trips/mine");
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
  registerDriver: async (data: unknown): Promise<DriverProfile> => {
    const res = await api.post("/driver/register", data);
    return res.data;
  },
  getDriverProfile: async (): Promise<DriverProfile> => {
    const res = await api.get("/driver/profile");
    return res.data;
  },

  // Demo helpers
  seed: async () => {
    const res = await api.post("/seed");
    return res.data;
  },
};

export { API_BASE };
