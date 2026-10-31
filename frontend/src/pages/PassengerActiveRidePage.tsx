import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiService } from "../api/client";
import { useToast } from "../components/Toast";
import type { DynamicPinData, Trip } from "../types";
import Navbar from "../components/Navbar";
import TransitMap from "../components/TransitMap";
import DriverBadge from "../components/DriverBadge";
import StatTile from "../components/StatTile";
import SOSModal from "../components/SOSModal";

const STAGES = [
  { key: "pickup", label: "Metro gate pickup", icon: "pin_drop" },
  { key: "enroute", label: "Feeder in transit", icon: "directions_car" },
  { key: "arriving", label: "Approaching drop", icon: "navigation" },
  { key: "done", label: "Drop point reached", icon: "flag" },
];

export const PassengerActiveRidePage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [pinData, setPinData] = useState<DynamicPinData | null>(null);
  const [progressPct, setProgressPct] = useState(28);
  const [etaMinutes, setEtaMinutes] = useState(14);
  const [sosOpen, setSosOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!tripId || tripId === "trip-demo") {
        setLoading(false);
        return;
      }
      try {
        const loaded = await apiService.getTrip(tripId);
        if (!isMounted) return;
        setTrip(loaded);
        if (loaded.status === "completed") {
          navigate(`/trip/${tripId}/complete`);
          return;
        }
        if (loaded.passengers?.length) {
          apiService
            .getPassengerPin(tripId, loaded.passengers[0].id)
            .then((pin) => isMounted && setPinData(pin))
            .catch(() => undefined);
        }
      } catch {
        /* keep demo view */
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();
    const poll = window.setInterval(load, 5000);
    return () => {
      isMounted = false;
      window.clearInterval(poll);
    };
  }, [tripId, navigate]);

  useEffect(() => {
    const progressTimer = window.setInterval(() => {
      setProgressPct((prev) => (prev < 94 ? prev + 4 : 94));
      setEtaMinutes((prev) => (prev > 1 ? prev - 1 : 1));
    }, 9000);
    return () => window.clearInterval(progressTimer);
  }, []);

  const stageIndex = progressPct < 20 ? 0 : progressPct < 55 ? 1 : progressPct < 90 ? 2 : 3;
  const origin = trip?.journey?.origin_station || "Ramwadi";
  const destination = trip?.journey?.destination_zone || "EON IT Park Kharadi";
  const fare = trip?.total_fare || trip?.journey?.estimated_total_cost || 55;
  const co2 = trip?.co2_saved_kg || 1.8;

  const handleShare = async () => {
    const text = `I'm on a StationPool feeder ride: ${origin} → ${destination}. Live trip ID ${tripId || "demo"}.`;
    try {
      if (navigator.share) await navigator.share({ title: "My StationPool ride", text });
      else {
        await navigator.clipboard.writeText(text);
        toast("Trip shared", "Live ride details copied to your clipboard.", "success");
      }
    } catch {
      /* dismissed */
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col pb-10">
      <Navbar title="Active feeder ride" subtitle="Live in-transit" showBack={false} />

      <main className="flex flex-1 flex-col gap-4 px-4 pt-20">
        {/* Map card */}
        <section className="glass-card relative overflow-hidden animate-fadeIn">
          <div className="relative">
            <TransitMap
              originName={origin}
              destinationName={destination}
              progressPct={progressPct}
              mode="active_ride"
              height="220px"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/10 to-transparent" />

            <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-tertiary/30 bg-ink/70 px-2.5 py-1 backdrop-blur">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tertiary opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-tertiary" />
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-tertiary">
                {loading ? "Connecting…" : "Live tracking"}
              </span>
            </div>

            <div className="absolute right-3 top-3 rounded-2xl border border-white/10 bg-ink/75 px-3 py-1.5 text-center backdrop-blur">
              <p className="font-mono text-base font-extrabold leading-none text-secondary">
                {etaMinutes}
              </p>
              <p className="text-[8px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">
                min ETA
              </p>
            </div>

            <div className="absolute inset-x-3 bottom-3">
              <div className="flex items-center justify-between gap-2 text-[11px] font-bold text-on-surface">
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="h-2 w-2 shrink-0 rounded-full bg-secondary" />
                  <span className="truncate">{origin}</span>
                </span>
                <span className="material-symbols-outlined text-[14px] text-on-surface-variant/60">
                  arrow_forward
                </span>
                <span className="flex min-w-0 items-center gap-1.5">
                  <span className="truncate text-right">{destination}</span>
                  <span className="h-2 w-2 shrink-0 rounded-full bg-tertiary" />
                </span>
              </div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-secondary to-tertiary transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="glass-panel p-4">
          <div className="mb-3 flex items-center justify-between">
            <p className="eyebrow">Ride progress</p>
            <span className="text-[10px] font-mono text-tertiary">{progressPct}% complete</span>
          </div>
          <div className="flex items-start justify-between">
            {STAGES.map((stage, index) => {
              const done = index < stageIndex;
              const active = index === stageIndex;
              return (
                <React.Fragment key={stage.key}>
                  <div className="flex w-14 flex-col items-center gap-1.5 text-center">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
                        done
                          ? "border-tertiary/40 bg-tertiary/15 text-tertiary"
                          : active
                            ? "border-secondary/50 bg-secondary/15 text-secondary shadow-glow"
                            : "border-white/10 bg-white/5 text-on-surface-variant/50"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{stage.icon}</span>
                    </span>
                    <span
                      className={`text-[9px] font-bold leading-tight ${
                        done || active ? "text-on-surface" : "text-on-surface-variant/50"
                      }`}
                    >
                      {stage.label}
                    </span>
                  </div>
                  {index < STAGES.length - 1 && (
                    <span
                      className={`mt-4 h-px flex-1 ${index < stageIndex ? "bg-tertiary/50" : "bg-white/10"}`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </section>

        {/* Driver */}
        <section className="glass-panel flex flex-col gap-3 p-4">
          <DriverBadge
            driver={trip?.journey?.driver}
            subtitle={`${trip?.journey?.driver?.vehicle_model || "Honda City (Silver)"} · ${trip?.journey?.driver?.vehicle_registration || "MH 12 QX 4509"}`}
          />
          <div className="flex items-center justify-between gap-2 rounded-xl bg-white/[0.03] px-3 py-2">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-on-surface-variant">
              <span className="material-symbols-outlined fill text-[14px] text-tertiary">verified_user</span>
              {trip?.passengers?.[0]?.is_verified ? "PIN verified at pickup" : "PIN handshake pending"}
            </div>
            {pinData && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(pinData.pin).catch(() => undefined);
                  toast("PIN copied", "Your boarding PIN is on the clipboard.", "success");
                }}
                className="flex items-center gap-1 rounded-full bg-secondary/10 px-2 py-0.5 font-mono text-[11px] font-bold text-secondary"
              >
                <span className="material-symbols-outlined text-[12px]">pin</span>
                {pinData.pin}
              </button>
            )}
          </div>
        </section>

        {/* Stats */}
        <section className="grid grid-cols-2 gap-2.5">
          <StatTile label="Locked fare" value={`₹${fare}`} hint="Zero surge" icon="payments" tone="tertiary" />
          <StatTile label="CO₂ prevented" value={`${co2} kg`} hint="Shared feeder ride" icon="eco" tone="secondary" />
        </section>

        {/* Actions */}
        <section className="grid grid-cols-3 gap-2">
          <button onClick={handleShare} className="btn-ghost flex-col gap-1 py-3">
            <span className="material-symbols-outlined text-[20px] text-secondary">share_location</span>
            <span className="text-[10px]">Share trip</span>
          </button>
          <button
            onClick={() => {
              if (trip?.journey?.driver?.mobile_number) {
                window.location.href = `tel:${trip.journey.driver.mobile_number}`;
              } else {
                toast("Demo driver", "Driver calling is available on live trips.", "info");
              }
            }}
            className="btn-ghost flex-col gap-1 py-3"
          >
            <span className="material-symbols-outlined text-[20px] text-secondary">call</span>
            <span className="text-[10px]">Call driver</span>
          </button>
          <button onClick={() => setSosOpen(true)} className="btn-ghost flex-col gap-1 border-error/25 py-3 text-error">
            <span className="material-symbols-outlined text-[20px]">sos</span>
            <span className="text-[10px]">Emergency</span>
          </button>
        </section>

        <button
          onClick={() => navigate(`/ride/driver/${tripId || "trip-demo"}`)}
          className="mx-auto flex items-center gap-1 text-[10px] font-semibold text-on-surface-variant transition hover:text-secondary"
        >
          <span className="material-symbols-outlined text-[14px]">swap_horiz</span>
          Open driver cockpit (demo)
        </button>
      </main>

      {sosOpen && <SOSModal onClose={() => setSosOpen(false)} />}
    </div>
  );
};

export default PassengerActiveRidePage;
