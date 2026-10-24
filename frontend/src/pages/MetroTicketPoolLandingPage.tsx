import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";

export const MetroTicketPoolLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [stations, setStations] = useState<string[]>([
    "Ramwadi",
    "Vanaz",
    "Civil Court",
    "Nal Stop",
    "Pune Railway Station",
    "Kalyani Nagar",
    "Shivaji Nagar",
    "Swargate",
  ]);
  const [destinations, setDestinations] = useState<string[]>([
    "EON IT Park Kharadi",
    "Hinjawadi Phase 1",
    "Hinjawadi Phase 2",
    "Magarpatta City",
    "Viman Nagar Symbiosis",
    "Baner Balewadi High Street",
  ]);

  const [selectedStation, setSelectedStation] = useState("Ramwadi");
  const [selectedDestination, setSelectedDestination] = useState("EON IT Park Kharadi");
  const [vehicleCategory, setVehicleCategory] = useState<"four_wheeler" | "two_wheeler">("four_wheeler");

  useEffect(() => {
    apiService.getStations().then((data) => {
      if (data.stations) setStations(data.stations);
      if (data.feeder_destinations) setDestinations(data.feeder_destinations);
    }).catch(console.error);
  }, []);

  const handleStartMatching = () => {
    navigate("/match", {
      state: {
        station: selectedStation,
        destination: selectedDestination,
        vehicleCategory: vehicleCategory,
      },
    });
  };

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col pb-24">
      <Navbar title="Commuter Dashboard" subtitle="Pune Metro Feeder Club" />

      <main className="flex-1 flex flex-col max-w-xl mx-auto w-full pt-20 px-4 space-y-4">
        {/* User Identity Banner (All info entered during sign up / sign in) */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-surface-container-high to-surface-container border border-secondary/30 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-secondary-container to-secondary text-surface-container-lowest flex items-center justify-center font-bold text-lg font-mono shrink-0 shadow-md">
              {user?.full_name ? user.full_name[0].toUpperCase() : "U"}
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-headline-sm text-sm font-bold text-on-surface truncate">
                  {user?.full_name || "Verified Commuter"}
                </span>
                <span className="material-symbols-outlined text-secondary text-[16px] shrink-0 fill">
                  verified
                </span>
              </div>
              <span className="text-xs text-on-surface-variant font-mono">
                {user?.mobile_number || "+91 ••••• •••••"}
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-secondary-container/40 text-secondary">
                  {user?.role === "driver" ? "Vehicle Owner" : user?.role === "both" ? "Rider & Owner" : "Metro Rider"}
                </span>
                <span className="text-[10px] text-tertiary font-semibold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                  Transit Active
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="px-2.5 py-1.5 rounded-xl bg-surface-container-highest/80 hover:bg-error-container hover:text-error text-on-surface-variant text-xs font-semibold transition-all flex items-center gap-1 shrink-0"
            title="Sign out of StationPool"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>

        {/* Journey Sync Notification Pill */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-high text-on-surface shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-full bg-tertiary-container flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-tertiary text-[20px] fill">sync</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-headline-sm text-sm font-bold tracking-tight text-on-surface truncate">
                Your Metro journey is active
              </span>
              <span className="font-body-sm text-xs text-tertiary flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping"></span>
                Ready to sync feeder pool
              </span>
            </div>
          </div>
          <span className="font-label-numeric-sm text-xs bg-surface-container-highest px-2 py-0.5 rounded text-secondary shrink-0 font-mono">
            Aqua Line #108
          </span>
        </div>

        {/* Dual Compartment Metro Ticket Punch Card */}
        <div className="relative flex flex-col rounded-2xl bg-surface-container shadow-2xl overflow-hidden border border-surface-container-high">
          {/* Upper Ticket Half: Train Details */}
          <div className="p-4 flex flex-col gap-3 bg-surface-container-high text-on-surface border-b border-dashed border-outline-variant/60 relative">
            <div className="absolute -bottom-3 -left-3 w-6 h-6 rounded-full bg-surface"></div>
            <div className="absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-surface"></div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary-fixed-dim"></span>
                <span className="font-label-ui text-xs font-bold uppercase tracking-wider text-secondary">
                  Pune Metro Aqua Line
                </span>
              </div>
              <span className="font-label-numeric-md text-xs bg-surface-container-lowest px-2.5 py-0.5 rounded text-on-surface-variant font-mono">
                Train #AQ-108
              </span>
            </div>

            {/* Route Visualization */}
            <div className="flex items-center justify-between pt-1">
              {/* Origin */}
              <div className="flex flex-col max-w-[35%]">
                <span className="text-[11px] text-on-surface-variant">Boarded Station</span>
                <span className="font-headline-sm text-sm font-bold text-on-surface truncate">Vanaz</span>
                <span className="font-label-numeric-sm text-xs text-primary font-mono">08:44 AM</span>
              </div>

              {/* Train Movement Graphic */}
              <div className="flex-1 flex flex-col items-center px-2">
                <div className="relative w-full flex items-center justify-center">
                  <div className="w-full h-0.5 bg-surface-bright"></div>
                  <div className="absolute h-0.5 w-3/4 left-0 bg-tertiary rounded-full"></div>
                  <div className="absolute -top-3 w-6 h-6 rounded-full bg-primary-container flex items-center justify-center shadow-md">
                    <span className="material-symbols-outlined text-tertiary text-[16px] animate-pulse">
                      directions_subway
                    </span>
                  </div>
                </div>
                <span className="font-label-numeric-sm text-[11px] text-tertiary mt-2 font-mono">
                  Arriving in 8 min
                </span>
              </div>

              {/* Destination */}
              <div className="flex flex-col items-end max-w-[35%] text-right">
                <span className="text-[11px] text-on-surface-variant">Exit Station</span>
                <span className="font-headline-sm text-sm font-bold text-on-surface truncate">
                  {selectedStation}
                </span>
                <span className="font-label-numeric-sm text-xs text-tertiary font-bold font-mono">
                  09:22 AM ETA
                </span>
              </div>
            </div>
          </div>

          {/* Lower Ticket Half: Feeder Pool Configurator */}
          <div className="p-4 flex flex-col gap-4 bg-surface-container">
            <div className="flex items-center justify-between">
              <span className="font-label-ui text-xs uppercase tracking-wider text-secondary font-bold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">local_taxi</span>
                Sync Feeder Pool
              </span>
              <span className="text-xs bg-tertiary-container/60 text-tertiary px-2 py-0.5 rounded font-mono font-bold">
                Zero Surge Guarantee
              </span>
            </div>

            {/* Metro Station Selector */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-on-surface-variant font-semibold">
                Exit Station Pickup Point
              </label>
              <select
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-sm font-semibold focus:outline-none focus:border-secondary"
              >
                {stations.map((s) => (
                  <option key={s} value={s} className="bg-surface-container text-on-surface">
                    {s} Metro Station
                  </option>
                ))}
              </select>
            </div>

            {/* Feeder Destination Hub */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-on-surface-variant font-semibold">
                Onward Tech Park / Hub Destination
              </label>
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-sm font-semibold focus:outline-none focus:border-secondary"
              >
                {destinations.map((d) => (
                  <option key={d} value={d} className="bg-surface-container text-on-surface">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Vehicle Mode Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container-lowest rounded-xl">
              <button
                type="button"
                onClick={() => setVehicleCategory("four_wheeler")}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  vehicleCategory === "four_wheeler"
                    ? "bg-surface-container-high text-secondary ring-1 ring-secondary/50"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">directions_car</span>
                <span>Carpool (Car)</span>
              </button>
              <button
                type="button"
                onClick={() => setVehicleCategory("two_wheeler")}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  vehicleCategory === "two_wheeler"
                    ? "bg-surface-container-high text-secondary ring-1 ring-secondary/50"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">two_wheeler</span>
                <span>Bike Pool (Quick)</span>
              </button>
            </div>

            {/* Match CTA Button */}
            <button
              onClick={handleStartMatching}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-secondary to-tertiary text-on-tertiary font-headline-sm text-sm font-bold shadow-xl shadow-tertiary/20 active:scale-95 transition-all hover:brightness-105 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">radar</span>
              <span>Find Matching Feeder Pool</span>
            </button>
          </div>
        </div>

        {/* Quick Driver Banner */}
        <div className="p-4 rounded-2xl bg-surface-container-high/60 border border-surface-container-high flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-secondary/15 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[22px]">commute</span>
            </div>
            <div>
              <p className="font-bold text-sm text-on-surface">Driving from {selectedStation}?</p>
              <p className="text-xs text-on-surface-variant">Publish vacant seats and share commute costs</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/driver/publish")}
            className="px-3.5 py-2 rounded-xl bg-secondary text-surface-container-lowest font-bold text-xs shadow hover:brightness-110 active:scale-95 transition-all"
          >
            Publish
          </button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

export default MetroTicketPoolLandingPage;
