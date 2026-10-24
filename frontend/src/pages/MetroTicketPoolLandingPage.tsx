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
    "Ramwadi", "Vanaz", "Civil Court", "Nal Stop",
    "Pune Railway Station", "Kalyani Nagar", "Shivaji Nagar", "Swargate",
  ]);
  const [destinations, setDestinations] = useState<string[]>([
    "EON IT Park Kharadi", "Hinjawadi Phase 1", "Hinjawadi Phase 2",
    "Magarpatta City", "Viman Nagar Symbiosis", "Baner Balewadi High Street",
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
    navigate("/match", { state: { station: selectedStation, destination: selectedDestination, vehicleCategory } });
  };

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col pb-24">
      <Navbar title="StationPool" subtitle="Commuter Dashboard" />

      <main className="flex-1 flex flex-col max-w-xl mx-auto w-full pt-20 px-4 gap-4">

        {/* User card */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-high border border-surface-container-highest">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-secondary-container text-on-secondary flex items-center justify-center font-bold text-base shrink-0">
              {user?.full_name ? user.full_name[0].toUpperCase() : "U"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <span className="font-bold text-sm text-on-surface truncate">{user?.full_name || "Commuter"}</span>
                <span className="material-symbols-outlined text-secondary text-[14px]">verified</span>
              </div>
              <span className="text-xs text-on-surface-variant font-mono">{user?.mobile_number || ""}</span>
            </div>
          </div>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="p-2 rounded-lg hover:bg-error-container hover:text-error text-on-surface-variant transition-all"
            title="Sign out"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>

        {/* Booking form */}
        <div className="flex flex-col rounded-2xl bg-surface-container border border-surface-container-high overflow-hidden">
          <div className="px-4 pt-4 pb-3 border-b border-surface-container-high">
            <h2 className="font-bold text-sm text-on-surface">Find a Feeder Ride</h2>
            <p className="text-xs text-on-surface-variant mt-0.5">Metro exit → your destination</p>
          </div>

          <div className="p-4 flex flex-col gap-4">
            {/* Station */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-on-surface-variant font-semibold">Metro Exit Station</label>
              <select
                value={selectedStation}
                onChange={(e) => setSelectedStation(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-sm font-semibold focus:outline-none focus:border-secondary"
              >
                {stations.map((s) => (
                  <option key={s} value={s} className="bg-surface-container">{s}</option>
                ))}
              </select>
            </div>

            {/* Destination */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-on-surface-variant font-semibold">Destination</label>
              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full h-11 px-3.5 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-sm font-semibold focus:outline-none focus:border-secondary"
              >
                {destinations.map((d) => (
                  <option key={d} value={d} className="bg-surface-container">{d}</option>
                ))}
              </select>
            </div>

            {/* Vehicle toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container-lowest rounded-xl">
              {([
                { val: "four_wheeler", icon: "directions_car", label: "Car Pool" },
                { val: "two_wheeler", icon: "two_wheeler", label: "Bike Pool" },
              ] as const).map(({ val, icon, label }) => (
                <button
                  key={val} type="button"
                  onClick={() => setVehicleCategory(val)}
                  className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    vehicleCategory === val
                      ? "bg-surface-container-high text-secondary ring-1 ring-secondary/40"
                      : "text-on-surface-variant"
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{icon}</span>
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={handleStartMatching}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-secondary to-tertiary text-on-tertiary font-bold text-sm shadow-lg active:scale-95 transition-all hover:brightness-105 flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">search</span>
              Find Matching Pool
            </button>
          </div>
        </div>

        {/* Driver shortcut */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-high border border-surface-container-highest">
          <div>
            <p className="font-bold text-sm text-on-surface">Driving from {selectedStation}?</p>
            <p className="text-xs text-on-surface-variant">Share vacant seats and split fuel costs</p>
          </div>
          <button
            onClick={() => navigate("/driver/publish")}
            className="px-3.5 py-2 rounded-xl bg-secondary text-surface-container-lowest font-bold text-xs active:scale-95 transition-all"
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
