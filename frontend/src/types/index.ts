export type UserRole = "passenger" | "driver" | "both";

export interface User {
  id: string;
  full_name: string;
  mobile_number: string;
  email?: string;
  role: UserRole;
  is_verified: boolean;
  is_active: boolean;
  created_at?: string;
}

export interface DriverSummary {
  id: string;
  full_name: string;
  mobile_number: string;
  is_verified: boolean;
  rating: number;
  vehicle_model?: string;
  vehicle_registration?: string;
}

export interface DriverProfile {
  id: string;
  user_id: string;
  id_type?: string;
  id_number_masked?: string;
  dl_number?: string;
  dl_expiry?: string;
  id_verification_status: string;
  dl_verification_status: string;
  overall_status: string;
  vehicle_category?: "two_wheeler" | "four_wheeler";
  vehicle_make_model?: string;
  vehicle_registration?: string;
  vehicle_capacity: number;
  available_seats: number;
  has_helmet: boolean;
  submitted_at?: string;
  verified_at?: string;
}

export interface Journey {
  id: string;
  driver_id: string;
  origin_station: string;
  destination_zone: string;
  destination_label?: string;
  departure_time: string;
  vehicle_category: "two_wheeler" | "four_wheeler";
  total_seats: number;
  available_seats: number;
  estimated_total_cost: number;
  status: "open" | "full" | "in_progress" | "completed" | "cancelled";
  created_at?: string;
  driver?: DriverSummary;
}

export interface TripPassenger {
  id: string;
  full_name: string;
  mobile_number: string;
  seats_requested: number;
  is_verified: boolean;
  verified_at?: string;
}

export interface Trip {
  id: string;
  journey_id: string;
  status: "confirmed" | "in_progress" | "completed" | "cancelled";
  started_at?: string;
  completed_at?: string;
  journey?: Journey;
  passengers: TripPassenger[];
  total_fare: number;
  co2_saved_kg: number;
}

export interface DynamicPinData {
  pin: string;
  expires_at: string;
  qr_payload: string;
  passenger_id: string;
  trip_id: string;
}
