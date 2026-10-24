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

  const stateData = location.state as {
    tripId?: string;
    journey?: Journey;
  } | null;

  const [tripId, setTripId] = useState<string>(stateData?.tripId || "");
  const [journey, setJourney] = useState<Journey | null>(stateData?.journey || null);
  const [pinData, setPinData] = useState<DynamicPinData | null>(null);
  const [timer, setTimer] = useState(600); // 10 minutes PIN expiry countdown
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        let currentTripId = tripId;
        if (!currentTripId && journeyId) {
          const trip = await apiService.startTrip(journeyId);
          currentTripId = trip.id;
          setTripId(trip.id);
        }

        if (!journey && journeyId) {
          const j = await apiService.getJourney(journeyId);
          setJourney(j);
        }

        if (currentTripId) {
          const pinRes = await apiService.getPassengerPin(currentTripId, user?.id);
          setPinData(pinRes);
        }
      } catch (err) {
        console.error("Match confirmed init error:", err);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [journeyId, tripId, user]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const handleRefreshPin = async () => {
    if (!tripId) return;
    try {
      const pinRes = await apiService.getPassengerPin(tripId, user?.id);
      setPinData(pinRes);
      setTimer(600);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col pb-12">
      <Navbar title="Pool Confirmed" subtitle="Meetup at Station Gate" showBack={true} />

      <main className="flex-1 flex flex-col max-w-md mx-auto w-full pt-20 px-4 space-y-4">
        {/* Celebration Header */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-surface-container to-surface-container-high border border-tertiary/30 shadow-xl flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-tertiary-container flex items-center justify-center text-tertiary shrink-0 shadow-md">
            <span className="material-symbols-outlined text-[28px] fill">check_circle</span>
          </div>
          <div>
            <h1 className="font-headline-sm text-base font-bold text-on-surface">
              Feeder Sync Confirmed!
            </h1>
            <p className="text-xs text-tertiary flex items-center gap-1 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
              {journey?.origin_station || "Ramwadi"} Metro Gate 2 Bay
            </p>
          </div>
        </div>

        {/* Dynamic 4-Digit Security PIN Presentation Card */}
        <div className="relative rounded-2xl bg-surface-container-lowest border-2 border-secondary/40 p-5 shadow-2xl flex flex-col items-center text-center overflow-hidden">
          <div className="absolute top-0 right-0 bg-secondary/15 text-secondary text-[11px] font-mono px-3 py-1 rounded-bl-xl font-bold">
            Dynamic Gate PIN
          </div>

          <span className="text-xs text-on-surface-variant font-semibold mt-1">
            Show this boarding PIN to your driver:
          </span>

          {/* 4-Digit PIN */}
          <div className="my-3 px-6 py-2.5 rounded-2xl bg-surface-container border border-surface-container-high flex items-center gap-3 tracking-widest shadow-inner">
            {pinData ? (
              pinData.pin.split("").map((digit, idx) => (
                <span
                  key={idx}
                  className="font-mono text-3xl font-extrabold text-secondary drop-shadow-[0_2px_8px_rgba(148,204,255,0.4)]"
                >
                  {digit}
                </span>
              ))
            ) : (
              <span className="font-mono text-3xl font-extrabold text-secondary tracking-widest">
                4892
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span className="material-symbols-outlined text-[16px] text-tertiary">timer</span>
            <span className="font-mono">Expires in {formatTimer(timer)}</span>
            <span>•</span>
            <button
              onClick={handleRefreshPin}
              className="text-secondary hover:underline font-bold flex items-center gap-0.5"
            >
              <span className="material-symbols-outlined text-[14px]">refresh</span>
              Refresh
            </button>
          </div>

          <p className="text-[11px] text-on-surface-variant/80 mt-3 max-w-xs">
            Driver will verify this PIN to confirm boarding and activate ride insurance.
          </p>
        </div>

        {/* Driver & Vehicle Details Card */}
        <div className="p-4 rounded-2xl bg-surface-container border border-surface-container-high shadow-lg flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center font-bold text-lg text-secondary border border-secondary/30">
                {journey?.driver?.full_name ? journey.driver.full_name[0] : "R"}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-headline-sm text-sm font-bold text-on-surface">
                    {journey?.driver?.full_name || "Rahul Deshmukh"}
                  </span>
                  <span className="material-symbols-outlined text-secondary text-[16px]">verified</span>
                </div>
                <p className="text-xs text-on-surface-variant font-mono">
                  {journey?.driver?.vehicle_model || "Honda City (Silver)"} •{" "}
                  <span className="text-secondary font-bold">
                    {journey?.driver?.vehicle_registration || "MH 12 QX 4509"}
                  </span>
                </p>
              </div>
            </div>

            <a
              href={`tel:${journey?.driver?.mobile_number || "+919876543210"}`}
              className="w-10 h-10 rounded-full bg-secondary-container/40 flex items-center justify-center text-secondary hover:bg-secondary-container/60 transition-all shadow-sm"
              title="Call Driver"
            >
              <span className="material-symbols-outlined text-[20px]">call</span>
            </a>
          </div>

          {/* Route snapshot */}
          <div className="bg-surface-container-low rounded-xl p-3 flex items-center justify-between text-xs">
            <div>
              <span className="text-on-surface-variant">Destination</span>
              <p className="font-bold text-on-surface">{journey?.destination_zone || "EON IT Park Kharadi"}</p>
            </div>
            <div className="text-right">
              <span className="text-on-surface-variant">Seat Share</span>
              <p className="font-bold text-tertiary font-mono">₹{journey?.estimated_total_cost || 55}</p>
            </div>
          </div>
        </div>

        {/* Proceed to Active Ride Button */}
        <button
          onClick={() => navigate(`/ride/passenger/${tripId || "trip-demo"}`)}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-secondary to-tertiary text-on-tertiary font-headline-sm text-sm font-bold shadow-xl shadow-tertiary/25 active:scale-95 transition-all hover:brightness-105 flex items-center justify-center gap-2"
        >
          <span>Open Active Ride Tracker</span>
          <span className="material-symbols-outlined text-[18px]">navigation</span>
        </button>

        {/* Switch to Driver Verification Mode (for pair demonstration testing) */}
        <div className="text-center pt-2">
          <button
            onClick={() => navigate(`/ride/verify-pin/${tripId || "trip-demo"}`)}
            className="text-xs text-secondary hover:underline flex items-center justify-center gap-1 mx-auto"
          >
            <span className="material-symbols-outlined text-[14px]">badge</span>
            <span>Switch to Driver View (Verify Passenger PIN)</span>
          </button>
        </div>
      </main>
    </div>
  );
};

export default MetroMatchConfirmedPage;
