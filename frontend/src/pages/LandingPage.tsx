import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/home");
    } else {
      navigate("/signup");
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">

      {/* Top Bar */}
      <header className="flex items-center justify-between px-5 pt-12 pb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary text-[26px]">directions_subway</span>
          <span className="font-bold text-base text-on-surface tracking-tight">StationPool</span>
        </div>
        <button
          onClick={() => navigate("/signup")}
          className="text-xs font-semibold text-secondary px-4 py-2 rounded-full border border-secondary/30 hover:bg-secondary/10 transition-all"
        >
          Sign In
        </button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-8 pb-24">

        {/* Icon */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-secondary-container flex items-center justify-center shadow-xl shadow-secondary/20">
            <span className="material-symbols-outlined text-on-secondary text-[42px]">directions_car</span>
          </div>
          {/* Live pulse dot */}
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-tertiary border-2 border-surface flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-ping absolute"></span>
          </span>
        </div>

        {/* Headline */}
        <div className="space-y-3 max-w-xs">
          <h1 className="text-3xl font-extrabold text-on-surface leading-tight tracking-tight">
            Metro to Office,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-secondary to-tertiary">
              without the hassle.
            </span>
          </h1>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Share rides from Pune Metro stations to your tech park. Fixed fares, verified co-commuters, zero surge.
          </p>
        </div>

        {/* How it works — 3 simple steps */}
        <div className="w-full max-w-sm flex items-center justify-between gap-2">
          {[
            { icon: "phone_iphone", label: "Sign Up" },
            { icon: "search", label: "Find Pool" },
            { icon: "emoji_transportation", label: "Ride" },
          ].map((step, i, arr) => (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center gap-1.5">
                <div className="w-11 h-11 rounded-2xl bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-[22px]">{step.icon}</span>
                </div>
                <span className="text-[11px] font-semibold text-on-surface-variant">{step.label}</span>
              </div>
              {i < arr.length - 1 && (
                <div className="flex-1 h-px bg-gradient-to-r from-secondary/30 to-tertiary/30 mt-[-10px]" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Primary CTA */}
        <div className="w-full max-w-sm flex flex-col gap-3">
          <button
            id="get-started-btn"
            onClick={handleGetStarted}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-secondary to-tertiary text-on-tertiary font-bold text-base shadow-xl shadow-tertiary/20 active:scale-95 hover:brightness-105 transition-all"
          >
            Get Started →
          </button>
          <p className="text-[11px] text-on-surface-variant">
            Free to join · No surge pricing · Pune Metro verified
          </p>
        </div>
      </main>

      {/* Bottom trust strip */}
      <footer className="pb-10 px-6 flex items-center justify-center gap-6 text-[11px] text-on-surface-variant">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px] text-secondary">verified_user</span>
          <span>ID Verified</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px] text-tertiary">eco</span>
          <span>Eco Commute</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[14px] text-secondary">lock</span>
          <span>Fixed Fares</span>
        </div>
      </footer>

    </div>
  );
};

export default LandingPage;
