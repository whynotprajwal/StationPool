import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { apiService } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Journey, Trip, DynamicPinData } from "../types";
import Navbar from "../components/Navbar";

export const MetroMatchConfirmedPage: React.FC = () => {
  const { journeyId } = useParams<{ journeyId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const stateData = location.state as { tripId?: string; journey?: Journey } | null;
  const [tripId, setTripId] = useState<string>(stateData?.tripId || "");
  const [journey, setJourney] = useState<Journey | null>(stateData?.journey || null);
  const [pinData, setPinData] = useState<DynamicPinData | null>(null);
  const [timer, setTimer] = useState(600);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        let currentTripId = tripId;
        if (!currentTripId && journeyId) { const trip = await apiService.startTrip(journeyId); currentTripId = trip.id; setTripId(trip.id); }
        if (!journey && journeyId) { const j = await apiService.getJourney(journeyId); setJourney(j); }
        if (currentTripId) { const pinRes = await apiService.getPassengerPin(currentTripId, user?.id); setPinData(pinRes); }
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    init();
  }, [journeyId, tripId, user]);

  useEffect(() => {
    const interval = setInterval(() => setTimer((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const handleRefreshPin = async () => {
    if (!tripId) return;
    try { const pinRes = await apiService.getPassengerPin(tripId, user?.id); setPinData(pinRes); setTimer(600); }
    catch (err) { console.error(err); }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col pb-12">
      <Navbar title="Pool Confirmed" showBack={true} />

      <main className="flex-1 flex flex-col max-w-md mx-auto w-full pt-20 px-4 gap-4">

        {/* Status */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-surface-container-high border border-surface-container-highest">
          <div className="w-10 h-10 rounded-xl bg-tertiary-container flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-tertiary text-[24px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
          </div>
          <div>
            <p className="font-bold text-sm text-on-surface">Ride Confirmed!</p>
            <p className="text-xs text-on-surface-variant">{journey?.origin_station || "Ramwadi"} Metro Gate</p>
          </div>
        </div>

        {/* Boarding PIN */}
        <div className="rounded-2xl bg-surface-container-low border-2 border-secondary/30 p-5 flex flex-col items-center text-center gap-3">
          <p className="text-xs text-on-surface-variant font-semibold">Show this PIN to your driver</p>
          <div className="flex gap-3 px-5 py-3 rounded-xl bg-surface-container border border-surface-container-high tracking-widest">
            {(pinData?.pin || "4892").split("").map((digit, idx) => (
              <span key={idx} className="font-mono text-3xl font-extrabold text-secondary">{digit}</span>
            ))}
          </div>
          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[14px] text-tertiary">timer</span>
            <span className="font-mono">Expires {formatTimer(timer)}</span>
            <span>·</span>
            <button onClick={handleRefreshPin} className="text-secondary font-bold hover:underline flex items-center gap-0.5">
              <span className="material-symbols-outlined text-[14px]">refresh</span> Refresh
            </button>
          </div>
        </div>

        {/* Driver info */}
        <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center font-bold text-base text-secondary">
                {journey?.driver?.full_name ? journey.driver.full_name[0] : "R"}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-on-surface">{journey?.driver?.full_name || "Rahul Deshmukh"}</span>
                  <span className="material-symbols-outlined text-secondary text-[14px]">verified</span>
                </div>
                <p className="text-xs text-on-surface-variant font-mono">
                  {journey?.driver?.vehicle_model || "Honda City"} · <span className="text-secondary font-bold">{journey?.driver?.vehicle_registration || "MH 12 QX 4509"}</span>
                </p>
              </div>
            </div>
            <a href={`tel:${journey?.driver?.mobile_number || "+919876543210"}`}
              className="w-10 h-10 rounded-full bg-secondary-container/40 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[20px]">call</span>
            </a>
          </div>
          <div className="flex items-center justify-between text-xs bg-surface-container-low rounded-lg p-3">
            <div>
              <p className="text-on-surface-variant">Destination</p>
              <p className="font-bold text-on-surface">{journey?.destination_zone || "EON IT Park Kharadi"}</p>
            </div>
            <div className="text-right">
              <p className="text-on-surface-variant">Fare</p>
              <p className="font-bold text-tertiary font-mono">₹{journey?.estimated_total_cost || 55}</p>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate(`/ride/passenger/${tripId || "trip-demo"}`)}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-secondary to-tertiary text-on-tertiary font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span>Track My Ride</span>
          <span className="material-symbols-outlined text-[18px]">navigation</span>
        </button>

        <div className="text-center">
          <button onClick={() => navigate(`/ride/verify-pin/${tripId || "trip-demo"}`)}
            className="text-xs text-secondary hover:underline flex items-center justify-center gap-1 mx-auto">
            <span className="material-symbols-outlined text-[14px]">badge</span>
            Switch to Driver View
          </button>
        </div>
      </main>
    </div>
  );
};

export default MetroMatchConfirmedPage;
