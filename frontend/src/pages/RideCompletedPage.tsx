import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiService } from "../api/client";
import { useToast } from "../components/Toast";
import type { Trip } from "../types";
import Navbar from "../components/Navbar";
import Confetti from "../components/Confetti";
import StatTile from "../components/StatTile";

const TAGS = ["Smooth ride", "On time", "Safe driving", "Friendly", "Clean vehicle"];

export const RideCompletedPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (tripId && tripId !== "demo") {
      apiService.getTrip(tripId).then(setTrip).catch(() => undefined);
    }
  }, [tripId]);

  const fare = trip?.total_fare || trip?.journey?.estimated_total_cost || 55;
  const co2 = trip?.co2_saved_kg || 1.8;

  const submitRating = () => {
    if (!rating) {
      toast("Pick a rating", "Tap a star to rate your co-commuter.", "info");
      return;
    }
    setSubmitted(true);
    toast("Thanks for the feedback", "Your rating helps keep the pool trustworthy.", "success");
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col pb-10">
      <Navbar title="Trip complete" showBack={false} />
      <Confetti active pieces={34} />

      <main className="flex flex-1 flex-col gap-4 px-4 pt-20">
        <section className="flex flex-col items-center gap-3 py-3 text-center animate-fadeInUp">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <span className="absolute inset-0 rounded-full bg-tertiary/15 blur-xl" />
            <span className="absolute inset-1 rounded-full border border-tertiary/25" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-tertiary text-ink shadow-glow-tertiary">
              <span className="material-symbols-outlined fill text-[30px]">celebration</span>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-on-surface">
              You arrived. Nicely done.
            </h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              {trip?.journey?.origin_station || "Ramwadi"} →{" "}
              {trip?.journey?.destination_zone || "EON IT Park Kharadi"}
            </p>
          </div>
        </section>

        {/* Receipt */}
        <section className="glass-card p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="eyebrow">Fuel share settled</p>
              <p className="mt-1 font-mono text-3xl font-extrabold tracking-tight text-tertiary">₹{fare}</p>
              <p className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-tertiary">
                <span className="material-symbols-outlined fill text-[13px]">check_circle</span>
                Paid via UPI · zero surge
              </p>
            </div>
            <span className="material-symbols-outlined text-[28px] text-secondary">payments</span>
          </div>
          <div className="mt-3 h-px border-t border-dashed border-white/10" />
          <div className="mt-3 flex items-center justify-between text-[11px]">
            <span className="text-on-surface-variant">Trip ID</span>
            <span className="font-mono text-on-surface">{(tripId || "demo").slice(0, 12)}</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px]">
            <span className="text-on-surface-variant">Driver</span>
            <span className="font-bold text-on-surface">
              {trip?.journey?.driver?.full_name || "Rahul Deshmukh"}
            </span>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-2.5">
          <StatTile label="CO₂ prevented" value={`${co2} kg`} hint="Shared feeder ride" icon="eco" tone="tertiary" />
          <StatTile label="Green points" value="+45" hint="Added to your wallet" icon="energy_savings_leaf" tone="secondary" />
        </section>

        {/* Rating */}
        <section className="glass-panel p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Rate your co-commuter</p>
              <p className="text-[11px] text-on-surface-variant">
                {trip?.journey?.driver?.full_name || "Your driver"}
              </p>
            </div>
            <span className="material-symbols-outlined text-[22px] text-amber-400">reviews</span>
          </div>

          <div className="mt-3 flex justify-center gap-1.5">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHover(star)}
                onMouseLeave={() => setHover(0)}
                aria-label={`Rate ${star} star`}
                className="p-1 transition-transform hover:scale-110 active:scale-95"
              >
                <span
                  className={`material-symbols-outlined text-[30px] transition-colors ${
                    star <= (hover || rating) ? "text-amber-400" : "text-white/15"
                  }`}
                  style={{ fontVariationSettings: star <= (hover || rating) ? "'FILL' 1" : "'FILL' 0" }}
                >
                  star
                </span>
              </button>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {TAGS.map((tag) => {
              const active = tags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() =>
                    setTags((prev) => (active ? prev.filter((item) => item !== tag) : [...prev, tag]))
                  }
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-bold transition-all ${
                    active
                      ? "border-tertiary/40 bg-tertiary/10 text-tertiary"
                      : "border-white/10 bg-white/[0.03] text-on-surface-variant"
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>

          <button onClick={submitRating} disabled={submitted} className="btn-ghost mt-3 w-full py-2.5 text-[11px]">
            {submitted ? (
              <>
                <span className="material-symbols-outlined fill text-[16px] text-tertiary">check_circle</span>
                Feedback submitted
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">send</span>
                Submit feedback
              </>
            )}
          </button>
        </section>

        <div className="grid grid-cols-2 gap-2.5">
          <button onClick={() => navigate("/activity")} className="btn-ghost py-3">
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            Activity
          </button>
          <button onClick={() => navigate("/home")} className="btn-primary py-3">
            <span className="material-symbols-outlined text-[18px]">home</span>
            Home
          </button>
        </div>
      </main>
    </div>
  );
};

export default RideCompletedPage;
