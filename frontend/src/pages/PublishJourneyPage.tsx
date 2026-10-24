import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../api/client";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";

export const PublishJourneyPage: React.FC = () => {
  const navigate = useNavigate();

  const [stations, setStations] = useState<string[]>([
    "Ramwadi", "Vanaz", "Civil Court", "Nal Stop",
    "Kalyani Nagar", "Shivaji Nagar", "PCMC", "Swargate",
  ]);
  const [destinations, setDestinations] = useState<string[]>([
    "EON IT Park Kharadi", "Hinjawadi Phase 1", "Hinjawadi Phase 2",
    "Magarpatta City", "Viman Nagar Symbiosis", "Baner Balewadi High Street",
  ]);
  const [originStation, setOriginStation] = useState("Ramwadi");
  const [destinationZone, setDestinationZone] = useState("EON IT Park Kharadi");
  const [destinationLabel, setDestinationLabel] = useState("Gate 1 Main Hub");
  const [seats, setSeats] = useState(3);
  const [fuelShare, setFuelShare] = useState(55);
  const [vehicleCategory, setVehicleCategory] = useState<"four_wheeler" | "two_wheeler">("four_wheeler");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    apiService.getStations().then((data) => {
      if (data.stations) setStations(data.stations);
      if (data.feeder_destinations) setDestinations(data.feeder_destinations);
    }).catch(console.error);
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const departure = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      await apiService.publishJourney({
        origin_station: originStation,
        destination_zone: destinationZone,
        destination_label: destinationLabel,
        departure_time: departure,
        vehicle_category: vehicleCategory,
        total_seats: seats,
        estimated_total_cost: fuelShare,
      });
      setSuccess(true);
      setTimeout(() => navigate("/home"), 1200);
    } catch (err: any) {
      alert(err.response?.data?.detail || "Could not publish journey");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col pb-24">
      <Navbar title="Offer a Ride" showBack={true} />

      <main className="flex-1 flex flex-col max-w-md mx-auto w-full pt-20 px-4 gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-on-surface">Publish a Feeder Seat</h1>
          <p className="text-sm text-on-surface-variant mt-1">Share your commute and split fuel costs.</p>
        </div>

        {success && (
          <div className="p-3.5 rounded-xl bg-tertiary-container text-tertiary font-bold text-sm flex items-center gap-2">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            Journey published!
          </div>
        )}

        <form onSubmit={handlePublish} className="flex flex-col gap-4">
          {/* Route */}
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-surface-container border border-surface-container-high">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-on-surface-variant font-semibold">Metro Exit Station</label>
              <select value={originStation} onChange={(e) => setOriginStation(e.target.value)}
                className="h-11 px-3.5 rounded-xl bg-surface-container-low border border-surface-container-high text-sm font-semibold text-on-surface focus:outline-none focus:border-secondary">
                {stations.map((s) => <option key={s} value={s} className="bg-surface-container">{s}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-on-surface-variant font-semibold">Destination</label>
              <select value={destinationZone} onChange={(e) => setDestinationZone(e.target.value)}
                className="h-11 px-3.5 rounded-xl bg-surface-container-low border border-surface-container-high text-sm font-semibold text-on-surface focus:outline-none focus:border-secondary">
                {destinations.map((d) => <option key={d} value={d} className="bg-surface-container">{d}</option>)}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-on-surface-variant font-semibold">Drop Point</label>
              <input type="text" value={destinationLabel} onChange={(e) => setDestinationLabel(e.target.value)}
                placeholder="e.g. Tower 3 Lobby"
                className="h-11 px-3.5 rounded-xl bg-surface-container-low border border-surface-container-high text-sm text-on-surface focus:outline-none focus:border-secondary" />
            </div>
          </div>

          {/* Seats & Fare */}
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-surface-container border border-surface-container-high">
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface-variant font-semibold">Seats available</span>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setSeats((s) => Math.max(1, s - 1))}
                  className="w-8 h-8 rounded-lg bg-surface-container-low border border-surface-container-high font-bold text-on-surface flex items-center justify-center">−</button>
                <span className="font-mono font-bold text-secondary text-base w-4 text-center">{seats}</span>
                <button type="button" onClick={() => setSeats((s) => Math.min(4, s + 1))}
                  className="w-8 h-8 rounded-lg bg-surface-container-low border border-surface-container-high font-bold text-on-surface flex items-center justify-center">+</button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface-variant font-semibold">Fuel share per rider (₹)</span>
              <input type="number" min="20" max="150" value={fuelShare} onChange={(e) => setFuelShare(Number(e.target.value))}
                className="w-16 h-9 px-2 text-center rounded-lg bg-surface-container-low border border-surface-container-high font-mono font-bold text-sm text-secondary focus:outline-none" />
            </div>

            {/* Vehicle type */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container-lowest rounded-xl">
              {([
                { val: "four_wheeler", icon: "directions_car", label: "Car" },
                { val: "two_wheeler", icon: "two_wheeler", label: "Bike" },
              ] as const).map(({ val, icon, label }) => (
                <button key={val} type="button" onClick={() => setVehicleCategory(val)}
                  className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    vehicleCategory === val ? "bg-surface-container-high text-secondary ring-1 ring-secondary/40" : "text-on-surface-variant"
                  }`}>
                  <span className="material-symbols-outlined text-[16px]">{icon}</span>{label}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" disabled={isLoading || success}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-secondary to-tertiary text-on-tertiary font-bold text-sm shadow-lg active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">publish</span>
            {isLoading ? "Publishing..." : "Publish Ride"}
          </button>
        </form>
      </main>

      <BottomNav />
    </div>
  );
};

export default PublishJourneyPage;
