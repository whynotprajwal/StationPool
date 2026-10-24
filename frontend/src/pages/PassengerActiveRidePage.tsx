import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiService } from "../api/client";
import { Trip } from "../types";
import Navbar from "../components/Navbar";

export const PassengerActiveRidePage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [etaMinutes, setEtaMinutes] = useState(14);
  const [progressPct, setProgressPct] = useState(35);

  useEffect(() => {
    if (tripId && tripId !== "trip-demo") {
      apiService.getTrip(tripId).then((t) => {
        setTrip(t);
        if (t.status === "completed") {
          navigate(`/trip/${tripId}/complete`);
        }
      }).catch(console.error);

      // Poll every 4 seconds to check if driver completed trip
      const interval = setInterval(async () => {
        try {
          const t = await apiService.getTrip(tripId);
          setTrip(t);
          if (t.status === "completed") {
            navigate(`/trip/${tripId}/complete`);
          }
        } catch (e) {
          console.error(e);
        }
      }, 4000);

      return () => clearInterval(interval);
    }
  }, [tripId, navigate]);

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgressPct((p) => (p < 95 ? p + 5 : 95));
      setEtaMinutes((m) => (m > 1 ? m - 1 : 1));
    }, 8000);
    return () => clearInterval(progressTimer);
  }, []);

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col pb-12">
      <Navbar title="Active Feeder Ride" subtitle="Live In-Transit" showBack={false} />

      <main className="flex-1 flex flex-col max-w-md mx-auto w-full pt-20 px-4 space-y-4">
        {/* Live Route Tracker Card */}
        <div className="relative rounded-2xl bg-surface-container-high border border-surface-container-highest p-5 shadow-2xl overflow-hidden">
          {/* Ambient indicator */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-ping"></span>
              <span className="font-label-ui text-xs font-bold uppercase tracking-wider text-tertiary">
                Transit Feeder Active
              </span>
            </div>
            <span className="font-mono text-xs bg-surface-container-lowest px-2.5 py-0.5 rounded text-secondary font-bold">
              ETA {etaMinutes} Mins
            </span>
          </div>

          {/* Route path diagram */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[14px]">directions_subway</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-on-surface-variant">Departed from</p>
                <p className="font-headline-sm text-sm font-bold text-on-surface">
                  {trip?.journey?.origin_station || "Ramwadi"} Metro Station Gate 2
                </p>
              </div>
            </div>

            {/* Connecting corridor with animated car */}
            <div className="pl-3 py-1 flex items-center gap-3">
              <div className="w-0.5 h-12 bg-gradient-to-b from-secondary to-tertiary relative ml-[-1px]">
                <div
                  className="absolute w-4 h-4 rounded-full bg-secondary text-surface-container-lowest flex items-center justify-center -left-[7px] shadow-md transition-all duration-1000"
                  style={{ top: `${progressPct}%` }}
                >
                  <span className="material-symbols-outlined text-[11px]">directions_car</span>
                </div>
              </div>
              <span className="text-xs text-on-surface-variant font-mono pl-3">
                Speed: 42 km/h • Kharadi Feeder Bypass
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-tertiary-container flex items-center justify-center text-tertiary shrink-0 mt-0.5">
                <span className="material-symbols-outlined text-[14px]">pin_drop</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-on-surface-variant">Arriving at</p>
                <p className="font-headline-sm text-sm font-bold text-on-surface">
                  {trip?.journey?.destination_zone || "EON IT Park Kharadi"}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-5 w-full bg-surface-container-lowest h-2 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-secondary to-tertiary h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            ></div>
          </div>
        </div>

        {/* Driver Details Card */}
        <div className="p-4 rounded-2xl bg-surface-container border border-surface-container-high shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center font-bold text-lg text-secondary border border-secondary/30">
              {trip?.journey?.driver?.full_name ? trip.journey.driver.full_name[0] : "R"}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-sm font-bold text-on-surface">
                  {trip?.journey?.driver?.full_name || "Rahul Deshmukh"}
                </span>
                <span className="material-symbols-outlined text-secondary text-[16px]">verified</span>
              </div>
              <p className="text-xs text-on-surface-variant font-mono">
                {trip?.journey?.driver?.vehicle_model || "Honda City (Silver)"} •{" "}
                <span className="text-secondary font-bold">
                  {trip?.journey?.driver?.vehicle_registration || "MH 12 QX 4509"}
                </span>
              </p>
            </div>
          </div>

          <a
            href={`tel:${trip?.journey?.driver?.mobile_number || "+919876543210"}`}
            className="w-10 h-10 rounded-full bg-secondary-container/40 flex items-center justify-center text-secondary hover:bg-secondary-container/60 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[20px]">call</span>
          </a>
        </div>

        {/* Fare and Green Impact Bento Card */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl bg-surface-container border border-surface-container-high flex flex-col gap-1">
            <span className="text-xs text-on-surface-variant font-medium">Locked Fare</span>
            <span className="font-mono text-xl font-bold text-tertiary">
              ₹{trip?.total_fare || 55}
            </span>
            <span className="text-[10px] text-tertiary">Zero Surge Fixed Rate</span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface-container border border-surface-container-high flex flex-col gap-1">
            <span className="text-xs text-on-surface-variant font-medium">CO₂ Reduction</span>
            <span className="font-mono text-xl font-bold text-secondary">
              1.8 kg
            </span>
            <span className="text-[10px] text-secondary">Feeder Carpool Offset</span>
          </div>
        </div>

        {/* Switch to Driver View CTA (for pair evaluation) */}
        <button
          onClick={() => navigate(`/ride/driver/${tripId || "trip-demo"}`)}
          className="w-full py-3 rounded-xl bg-surface-container-high border border-outline-variant/30 text-secondary text-xs font-bold hover:bg-surface-bright transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
          <span>Switch to Driver Cockpit View</span>
        </button>
      </main>
    </div>
  );
};

export default PassengerActiveRidePage;
