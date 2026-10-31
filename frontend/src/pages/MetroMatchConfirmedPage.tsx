import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { apiService } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import type { DynamicPinData, Journey } from "../types";
import Navbar from "../components/Navbar";
import DriverBadge from "../components/DriverBadge";
import RouteLine from "../components/RouteLine";

export const MetroMatchConfirmedPage: React.FC = () => {
  const { journeyId } = useParams<{ journeyId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();

  const stateData = location.state as { tripId?: string; journey?: Journey } | null;
  const [tripId, setTripId] = useState(stateData?.tripId || "");
  const [journey, setJourney] = useState<Journey | null>(stateData?.journey || null);
  const [pinData, setPinData] = useState<DynamicPinData | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(600);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;

    const init = async () => {
      try {
        let currentTripId = stateData?.tripId || "";
        if (!currentTripId && journeyId) {
          const trip = await apiService.startTrip(journeyId);
          currentTripId = trip.id;
          setTripId(trip.id);
        }
        if (!journey && journeyId) {
          const loaded = await apiService.getJourney(journeyId);
          setJourney(loaded);
        }
        if (currentTripId) {
          const pin = await apiService.getPassengerPin(currentTripId, user?.id);
          setPinData(pin);
          setSecondsLeft(Math.max(0, Math.round((new Date(pin.expires_at).getTime() - Date.now()) / 1000)));
        } else {
          setError("Could not locate this pool.");
        }
      } catch {
        setError("We couldn't load your boarding pass. Please retry.");
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [journeyId, journey, stateData?.tripId, user?.id]);

  useEffect(() => {
    const timer = setInterval(() => setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCopy = async () => {
    if (!pinData?.pin) return;
    try {
      await navigator.clipboard.writeText(pinData.pin);
      toast("PIN copied", "Show it to your driver at the metro gate.", "success");
    } catch {
      toast("Copy failed", "Long-press the PIN to copy it manually.", "error");
    }
  };

  const handleShare = async () => {
    if (!pinData || !journey) return;
    const shareText = `StationPool boarding PIN: ${pinData.pin} · ${journey.origin_station} → ${journey.destination_zone}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "StationPool boarding pass", text: shareText });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast("Boarding pass copied", "Share it with your co-commuters.", "success");
      }
    } catch {
      /* user dismissed the share sheet */
    }
  };

  const handleRefreshPin = async () => {
    if (!tripId) return;
    try {
      const pin = await apiService.getPassengerPin(tripId, user?.id);
      setPinData(pin);
      setSecondsLeft(Math.max(0, Math.round((new Date(pin.expires_at).getTime() - Date.now()) / 1000)));
      toast("PIN refreshed", "A fresh dynamic PIN is ready.", "success");
    } catch {
      toast("Refresh failed", "Please try again in a moment.", "error");
    }
  };

  const formatTimer = (total: number) => {
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const timerProgress = Math.max(0, Math.min(100, (secondsLeft / 600) * 100));

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col pb-10">
      <Navbar title="Pool confirmed" showBack />

      <main className="flex flex-1 flex-col gap-4 px-4 pt-20">
        {/* Success header */}
        <section className="flex items-center gap-3 animate-fadeIn">
          <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-tertiary/15 text-tertiary">
            <span className="absolute inset-0 animate-ping rounded-2xl border border-tertiary/30" />
            <span className="material-symbols-outlined fill text-[26px]">check_circle</span>
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-extrabold tracking-tight text-on-surface">Seat confirmed</h1>
            <p className="text-[11px] text-on-surface-variant">
              {journey?.origin_station || "Metro station"} gate · {formatTimer(secondsLeft)} left to board
            </p>
          </div>
          <span className="chip chip-active">PIN ready</span>
        </section>

        {loading ? (
          <div className="glass-card flex flex-col items-center gap-3 p-6">
            <div className="skeleton h-5 w-24" />
            <div className="skeleton h-16 w-full" />
            <div className="skeleton h-3 w-2/3" />
          </div>
        ) : error ? (
          <div className="glass-card flex flex-col items-center gap-3 p-6 text-center">
            <span className="material-symbols-outlined text-[32px] text-error">error</span>
            <p className="text-sm font-extrabold text-on-surface">Boarding pass unavailable</p>
            <p className="text-xs text-on-surface-variant">{error}</p>
            <button onClick={() => navigate("/match")} className="btn-primary mt-1 max-w-[220px] py-2.5 text-xs">
              Back to radar
            </button>
          </div>
        ) : (
          <>
            {/* PIN card */}
            <section className="glass-card relative overflow-hidden p-5 text-center animate-pop">
              <div className="pointer-events-none absolute -left-16 -top-16 h-40 w-40 rounded-full bg-secondary/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -right-10 h-36 w-36 rounded-full bg-tertiary/10 blur-3xl" />

              <div className="relative">
                <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-secondary/25 bg-secondary/10 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-secondary">
                  <span className="material-symbols-outlined text-[13px]">pin</span>
                  Boarding PIN
                </div>
                <p className="text-[11px] text-on-surface-variant">Show this to your driver at pickup</p>

                <button
                  onClick={handleCopy}
                  aria-label="Copy boarding PIN"
                  className="mx-auto mt-3 flex items-center justify-center gap-2.5 rounded-2xl border border-white/10 bg-surface-container-lowest/70 px-5 py-3.5 shadow-inner transition active:scale-95"
                >
                  {(pinData?.pin || "••••").split("").map((digit, index) => (
                    <span
                      key={index}
                      className="font-mono text-[2.1rem] font-extrabold leading-none tracking-[0.15em] text-secondary"
                    >
                      {digit}
                    </span>
                  ))}
                </button>

                <div className="mt-3 flex items-center justify-center gap-2 text-[10px] text-on-surface-variant">
                  <span className="material-symbols-outlined text-[13px] text-tertiary">timer</span>
                  <span className="font-mono">Expires in {formatTimer(secondsLeft)}</span>
                  <span className="text-on-surface-variant/40">·</span>
                  <button
                    onClick={handleRefreshPin}
                    className="flex items-center gap-0.5 font-bold text-secondary hover:underline"
                  >
                    <span className="material-symbols-outlined text-[13px]">refresh</span>
                    Refresh
                  </button>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-secondary to-tertiary transition-all duration-1000"
                    style={{ width: `${timerProgress}%` }}
                  />
                </div>

                <div className="mt-3 flex gap-2">
                  <button onClick={handleCopy} className="btn-ghost flex-1 py-2.5 text-[11px]">
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                    Copy PIN
                  </button>
                  <button onClick={handleShare} className="btn-ghost flex-1 py-2.5 text-[11px]">
                    <span className="material-symbols-outlined text-[16px]">share</span>
                    Share pass
                  </button>
                </div>
              </div>
            </section>

            {/* Route */}
            <section className="glass-panel p-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="eyebrow">Your route</p>
                <span className="text-[10px] font-mono text-on-surface-variant">
                  {journey?.vehicle_category === "two_wheeler" ? "Bike pool" : "Car pool"}
                </span>
              </div>
              <RouteLine
                origin={journey?.origin_station || "Metro station"}
                destination={journey?.destination_zone || "Destination"}
                originSub="Metro exit"
                destinationSub={journey?.destination_label || "Drop point"}
              />
            </section>

            {/* Driver */}
            <section className="glass-panel flex flex-col gap-3 p-4">
              <DriverBadge
                driver={journey?.driver}
                subtitle={`${journey?.driver?.vehicle_model || "Verified vehicle"} · ${journey?.driver?.vehicle_registration || "MH 12"}`}
              />
              <div className="flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2.5">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/60">
                    Destination
                  </p>
                  <p className="text-xs font-extrabold text-on-surface">
                    {journey?.destination_zone || "—"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/60">
                    Locked fare
                  </p>
                  <p className="font-mono text-sm font-extrabold text-tertiary">
                    ₹{journey?.estimated_total_cost || 55}
                  </p>
                </div>
              </div>
            </section>

            <button
              onClick={() => navigate(`/ride/passenger/${tripId || "trip-demo"}`)}
              className="btn-primary"
            >
              <span className="material-symbols-outlined text-[18px]">navigation</span>
              Track my ride
            </button>

            <div className="flex items-center justify-center gap-4 pb-2">
              <button
                onClick={() => navigate(`/ride/verify-pin/${tripId || "trip-demo"}`)}
                className="flex items-center gap-1 text-[10px] font-semibold text-on-surface-variant transition hover:text-secondary"
              >
                <span className="material-symbols-outlined text-[14px]">badge</span>
                Driver handoff
              </button>
              <span className="h-3 w-px bg-white/10" />
              <button
                onClick={() => navigate("/activity")}
                className="flex items-center gap-1 text-[10px] font-semibold text-on-surface-variant transition hover:text-secondary"
              >
                <span className="material-symbols-outlined text-[14px]">shield</span>
                Safety centre
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default MetroMatchConfirmedPage;
