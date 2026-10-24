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
      <Navbar title="Trip Complete" showBack={false} />

      <main className="flex-1 flex flex-col max-w-md mx-auto w-full pt-20 px-4 gap-4">

        {/* Success header */}
        <div className="text-center py-4 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-tertiary-container flex items-center justify-center">
            <span className="material-symbols-outlined text-tertiary text-[32px]" style={{ fontVariationSettings: "'FILL' 1" }}>celebration</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-on-surface">Ride Completed!</h1>
            <p className="text-sm text-on-surface-variant mt-1">
              {trip?.journey?.origin_station || "Ramwadi"} → {trip?.journey?.destination_zone || "EON IT Park Kharadi"}
            </p>
          </div>
        </div>

        {/* Fare settled */}
        <div className="p-4 rounded-2xl bg-surface-container-high border border-surface-container-highest flex items-center justify-between">
          <div>
            <p className="text-xs text-on-surface-variant">Fuel share settled</p>
            <p className="text-3xl font-extrabold text-tertiary font-mono mt-0.5">₹{trip?.total_fare || 55}</p>
            <p className="text-xs text-tertiary flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              Paid via UPI
            </p>
          </div>
          <span className="material-symbols-outlined text-secondary text-[28px]">payments</span>
        </div>

        {/* Impact stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high flex flex-col gap-1">
            <div className="flex items-center gap-1 text-tertiary text-xs font-bold">
              <span className="material-symbols-outlined text-[16px]">park</span> CO₂ Saved
            </div>
            <p className="text-2xl font-extrabold font-mono text-on-surface mt-1">1.8 <span className="text-xs font-sans font-normal text-on-surface-variant">kg</span></p>
          </div>
          <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high flex flex-col gap-1">
            <div className="flex items-center gap-1 text-secondary text-xs font-bold">
              <span className="material-symbols-outlined text-[16px]">energy_savings_leaf</span> Green Points
            </div>
            <p className="text-2xl font-extrabold font-mono text-secondary mt-1">+45 <span className="text-xs font-sans font-normal text-on-surface-variant">pts</span></p>
          </div>
        </div>

        {/* Rating */}
        <div className="p-4 rounded-2xl bg-surface-container border border-surface-container-high text-center space-y-3">
          <p className="text-xs font-bold text-on-surface">Rate your commute peer</p>
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} type="button" onClick={() => { setRating(star); setRated(true); }} className="p-1 transition-transform hover:scale-125">
                <span
                  className={`material-symbols-outlined text-[32px] ${star <= rating ? "text-amber-400" : "text-surface-container-highest"}`}
                  style={{ fontVariationSettings: star <= rating ? "'FILL' 1" : "'FILL' 0" }}
                >star</span>
              </button>
            ))}
          </div>
          {rated && <p className="text-xs text-tertiary font-semibold">Thanks! Rating submitted.</p>}
        </div>

        <button
          onClick={() => navigate("/home")}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-secondary to-tertiary text-on-tertiary font-bold text-sm shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">home</span>
          Back to Home
        </button>
      </main>
    </div>
  );
};

export default RideCompletedPage;
