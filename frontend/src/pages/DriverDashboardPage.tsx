import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import type { DriverProfile, Journey, Trip } from "../types";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import StatTile from "../components/StatTile";
import AnimatedNumber from "../components/AnimatedNumber";
import EmptyState from "../components/EmptyState";
import RouteLine from "../components/RouteLine";

type Tab = "active" | "past";

export const DriverDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [profile, setProfile] = useState<DriverProfile | null>(null);
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [tab, setTab] = useState<Tab>("active");
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [cancelTarget, setCancelTarget] = useState<Journey | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [profileResult, journeyResult, tripResult] = await Promise.allSettled([
        apiService.getDriverProfile(),
        apiService.getMyJourneys(),
        apiService.getMyTrips(),
      ]);
      if (profileResult.status === "fulfilled") setProfile(profileResult.value);
      else setProfile(null);
      if (journeyResult.status === "fulfilled") setJourneys(journeyResult.value);
      if (tripResult.status === "fulfilled") setTrips(tripResult.value);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const completedTrips = trips.filter((trip) => trip.status === "completed");
  const earnings = completedTrips.reduce((sum, trip) => sum + (trip.total_fare || 0), 0);
  const activeJourneys = journeys.filter(
    (journey) => journey.status === "open" || journey.status === "full" || journey.status === "in_progress"
  );
  const pastJourneys = journeys.filter(
    (journey) => journey.status === "completed" || journey.status === "cancelled"
  );
  const shown = tab === "active" ? activeJourneys : pastJourneys;

  const seatsFilled = useMemo(
    () => activeJourneys.reduce((sum, journey) => sum + (journey.total_seats - journey.available_seats), 0),
    [activeJourneys]
  );

  const handleManage = async (journey: Journey) => {
    setBusyId(journey.id);
    try {
      const trip = await apiService.startTrip(journey.id);
      navigate(`/ride/driver/${trip.id}`);
    } catch {
      toast("Could not open ride", "Please refresh and retry.", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelTarget) return;
    setBusyId(cancelTarget.id);
    try {
      await apiService.cancelJourney(cancelTarget.id);
      setJourneys((prev) =>
        prev.map((journey) =>
          journey.id === cancelTarget.id ? { ...journey, status: "cancelled" } : journey
        )
      );
      toast("Ride cancelled", "Passengers have been notified and seats released.", "success");
    } catch {
      toast("Cancel failed", "Please try again in a moment.", "error");
    } finally {
      setBusyId(null);
      setCancelTarget(null);
    }
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col pb-28">
      <Navbar title="Driver hub" subtitle="Your feeder operations" showBack />

      <main className="flex flex-1 flex-col gap-4 px-4 pt-20">
        {/* Identity banner */}
        {profile ? (
          <section className="glass-card p-4 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient font-mono text-base font-extrabold text-ink shadow-glow">
                  {(user?.full_name || "D").charAt(0)}
                  <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-surface bg-tertiary">
                    <span className="material-symbols-outlined fill text-[9px] text-ink">verified</span>
                  </span>
                </div>
                <div>
                  <p className="text-sm font-extrabold text-on-surface">{user?.full_name || "Driver"}</p>
                  <p className="text-[11px] text-on-surface-variant">
                    {profile.vehicle_make_model || "Verified vehicle"} ·{" "}
                    <span className="font-mono text-secondary">{profile.vehicle_registration}</span>
                  </p>
                </div>
              </div>
              <span className="flex items-center gap-1 rounded-full bg-tertiary/10 px-2 py-1 text-[9px] font-extrabold text-tertiary">
                <span className="material-symbols-outlined fill text-[12px]">verified_user</span>
                Verified
              </span>
            </div>

            <div className="mt-3 grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-white/[0.03] px-2 py-2 text-center">
                <p className="font-mono text-sm font-extrabold text-on-surface">{journeys.length}</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-on-surface-variant/60">
                  Published
                </p>
              </div>
              <div className="rounded-xl bg-white/[0.03] px-2 py-2 text-center">
                <p className="font-mono text-sm font-extrabold text-on-surface">{completedTrips.length}</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-on-surface-variant/60">
                  Completed
                </p>
              </div>
              <div className="rounded-xl bg-white/[0.03] px-2 py-2 text-center">
                <p className="font-mono text-sm font-extrabold text-amber-400">4.9</p>
                <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-on-surface-variant/60">
                  Rating
                </p>
              </div>
            </div>
          </section>
        ) : !loading ? (
          <section className="glass-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/10 text-secondary ring-1 ring-secondary/25">
                <span className="material-symbols-outlined fill text-[24px]">badge</span>
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-on-surface">No driver profile yet</h1>
                <p className="text-[11px] text-on-surface-variant">
                  Verify your licence and vehicle to start publishing.
                </p>
              </div>
            </div>
            <button onClick={() => navigate("/driver/register")} className="btn-primary mt-4">
              Start verification
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </section>
        ) : null}

        {/* Stats */}
        <section className="grid grid-cols-3 gap-2">
          <StatTile label="Earnings" value={<AnimatedNumber value={earnings} prefix="₹" />} icon="payments" tone="tertiary" />
          <StatTile label="Seats filled" value={<AnimatedNumber value={seatsFilled} />} icon="airline_seat_recline_normal" tone="secondary" />
          <StatTile label="Live rides" value={<AnimatedNumber value={activeJourneys.length} />} icon="bolt" tone="neutral" />
        </section>

        {/* Tabs */}
        <div className="flex gap-1 rounded-2xl border border-white/10 bg-surface-container-lowest/70 p-1">
          {(
            [
              { value: "active", label: `Active (${activeJourneys.length})` },
              { value: "past", label: `History (${pastJourneys.length})` },
            ] as const
          ).map((item) => (
            <button
              key={item.value}
              onClick={() => setTab(item.value)}
              className={`flex-1 rounded-xl py-2.5 text-xs font-extrabold transition-all ${
                tab === item.value
                  ? "bg-brand-gradient-soft text-secondary shadow-[inset_0_0_0_1px_rgba(148,204,255,0.3)]"
                  : "text-on-surface-variant"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* List */}
        <section className="flex flex-col gap-2.5">
          {loading ? (
            [0, 1].map((index) => (
              <div key={index} className="glass-panel flex flex-col gap-3 p-4">
                <div className="skeleton h-3 w-1/2" />
                <div className="skeleton h-12 w-full" />
                <div className="skeleton h-8 w-full" />
              </div>
            ))
          ) : shown.length === 0 ? (
            <EmptyState
              icon={tab === "active" ? "add_road" : "history"}
              title={tab === "active" ? "No active rides" : "No past rides yet"}
              description={
                tab === "active"
                  ? "Publish a feeder seat and your route will appear here with live bookings."
                  : "Completed and cancelled journeys will be listed here."
              }
              actionLabel={tab === "active" ? "Publish a ride" : undefined}
              onAction={tab === "active" ? () => navigate("/driver/publish") : undefined}
              tone={tab === "active" ? "tertiary" : "secondary"}
            />
          ) : (
            shown.map((journey) => {
              const isActive = journey.status === "open" || journey.status === "full" || journey.status === "in_progress";
              const filled = journey.total_seats - journey.available_seats;
              return (
                <article key={journey.id} className="glass-card p-4 animate-fadeInUp">
                  <div className="flex items-center justify-between">
                    <span
                      className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-[0.08em] ${
                        journey.status === "open"
                          ? "bg-tertiary/10 text-tertiary"
                          : journey.status === "full"
                            ? "bg-amber-400/10 text-amber-400"
                            : journey.status === "in_progress"
                              ? "bg-secondary/10 text-secondary"
                              : journey.status === "cancelled"
                                ? "bg-error/10 text-error"
                                : "bg-white/5 text-on-surface-variant"
                      }`}
                    >
                      {journey.status.replace("_", " ")}
                    </span>
                    <span className="font-mono text-[10px] text-on-surface-variant">
                      {formatTime(journey.departure_time)}
                    </span>
                  </div>

                  <div className="mt-2.5">
                    <RouteLine
                      origin={journey.origin_station}
                      destination={journey.destination_zone}
                      originSub="Metro exit"
                      destinationSub={journey.destination_label || "Drop point"}
                      compact
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant">
                        <span className="material-symbols-outlined text-[14px] text-secondary">group</span>
                        {filled}/{journey.total_seats} filled
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-bold text-on-surface-variant">
                        <span className="material-symbols-outlined text-[14px] text-tertiary">payments</span>
                        ₹{journey.estimated_total_cost}/seat
                      </span>
                    </div>
                    <span className="font-mono text-[10px] font-bold text-tertiary">
                      ₹{journey.estimated_total_cost * Math.max(filled, 0)}
                    </span>
                  </div>

                  {isActive && (
                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => handleManage(journey)}
                        disabled={busyId === journey.id}
                        className="btn-primary flex-1 py-2.5 text-[11px]"
                      >
                        {busyId === journey.id ? "Opening…" : "Manage ride"}
                        <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
                      </button>
                      <button
                        onClick={() => setCancelTarget(journey)}
                        className="btn-ghost px-3 py-2.5 text-[11px] text-error"
                      >
                        <span className="material-symbols-outlined text-[16px]">cancel</span>
                      </button>
                    </div>
                  )}
                </article>
              );
            })
          )}
        </section>

        <button onClick={() => navigate("/driver/publish")} className="btn-primary mt-1">
          <span className="material-symbols-outlined text-[18px]">add_road</span>
          Publish another ride
        </button>
      </main>

      {/* Cancel confirm */}
      {cancelTarget && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center">
          <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm animate-fadeIn" onClick={() => setCancelTarget(null)} />
          <div className="relative w-full max-w-[480px] animate-slideUp rounded-t-[28px] border-t border-white/10 bg-surface-container/95 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-float backdrop-blur-2xl">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-white/20" />
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-error-container/50 text-error">
                <span className="material-symbols-outlined text-[24px]">cancel</span>
              </span>
              <div>
                <p className="text-sm font-extrabold text-on-surface">Cancel this ride?</p>
                <p className="text-[11px] text-on-surface-variant">
                  {cancelTarget.origin_station} → {cancelTarget.destination_zone}
                </p>
              </div>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-on-surface-variant">
              All booked passengers will be notified and their seats released. This cannot be undone.
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => setCancelTarget(null)} className="btn-ghost py-3">
                Keep ride
              </button>
              <button
                onClick={handleCancel}
                disabled={busyId === cancelTarget.id}
                className="w-full rounded-2xl bg-error-container px-4 py-3 text-xs font-extrabold text-error active:scale-95"
              >
                {busyId === cancelTarget.id ? "Cancelling…" : "Cancel ride"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default DriverDashboardPage;
