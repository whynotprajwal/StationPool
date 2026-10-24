import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleFindPool = () => {
    if (isAuthenticated) {
      navigate("/home");
    } else {
      navigate("/signup", { state: { from: { pathname: "/home" } } });
    }
  };

  const handleOfferRide = () => {
    if (isAuthenticated) {
      navigate("/driver/publish");
    } else {
      navigate("/signup", { state: { from: { pathname: "/driver/publish" } } });
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col pb-16">
      <Navbar title="StationPool" subtitle="Pune Metro Commuter Feeder" />

      <main className="flex-1 flex flex-col max-w-xl mx-auto w-full pt-20 px-4 space-y-6">
        {/* Dynamic Metro Radar Live Bar */}
        <div className="w-full pt-1">
          <div className="w-full p-2.5 bg-surface-container-high rounded-full flex items-center justify-between shadow-md">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-tertiary"></span>
              </span>
              <span className="font-label-ui text-xs text-on-surface truncate font-semibold">
                Aqua & Purple Lines Sync Active
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-surface-container px-2.5 py-0.5 rounded-full shrink-0">
              <span className="material-symbols-outlined text-secondary text-[14px]">bolt</span>
              <span className="font-label-numeric-sm text-xs text-secondary font-mono">
                38 pools leaving in 10m
              </span>
            </div>
          </div>
        </div>

        {/* Hero Storytelling Section */}
        <section className="flex flex-col space-y-3.5">
          {/* Network Badge */}
          <div className="inline-flex items-center gap-2 self-start px-3 py-1 rounded-full bg-secondary-container/30 text-secondary text-xs">
            <span className="material-symbols-outlined text-[16px]">swap_calls</span>
            <span className="font-label-ui uppercase tracking-wider font-semibold">
              Pune Metro • First/Last Mile Feeder
            </span>
          </div>

          {/* Main Headline & Narrative */}
          <div className="space-y-2">
            <h1 className="font-display-lg text-3xl font-extrabold text-on-surface tracking-tight leading-tight">
              Your Metro ride ends.
              <br />
              <span className="text-secondary bg-clip-text text-transparent bg-gradient-to-r from-secondary to-tertiary">
                Your journey doesn't.
              </span>
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant leading-relaxed">
              Connect with verified daily commuters traveling from your Pune Metro station to your tech park or office cluster. Peer-to-peer fuel cost sharing with zero surge.
            </p>
          </div>

          {/* Dual CTAs — strictly gate to Signup/Signin if not authenticated */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleFindPool}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-secondary to-tertiary text-on-tertiary font-headline-sm text-sm font-bold shadow-lg shadow-tertiary/20 active:scale-95 transition-all hover:brightness-105"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              <span>Find a Pool</span>
            </button>
            <button
              onClick={handleOfferRide}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-surface-container-high border border-outline-variant/30 text-on-surface font-headline-sm text-sm font-semibold shadow-md active:scale-95 transition-all hover:bg-surface-bright"
            >
              <span className="material-symbols-outlined text-secondary text-[18px]">directions_car</span>
              <span>Offer a Ride</span>
            </button>
          </div>
        </section>

        {/* Station Feeder Visual Interactive Preview Card */}
        <div className="w-full bg-surface-container-low border border-surface-container-high/60 rounded-2xl p-4 shadow-xl flex flex-col space-y-3.5 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/15 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-tertiary text-[18px]">share_location</span>
              <span className="font-label-ui text-xs uppercase tracking-wider text-tertiary font-bold">
                Live Feeder Corridor
              </span>
            </div>
            <span className="px-2 py-0.5 rounded bg-surface-container font-label-numeric-sm text-xs text-on-surface-variant font-mono">
              Gate 3 Bay
            </span>
          </div>

          {/* Route Visual Snippet */}
          <div className="bg-surface-container rounded-xl p-3.5 flex flex-col space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary-container"></span>
                <span className="font-headline-sm text-sm font-bold text-on-surface">Ramwadi Metro Station</span>
              </div>
              <span className="font-label-numeric-sm text-xs text-tertiary font-mono">Departs 09:15 AM</span>
            </div>

            <div className="flex items-center gap-3 px-1">
              <div className="w-0.5 h-6 bg-gradient-to-b from-secondary-container to-tertiary ml-1"></div>
              <span className="text-xs text-on-surface-variant">Feeder Carpool (Non-stop via Nagar Road)</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-surface-container-high/50">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
                <span className="font-headline-sm text-sm font-bold text-on-surface">EON IT Park Kharadi</span>
              </div>
              <span className="font-label-numeric-md text-sm font-bold text-secondary font-mono">₹55 / seat</span>
            </div>
          </div>

          {/* Quick Action */}
          <button
            onClick={handleFindPool}
            className="w-full py-2.5 rounded-xl bg-surface-container-highest text-secondary text-xs font-semibold flex items-center justify-center gap-2 hover:bg-surface-bright transition-all"
          >
            <span>Unlock Live Pune Metro Feeder Pools</span>
            <span className="material-symbols-outlined text-[16px]">lock_open</span>
          </button>
        </div>

        {/* Trust & Safety Bento Cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-surface-container-high/60 border border-surface-container-high rounded-xl p-3.5 flex flex-col gap-1.5">
            <span className="material-symbols-outlined text-secondary text-[24px]">verified_user</span>
            <span className="font-headline-sm text-sm font-bold text-on-surface">Govt ID & DL Verified</span>
            <span className="text-xs text-on-surface-variant">
              Every driver passes DigiLocker ID & driving license verification.
            </span>
          </div>

          <div className="bg-surface-container-high/60 border border-surface-container-high rounded-xl p-3.5 flex flex-col gap-1.5">
            <span className="material-symbols-outlined text-tertiary text-[24px]">pin</span>
            <span className="font-headline-sm text-sm font-bold text-on-surface">4-Digit Dynamic PIN</span>
            <span className="text-xs text-on-surface-variant">
              Cryptographically hashed boarding PIN verified at the metro gate.
            </span>
          </div>
        </div>

        {/* Step-by-Step Flow Instruction Card */}
        <div className="bg-gradient-to-r from-surface-container to-surface-container-high border border-secondary/20 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-secondary font-bold text-sm">
            <span className="material-symbols-outlined text-[20px]">how_to_reg</span>
            <span>How StationPool Works</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-surface-container-low flex flex-col items-center gap-1">
              <span className="w-6 h-6 rounded-full bg-secondary text-surface-container-lowest font-bold text-xs flex items-center justify-center font-mono">1</span>
              <span className="font-bold text-on-surface">Sign Up</span>
              <span className="text-[10px] text-on-surface-variant">Phone & Name</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-container-low flex flex-col items-center gap-1">
              <span className="w-6 h-6 rounded-full bg-secondary text-surface-container-lowest font-bold text-xs flex items-center justify-center font-mono">2</span>
              <span className="font-bold text-on-surface">OTP Verify</span>
              <span className="text-[10px] text-on-surface-variant">SMS / WhatsApp</span>
            </div>
            <div className="p-2.5 rounded-xl bg-surface-container-low flex flex-col items-center gap-1">
              <span className="w-6 h-6 rounded-full bg-tertiary text-surface-container-lowest font-bold text-xs flex items-center justify-center font-mono">3</span>
              <span className="font-bold text-on-surface">Dashboard</span>
              <span className="text-[10px] text-on-surface-variant">Book or Drive</span>
            </div>
          </div>
          <button
            onClick={() => navigate("/signup")}
            className="w-full py-3 rounded-xl bg-secondary text-surface-container-lowest font-bold text-xs shadow hover:brightness-110 active:scale-95 transition-all mt-1"
          >
            Start with Mobile Verification Now
          </button>
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
