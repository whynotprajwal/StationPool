import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiService } from "../api/client";
import { Trip } from "../types";
import Navbar from "../components/Navbar";

export const DriverActiveRidePage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  useEffect(() => {
    if (tripId && tripId !== "trip-demo") {
      apiService.getTrip(tripId).then(setTrip).catch(console.error);
    }
  }, [tripId]);

  const handleCompleteTrip = async () => {
    setIsCompleting(true);
    try {
      if (tripId && tripId !== "trip-demo") {
        await apiService.completeTrip(tripId);
        navigate(`/trip/${tripId}/complete`);
      } else {
        navigate(`/trip/demo/complete`);
      }
    } catch (err) {
      navigate(`/trip/${tripId || "demo"}/complete`);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col pb-12">
      <Navbar title="Driver View" subtitle="Ride in progress" showBack={true} />

      <main className="flex-1 flex flex-col max-w-md mx-auto w-full pt-20 px-4 gap-4">

        {/* Destination */}
        <div className="p-4 rounded-xl bg-surface-container-high border border-surface-container-highest flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-tertiary-container flex items-center justify-center text-tertiary shrink-0">
            <span className="material-symbols-outlined text-[22px]">navigation</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-on-surface-variant">Drop Point</p>
            <p className="font-bold text-sm text-on-surface truncate">{trip?.journey?.destination_zone || "EON IT Park Kharadi"}</p>
          </div>
          <span className="px-2 py-0.5 rounded bg-secondary-container/30 text-secondary text-xs font-mono font-bold">Live</span>
        </div>

        {/* Passengers */}
        <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-on-surface">Passengers</span>
            <span className="text-xs text-tertiary font-mono">PIN Verified</span>
          </div>
          <div className="flex flex-col gap-2">
            {(trip?.passengers && trip.passengers.length > 0
              ? trip.passengers
              : [{ id: "p1", full_name: "Tanvi Joshi", mobile_number: "+919876543220", seats_requested: 1, is_verified: true }]
            ).map((p, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-surface-container-high">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center font-bold text-sm text-secondary">
                    {p.full_name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-sm text-on-surface">{p.full_name}</span>
                      <span className="material-symbols-outlined text-tertiary text-[14px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </div>
                    <span className="text-xs text-on-surface-variant font-mono">{p.mobile_number}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-mono font-bold text-tertiary">₹55</span>
                  <p className="text-[10px] text-on-surface-variant">{p.seats_requested} seat</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Earnings */}
        <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high flex items-center justify-between">
          <div>
            <p className="text-xs text-on-surface-variant">Fuel share earned</p>
            <p className="text-2xl font-extrabold text-tertiary font-mono">₹{trip?.total_fare || 55}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-on-surface-variant">Payout</p>
            <p className="text-xs font-bold text-secondary">Instant UPI</p>
          </div>
        </div>

        <button
          onClick={handleCompleteTrip} disabled={isCompleting}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-secondary to-tertiary text-on-tertiary font-bold text-sm shadow-lg active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">task_alt</span>
          {isCompleting ? "Completing..." : "Complete Ride"}
        </button>

        <button
          onClick={() => navigate(`/ride/verify-pin/${tripId || "trip-demo"}`)}
          className="w-full py-3 rounded-xl bg-surface-container-high text-on-surface text-xs font-semibold flex items-center justify-center gap-1.5"
        >
          <span className="material-symbols-outlined text-[16px]">pin</span>
          Verify Passenger PIN
        </button>
      </main>
    </div>
  );
};

export default DriverActiveRidePage;
