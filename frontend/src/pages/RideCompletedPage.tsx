import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiService } from "../api/client";
import { Trip } from "../types";
import Navbar from "../components/Navbar";

export const RideCompletedPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [rating, setRating] = useState(5);
  const [rated, setRated] = useState(false);

  useEffect(() => {
    if (tripId && tripId !== "demo") {
      apiService.getTrip(tripId).then(setTrip).catch(console.error);
    }
  }, [tripId]);

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col pb-12">
      <Navbar title="Trip Summary" subtitle="Shared Ride Completed" showBack={false} />

      <main className="flex-1 flex flex-col max-w-md mx-auto w-full pt-20 px-4 space-y-4">
        {/* Celebration Header */}
        <div className="text-center py-5 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-tertiary-container border border-tertiary/40 flex items-center justify-center text-tertiary shadow-xl mb-3">
            <span className="material-symbols-outlined text-[36px] fill">celebration</span>
          </div>
          <h1 className="font-headline-lg text-2xl font-extrabold text-on-surface">
            Feeder Ride Completed!
          </h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Safe journey from {trip?.journey?.origin_station || "Ramwadi"} Metro to{" "}
            {trip?.journey?.destination_zone || "EON IT Park Kharadi"}.
          </p>
        </div>

        {/* Financial & Fuel Settled Card */}
        <div className="p-5 rounded-2xl bg-surface-container-high border border-surface-container-highest shadow-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-on-surface-variant font-medium">Locked Fuel Share Settled</span>
            <p className="font-headline-lg text-3xl font-extrabold text-tertiary font-mono mt-1">
              ₹{trip?.total_fare || 55}
            </p>
            <span className="text-[11px] text-tertiary font-semibold flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[14px] fill">check_circle</span>
              Paid automatically via UPI
            </span>
          </div>
          <div className="w-12 h-12 rounded-full bg-secondary-container/30 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-[24px]">payments</span>
          </div>
        </div>

        {/* Green Pune Commuter Impact Bento Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high flex flex-col gap-1">
            <div className="flex items-center gap-1 text-tertiary">
              <span className="material-symbols-outlined text-[18px]">park</span>
              <span className="text-xs font-bold font-label-ui">CO₂ Offset</span>
            </div>
            <p className="font-headline-lg text-2xl font-extrabold text-on-surface font-mono mt-1">
              1.8 <span className="text-xs text-on-surface-variant font-sans font-normal">kg</span>
            </p>
            <p className="text-[10px] text-on-surface-variant">vs solo private vehicle</p>
          </div>

          <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high flex flex-col gap-1">
            <div className="flex items-center gap-1 text-secondary">
              <span className="material-symbols-outlined text-[18px]">energy_savings_leaf</span>
              <span className="text-xs font-bold font-label-ui">Green Points</span>
            </div>
            <p className="font-headline-lg text-2xl font-extrabold text-secondary font-mono mt-1">
              +45 <span className="text-xs text-on-surface-variant font-sans font-normal">pts</span>
            </p>
            <p className="text-[10px] text-on-surface-variant">Metro Feeder Club Tier</p>
          </div>
        </div>

        {/* Commuter Rating */}
        <div className="p-4 rounded-2xl bg-surface-container border border-surface-container-high shadow-lg text-center space-y-3">
          <p className="text-xs font-bold text-on-surface uppercase tracking-wider">
            Rate Your Commuter Peer
          </p>

          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => {
                  setRating(star);
                  setRated(true);
                }}
                className="p-1 text-2xl transition-transform hover:scale-125"
              >
                <span
                  className={`material-symbols-outlined text-[32px] ${
                    star <= rating ? "text-amber-400 fill" : "text-surface-container-highest"
                  }`}
                  style={{ fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0" }}
                >
                  star
                </span>
              </button>
            ))}
          </div>

          {rated && (
            <p className="text-xs text-tertiary font-bold animate-fadeIn">
              Thank you! Your verified rating updates the Pune Commuter Trust Score.
            </p>
          )}
        </div>

        {/* Back to Home CTA */}
        <button
          onClick={() => navigate("/home")}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-secondary to-tertiary text-on-tertiary font-headline-sm text-sm font-bold shadow-xl shadow-tertiary/25 active:scale-95 transition-all hover:brightness-105 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          <span>Back to Pune Metro Feeder Hub</span>
        </button>
      </main>
    </div>
  );
};

export default RideCompletedPage;
