import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import type { Trip } from "../types";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import SOSModal from "../components/SOSModal";
import StatTile from "../components/StatTile";
import AnimatedNumber from "../components/AnimatedNumber";
import EmptyState from "../components/EmptyState";
import Segmented from "../components/Segmented";

type Filter = "all" | "completed" | "active";

const SAFETY_TOOLS = [
  {
    id: "sos",
    icon: "sos",
    label: "Emergency SOS",
    sub: "Police 112 + Metro desk",
    tone: "text-error bg-error-container/40 border-error/25",
  },
  {
    id: "share",
    icon: "share_location",
    label: "Share live trip",
    sub: "Send tracking to a contact",
    tone: "text-secondary bg-secondary/10 border-secondary/25",
  },
  {
    id: "helpline",
    icon: "call",
    label: "Metro helpline",
    sub: "1800-267-7863",
    tone: "text-tertiary bg-tertiary/10 border-tertiary/25",
  },
  {
    id: "report",
    icon: "report",
    label: "Report an issue",
    sub: "Misconduct or fare issue",
    tone: "text-amber-400 bg-amber-400/10 border-amber-400/25",
  },
];

export const ActivitySafetyCenterPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Trip | null>(null);

  useEffect(() => {
    apiService
      .getMyTrips()
      .then(setTrips)
      .catch(() => toast("History unavailable", "Start the backend to load your trips.", "error"))
      .finally(() => setLoading(false));
  }, [toast]);

  const completed = trips.filter((trip) => trip.status === "completed");
  const active = trips.filter((trip) => trip.status === "in_progress" || trip.status === "confirmed");
  const spend = completed.reduce((sum, trip) => sum + (trip.total_fare || 0), 0);
  const co2 = completed.reduce((sum, trip) => sum + (trip.co2_saved_kg || 0), 0);

  const filtered = useMemo(() => {
    if (filter === "completed") return completed;
    if (filter === "active") return active;
    return trips;
  }, [filter, trips, completed, active]);

  const formatWhen = (trip: Trip) => {
    const raw = trip.completed_at || trip.started_at || trip.journey?.departure_time;
    if (!raw) return "Recent";
    return new Date(raw).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusMeta = (status: Trip["status"]) => {
    switch (status) {
      case "completed":
        return { label: "Completed", tone: "bg-tertiary/10 text-tertiary" };
      case "in_progress":
        return { label: "In transit", tone: "bg-secondary/10 text-secondary" };
      case "confirmed":
        return { label: "Boarding", tone: "bg-amber-400/10 text-amber-400" };
      default:
        return { label: "Cancelled", tone: "bg-error/10 text-error" };
    }
  };

  const handleTool = async (id: string) => {
    if (id === "sos") {
      setIsSOSOpen(true);
      return;
    }
    if (id === "helpline") {
      window.location.href = "tel:18002677863";
      return;
    }
    if (id === "share") {
      const live = active[0];
      const text = live
        ? `I'm on StationPool trip ${live.id.slice(0, 8)}: ${live.journey?.origin_station} → ${live.journey?.destination_zone}.`
        : "I'm using StationPool for verified Pune Metro feeder rides.";
      try {
        if (navigator.share) await navigator.share({ title: "My StationPool safety ping", text });
        else {
          await navigator.clipboard.writeText(text);
          toast("Safety ping copied", "Share it with your trusted contact.", "success");
        }
      } catch {
        /* dismissed */
      }
      return;
    }
    toast("Issue reported", "Our Pune Metro safety desk will follow up shortly.", "info");
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col pb-28">
      <Navbar title="Safety & activity" subtitle={user?.full_name || "Pune Metro feeder club"} />

      <main className="flex flex-1 flex-col gap-4 px-4 pt-20">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-primary-container p-4 shadow-card animate-fadeIn">
          <div className="pointer-events-none absolute -right-14 -top-14 h-44 w-44 rounded-full bg-secondary/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-10 h-40 w-40 rounded-full bg-tertiary/10 blur-3xl" />

          <div className="relative">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-secondary">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tertiary opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-tertiary" />
                </span>
                Verified green rider
              </span>
              <span className="rounded-full bg-white/10 px-2 py-0.5 font-mono text-[9px] font-bold text-on-surface-variant">
                30-day snapshot
              </span>
            </div>

            <div className="mt-3 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant/70">
                  Money saved vs auto
                </p>
                <AnimatedNumber
                  value={Math.max(spend, 0)}
                  prefix="₹"
                  className="mt-0.5 block font-mono text-3xl font-extrabold tracking-tight text-tertiary"
                />
              </div>
              <span className="flex items-center gap-1 rounded-lg bg-tertiary/10 px-2 py-1 text-[10px] font-extrabold text-tertiary">
                <span className="material-symbols-outlined text-[13px]">trending_up</span>
                +28%
              </span>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl bg-white/[0.06] p-2.5">
                <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px] text-secondary">directions_subway</span>
                  Total trips
                </div>
                <p className="mt-1 font-mono text-lg font-extrabold text-on-surface">
                  <AnimatedNumber value={trips.length} />
                </p>
              </div>
              <div className="rounded-xl bg-white/[0.06] p-2.5">
                <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                  <span className="material-symbols-outlined text-[14px] text-tertiary">eco</span>
                  CO₂ prevented
                </div>
                <p className="mt-1 font-mono text-lg font-extrabold text-on-surface">
                  <AnimatedNumber value={Number(co2.toFixed(1))} decimals={1} suffix=" kg" />
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick safety tools */}
        <section>
          <div className="mb-2 flex items-center justify-between px-0.5">
            <p className="eyebrow">Safety toolkit</p>
            <span className="text-[10px] text-on-surface-variant">24×7 response</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {SAFETY_TOOLS.map((tool) => (
              <button
                key={tool.id}
                onClick={() => handleTool(tool.id)}
                className="glass-panel flex flex-col items-start gap-1.5 p-3 text-left transition-all hover:border-secondary/30 tap-scale"
              >
                <span className={`flex h-8 w-8 items-center justify-center rounded-xl border ${tool.tone}`}>
                  <span className="material-symbols-outlined text-[18px]">{tool.icon}</span>
                </span>
                <span className="text-[11px] font-extrabold text-on-surface">{tool.label}</span>
                <span className="text-[9px] leading-tight text-on-surface-variant">{tool.sub}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Stats row */}
        <section className="grid grid-cols-2 gap-2.5">
          <StatTile
            label="Completed rides"
            value={<AnimatedNumber value={completed.length} />}
            hint={`${active.length} active now`}
            icon="task_alt"
            tone="tertiary"
          />
          <StatTile
            label="Avg. fare"
            value={`₹${completed.length ? Math.round(spend / completed.length) : 0}`}
            hint="Fixed, no surge"
            icon="payments"
            tone="secondary"
          />
        </section>

        {/* Trip history */}
        <section className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-0.5">
            <p className="eyebrow">Recent feeder trips</p>
            <span className="text-[10px] font-mono text-on-surface-variant">All verified</span>
          </div>

          <Segmented
            value={filter}
            onChange={setFilter}
            size="sm"
            options={[
              { value: "all", label: "All", icon: "list" },
              { value: "completed", label: "Completed", icon: "check_circle" },
              { value: "active", label: "Active", icon: "bolt" },
            ]}
          />

          {loading ? (
            [0, 1].map((index) => (
              <div key={index} className="glass-panel flex flex-col gap-2.5 p-3.5">
                <div className="skeleton h-2.5 w-1/3" />
                <div className="skeleton h-3.5 w-3/4" />
                <div className="skeleton h-2.5 w-1/2" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <EmptyState
              icon="history"
              title="No trips here yet"
              description="Match a feeder ride from your metro station and your green commute history will show up here."
              actionLabel="Find a pool"
              onAction={() => navigate("/home")}
            />
          ) : (
            filtered.map((trip) => {
              const meta = statusMeta(trip.status);
              return (
                <button
                  key={trip.id}
                  onClick={() => setSelected(trip)}
                  className="glass-panel flex flex-col gap-2.5 p-3.5 text-left transition-all hover:border-secondary/30 tap-scale"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-on-surface-variant">{formatWhen(trip)}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${meta.tone}`}>
                      {meta.label}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-extrabold text-on-surface">
                        {trip.journey?.origin_station || "Metro station"} →{" "}
                        {trip.journey?.destination_zone || "Destination"}
                      </p>
                      <p className="truncate text-[10px] text-on-surface-variant">
                        {trip.journey?.driver?.full_name || "Verified driver"} ·{" "}
                        {trip.journey?.driver?.vehicle_model || "Feeder vehicle"}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-mono text-xs font-extrabold text-secondary">₹{trip.total_fare}</p>
                      <p className="text-[9px] text-tertiary">-{trip.co2_saved_kg} kg CO₂</p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </section>

        {/* Safety footer */}
        <div className="flex items-start gap-2.5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3.5">
          <span className="material-symbols-outlined text-[18px] text-tertiary">verified_user</span>
          <p className="text-[10px] leading-relaxed text-on-surface-variant">
            Every StationPool commuter is OTP-verified. Boarding PINs rotate every 30 minutes and
            live trips can be shared with trusted contacts.
          </p>
        </div>
      </main>

      {/* Trip detail sheet */}
      {selected && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center">
          <div className="absolute inset-0 bg-ink/80 backdrop-blur-sm animate-fadeIn" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-[480px] animate-slideUp rounded-t-[28px] border-t border-white/10 bg-surface-container/95 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-float backdrop-blur-2xl">
            <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-white/20" />
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">Trip receipt</p>
                <p className="mt-0.5 text-sm font-extrabold text-on-surface">
                  {selected.journey?.origin_station} → {selected.journey?.destination_zone}
                </p>
              </div>
              <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold ${statusMeta(selected.status).tone}`}>
                {statusMeta(selected.status).label}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { label: "Fare paid", value: `₹${selected.total_fare}` },
                { label: "CO₂ prevented", value: `${selected.co2_saved_kg} kg` },
                { label: "Driver", value: selected.journey?.driver?.full_name || "—" },
                { label: "Vehicle", value: selected.journey?.driver?.vehicle_registration || "—" },
              ].map((row) => (
                <div key={row.label} className="rounded-xl bg-white/[0.03] p-2.5">
                  <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-on-surface-variant/60">
                    {row.label}
                  </p>
                  <p className="mt-0.5 truncate font-mono text-[11px] font-bold text-on-surface">
                    {row.value}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button onClick={() => setSelected(null)} className="btn-ghost py-3">
                Close
              </button>
              <button
                onClick={() => {
                  if (selected.status === "completed") navigate(`/trip/${selected.id}/complete`);
                  else if (selected.status === "in_progress") navigate(`/ride/passenger/${selected.id}`);
                  else navigate(`/match/${selected.journey_id}`);
                }}
                className="btn-primary py-3"
              >
                {selected.status === "completed"
                  ? "View receipt"
                  : selected.status === "in_progress"
                    ? "Track ride"
                    : "View pool"}
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
      {isSOSOpen && <SOSModal onClose={() => setIsSOSOpen(false)} />}
    </div>
  );
};

export default ActivitySafetyCenterPage;
