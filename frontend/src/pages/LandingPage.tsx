import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { apiService } from "../api/client";
import { useToast } from "../components/Toast";
import AnimatedNumber from "../components/AnimatedNumber";

const STEPS = [
  {
    icon: "phone_iphone",
    title: "Verify once",
    copy: "Mobile OTP + ID check keeps every commuter real.",
    tint: "text-secondary",
  },
  {
    icon: "radar",
    title: "Match live",
    copy: "See verified feeder pools leaving your metro gate.",
    tint: "text-tertiary",
  },
  {
    icon: "directions_car",
    title: "Ride fixed-fare",
    copy: "Split costs, verify with a PIN, zero surge.",
    tint: "text-secondary",
  },
];

const LIVE_POOLS = [
  {
    station: "Ramwadi",
    destination: "EON IT Park Kharadi",
    driver: "Rahul D.",
    vehicle: "Honda City",
    fare: 55,
    seats: 2,
    eta: "12 min",
  },
  {
    station: "Vanaz",
    destination: "Hinjawadi Phase 1",
    driver: "Priya S.",
    vehicle: "Hyundai Creta",
    fare: 75,
    seats: 3,
    eta: "24 min",
  },
  {
    station: "Kalyani Nagar",
    destination: "Magarpatta City",
    driver: "Amit K.",
    vehicle: "Ather 450X",
    fare: 40,
    seats: 1,
    eta: "8 min",
  },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, login } = useAuth();
  const { toast } = useToast();
  const [activePool, setActivePool] = useState(0);
  const [demoLoading, setDemoLoading] = useState(false);
  const pool = LIVE_POOLS[activePool];

  const handleGetStarted = () => {
    navigate(isAuthenticated ? "/home" : "/signup");
  };

  const handleDemo = async () => {
    setDemoLoading(true);
    try {
      const res = await apiService.demoLogin("+919876543220");
      login(res.access_token, res.user);
      toast("Demo commuter ready", "Signed in as Tanvi Joshi with trip history.", "success");
      navigate("/home");
    } catch {
      toast("Demo unavailable", "Start the backend server on port 8000 and try again.", "error");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col overflow-hidden">
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-grid-fade bg-[length:100%_100%,44px_44px,44px_44px]" />
      <div className="pointer-events-none absolute -left-24 top-32 h-64 w-64 rounded-full bg-secondary/15 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-10 h-56 w-56 rounded-full bg-tertiary/10 blur-3xl" />

      {/* Header */}
      <header className="flex items-center justify-between px-5 pt-[max(1.5rem,env(safe-area-inset-top))]">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-gradient shadow-glow">
            <span className="material-symbols-outlined fill text-[22px] text-ink">
              directions_subway
            </span>
          </div>
          <div>
            <p className="text-[15px] font-extrabold leading-none tracking-tight text-on-surface">
              StationPool
            </p>
            <p className="mt-0.5 text-[10px] font-semibold text-tertiary">Pune Metro feeder</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/signup")}
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[11px] font-bold text-on-surface-variant backdrop-blur transition hover:border-secondary/40 hover:text-secondary"
        >
          {isAuthenticated ? "Dashboard" : "Sign in"}
        </button>
      </header>

      <main className="flex flex-1 flex-col gap-7 px-5 pb-10 pt-8">
        {/* Hero */}
        <section className="animate-fadeInUp">
          <span className="chip chip-active mb-3">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-tertiary" />
            Live across 2 metro lines
          </span>
          <h1 className="text-[2.15rem] font-extrabold leading-[1.08] tracking-tight text-on-surface">
            Your metro exit,
            <br />
            <span className="bg-brand-gradient bg-clip-text text-transparent">
              already has a ride.
            </span>
          </h1>
          <p className="mt-3 max-w-[330px] text-sm leading-relaxed text-on-surface-variant">
            Verified commuters sharing feeder rides from Pune Metro stations. Fixed fares,
            zero surge, and a PIN handshake at every pickup.
          </p>

          <div className="mt-5 flex gap-2.5">
            <button onClick={handleGetStarted} className="btn-primary flex-1">
              <span className="material-symbols-outlined text-[18px]">bolt</span>
              Find my pool
            </button>
            <button
              onClick={handleDemo}
              disabled={demoLoading}
              className="btn-ghost shrink-0 px-4"
              title="Sign in with a demo commuter account"
            >
              {demoLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
              ) : (
                <span className="material-symbols-outlined text-[18px] text-tertiary">rocket_launch</span>
              )}
              Demo
            </button>
          </div>
        </section>

        {/* Live radar card */}
        <section className="glass-card animate-fadeInUp p-4 [animation-delay:80ms]">
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tertiary opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-tertiary" />
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-tertiary">
                Live pool radar
              </span>
            </div>
            <span className="font-mono text-[10px] text-on-surface-variant">updated now</span>
          </div>

          <div className="mt-3 flex items-center gap-4">
            {/* Mini radar */}
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
              <span className="absolute h-16 w-16 rounded-full border border-secondary/15" />
              <span className="absolute h-12 w-12 rounded-full border border-secondary/20" />
              <span className="absolute h-8 w-8 rounded-full border border-secondary/25" />
              <span className="absolute h-10 w-10 animate-radar rounded-full border border-tertiary/50" />
              <span
                className="absolute h-9 w-9 animate-radar rounded-full border border-secondary/40"
                style={{ animationDelay: "1.2s" }}
              />
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-ink shadow-glow">
                <span className="material-symbols-outlined fill text-[18px]">directions_subway</span>
              </span>
              <span className="absolute left-2 top-5 h-1.5 w-1.5 animate-pulse rounded-full bg-tertiary" />
              <span className="absolute bottom-3 right-3 h-1.5 w-1.5 animate-pulse rounded-full bg-secondary" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-secondary">
                <span className="material-symbols-outlined text-[14px]">pin_drop</span>
                {pool.station} Metro → {pool.destination}
              </div>
              <div className="mt-2 flex items-end justify-between">
                <div>
                  <p className="text-sm font-extrabold text-on-surface">{pool.driver}</p>
                  <p className="text-[11px] text-on-surface-variant">
                    {pool.vehicle} · {pool.eta} away
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-lg font-extrabold text-tertiary">₹{pool.fare}</p>
                  <p className="text-[10px] text-on-surface-variant">{pool.seats} seats left</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 flex gap-1.5">
            {LIVE_POOLS.map((item, index) => (
              <button
                key={item.station}
                onClick={() => setActivePool(index)}
                aria-label={`Show pool from ${item.station}`}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  index === activePool ? "bg-brand-gradient" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </section>

        {/* Social proof */}
        <section className="grid grid-cols-3 gap-2.5">
          {[
            { value: 12400, label: "commuters", suffix: "+" },
            { value: 92, label: "match rate", suffix: "%" },
            { value: 68, label: "avg fare", prefix: "₹" },
          ].map((stat) => (
            <div key={stat.label} className="glass-panel px-2.5 py-3 text-center">
              <AnimatedNumber
                value={stat.value}
                prefix={stat.prefix}
                suffix={stat.suffix}
                className="font-mono text-[17px] font-extrabold text-on-surface"
              />
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70">
                {stat.label}
              </p>
            </div>
          ))}
        </section>

        {/* Steps */}
        <section className="animate-fadeInUp [animation-delay:160ms]">
          <div className="mb-2.5 flex items-center justify-between px-0.5">
            <span className="eyebrow">How it works</span>
            <span className="text-[10px] font-semibold text-on-surface-variant">
              Under 60 seconds
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {STEPS.map((step, index) => (
              <div
                key={step.title}
                className="group flex items-center gap-3 rounded-2xl border border-white/[0.07] bg-surface-container/60 p-3 backdrop-blur transition-all hover:border-secondary/30 hover:bg-surface-container-high/70"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  <span className={`material-symbols-outlined text-[20px] ${step.tint}`}>
                    {step.icon}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-extrabold text-on-surface">{step.title}</p>
                  <p className="text-[11px] leading-relaxed text-on-surface-variant">{step.copy}</p>
                </div>
                <span className="font-mono text-[11px] font-bold text-on-surface-variant/40">
                  0{index + 1}
                </span>
              </div>
            ))}
          </div>
        </section>

        <div className="rounded-2xl border border-tertiary/20 bg-tertiary/[0.06] p-3.5">
          <div className="flex items-center gap-2 text-[11px] font-bold text-tertiary">
            <span className="material-symbols-outlined text-[16px]">eco</span>
            12,400 feeder rides pooled this month
          </div>
          <p className="mt-1 text-[11px] leading-relaxed text-on-surface-variant">
            That is roughly 22 tonnes of CO₂ kept out of Pune traffic.
          </p>
        </div>
      </main>

      <footer className="flex items-center justify-center gap-5 border-t border-white/5 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 text-[10px] font-semibold text-on-surface-variant">
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px] text-secondary">verified_user</span>
          ID verified
        </span>
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px] text-tertiary">lock</span>
          Fixed fares
        </span>
        <span className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px] text-secondary">sos</span>
          SOS built-in
        </span>
      </footer>
    </div>
  );
};

export default LandingPage;
