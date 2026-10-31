import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiService } from "../api/client";
import { useToast } from "../components/Toast";
import type { Trip, TripPassenger } from "../types";
import Navbar from "../components/Navbar";
import RouteLine from "../components/RouteLine";
import StatTile from "../components/StatTile";

const DEMO_PASSENGERS: TripPassenger[] = [
  {
    id: "p1",
    full_name: "Tanvi Joshi",
    mobile_number: "+919876543220",
    seats_requested: 1,
    is_verified: true,
  },
  {
    id: "p2",
    full_name: "Rohit Patil",
    mobile_number: "+919876543221",
    seats_requested: 1,
    is_verified: false,
  },
];

export const DriverActiveRidePage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (tripId && tripId !== "trip-demo") {
      apiService
        .getTrip(tripId)
        .then(setTrip)
        .catch(() => toast("Could not load trip", "Showing demo passengers instead.", "error"));
    }
  }, [tripId, toast]);

  const passengers = trip?.passengers?.length ? trip.passengers : DEMO_PASSENGERS;
  const verifiedCount = passengers.filter((passenger) => passenger.is_verified).length;
  const fare = trip?.total_fare || 55;
  const earnings = fare * Math.max(passengers.length, 1);

  const handleCompleteTrip = async () => {
    setIsCompleting(true);
    try {
      if (tripId && tripId !== "trip-demo") {
        await apiService.completeTrip(tripId);
        navigate(`/trip/${tripId}/complete`);
      } else {
        navigate("/trip/demo/complete");
      }
    } catch {
      toast("Completion failed", "Please retry in a moment.", "error");
    } finally {
      setIsCompleting(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col pb-10">
      <Navbar title="Driver cockpit" subtitle="Ride in progress" showBack />

      <main className="flex flex-1 flex-col gap-4 px-4 pt-20">
        {/* Destination */}
        <section className="glass-card p-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tertiary opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-tertiary" />
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-tertiary">
                Live ride
              </span>
            </div>
            <span className="rounded-full bg-secondary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-secondary">
              {verifiedCount}/{passengers.length} verified
            </span>
          </div>
          <div className="mt-3">
            <RouteLine
              origin={trip?.journey?.origin_station || "Ramwadi"}
              destination={trip?.journey?.destination_zone || "EON IT Park Kharadi"}
              originSub="Pickup"
              destinationSub={trip?.journey?.destination_label || "Drop point"}
            />
          </div>
        </section>

        {/* Earnings */}
        <section className="grid grid-cols-2 gap-2.5">
          <StatTile
            label="Fuel share"
            value={`₹${earnings}`}
            hint="Instant UPI settlement"
            icon="payments"
            tone="tertiary"
          />
          <StatTile
            label="Seats filled"
            value={`${passengers.length}`}
            hint={`${passengers.reduce((sum, p) => sum + p.seats_requested, 0)} seat(s) booked`}
            icon="airline_seat_recline_normal"
            tone="secondary"
          />
        </section>

        {/* Passengers */}
        <section className="glass-panel p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="eyebrow">Boarding manifest</p>
              <p className="text-[10px] text-on-surface-variant">Verify each commuter PIN at pickup</p>
            </div>
            <button
              onClick={() => navigate(`/ride/verify-pin/${tripId || "trip-demo"}`)}
              className="flex items-center gap-1 rounded-full bg-secondary/10 px-2.5 py-1 text-[10px] font-extrabold text-secondary"
            >
              <span className="material-symbols-outlined text-[13px]">pin</span>
              Verify PIN
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {passengers.map((passenger) => (
              <div
                key={passenger.id}
                className="flex items-center justify-between gap-2 rounded-2xl border border-white/[0.06] bg-white/[0.02] p-2.5"
              >
                <div className="flex min-w-0 items-center gap-2.5">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-gradient-soft font-extrabold text-secondary ring-1 ring-secondary/25">
                    {passenger.full_name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="truncate text-xs font-extrabold text-on-surface">
                        {passenger.full_name}
                      </p>
                      <span
                        className={`material-symbols-outlined fill text-[13px] ${
                          passenger.is_verified ? "text-tertiary" : "text-amber-400"
                        }`}
                      >
                        {passenger.is_verified ? "verified" : "pending"}
                      </span>
                    </div>
                    <p className="truncate font-mono text-[10px] text-on-surface-variant">
                      {passenger.mobile_number} · {passenger.seats_requested} seat
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${
                      passenger.is_verified
                        ? "bg-tertiary/10 text-tertiary"
                        : "bg-amber-400/10 text-amber-400"
                    }`}
                  >
                    {passenger.is_verified ? "Verified" : "Pending"}
                  </span>
                  <a
                    href={`tel:${passenger.mobile_number}`}
                    aria-label={`Call ${passenger.full_name}`}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-secondary/10 text-secondary"
                  >
                    <span className="material-symbols-outlined text-[14px]">call</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        <button
          onClick={() => setConfirmOpen(true)}
          disabled={isCompleting}
          className="btn-primary"
        >
          <span className="material-symbols-outlined text-[18px]">task_alt</span>
          Complete ride
        </button>

        <button
          onClick={() => navigate(`/ride/verify-pin/${tripId || "trip-demo"}`)}
          className="btn-ghost w-full"
        >
          <span className="material-symbols-outlined text-[16px]">pin</span>
          Verify another passenger PIN
        </button>
      </main>

      {confirmOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center">
          <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm animate-fadeIn" onClick={() => setConfirmOpen(false)} />
          <div className="relative w-full max-w-[480px] animate-slideUp rounded-t-[28px] border-t border-white/10 bg-surface-container/95 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-float backdrop-blur-2xl">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-white/20" />
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-tertiary/15 text-tertiary">
                <span className="material-symbols-outlined fill text-[24px]">flag</span>
              </span>
              <div>
                <p className="text-sm font-extrabold text-on-surface">Complete this ride?</p>
                <p className="text-[11px] text-on-surface-variant">
                  Fares will settle and your earnings are released instantly.
                </p>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => setConfirmOpen(false)} className="btn-ghost py-3">
                Not yet
              </button>
              <button onClick={handleCompleteTrip} disabled={isCompleting} className="btn-primary py-3">
                {isCompleting ? "Settling…" : "Complete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverActiveRidePage;
