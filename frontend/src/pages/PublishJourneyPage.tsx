import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../api/client";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";

export const PublishJourneyPage: React.FC = () => {
  const navigate = useNavigate();

  const [stations, setStations] = useState<string[]>([
    "Ramwadi",
    "Vanaz",
    "Civil Court",
    "Nal Stop",
    "Kalyani Nagar",
    "Shivaji Nagar",
    "PCMC",
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
      // 15 mins in future departure time
      const departure = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      const j = await apiService.publishJourney({
        origin_station: originStation,
        destination_zone: destinationZone,
        destination_label: destinationLabel,
        departure_time: departure,
        vehicle_category: vehicleCategory,
        total_seats: seats,
        estimated_total_cost: fuelShare,
      });

      setSuccess(true);
      setTimeout(() => {
        navigate("/home");
      }, 1200);
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Could not publish journey");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col pb-24">
      <Navbar title="Publish Feeder Route" subtitle="Daily Commute Pool" showBack={true} />

      <main className="flex-1 flex flex-col max-w-md mx-auto w-full pt-20 px-4 space-y-4">
        {/* Header Hero */}
        <div className="p-4 rounded-2xl bg-surface-container-high border border-surface-container-highest shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-secondary-container/40 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-[24px]">share_location</span>
            </div>
            <div>
              <h1 className="font-headline-sm text-sm font-bold text-on-surface">
                Offer Seats from Metro Station
              </h1>
              <p className="text-xs text-on-surface-variant">Recover up to 75% of your daily fuel costs</p>
            </div>
          </div>
          <span className="text-xs font-mono text-tertiary bg-surface-container-lowest px-2 py-0.5 rounded font-bold">
            Zero Surge
          </span>
        </div>

        {success && (
          <div className="p-4 rounded-2xl bg-tertiary-container text-tertiary font-bold text-sm flex items-center gap-2 animate-fadeIn shadow-lg">
            <span className="material-symbols-outlined fill">check_circle</span>
            <span>Journey published live on Pune Metro Feeder Radar!</span>
          </div>
        )}

        <form onSubmit={handlePublish} className="flex flex-col gap-4">
          {/* Station & Destination Selector */}
          <div className="p-4 rounded-2xl bg-surface-container border border-surface-container-high space-y-3.5 shadow-lg">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-on-surface-variant font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-secondary text-[16px]">directions_subway</span>
                Boarding Pune Metro Station Gate
              </label>
              <select
                value={originStation}
                onChange={(e) => setOriginStation(e.target.value)}
                className="h-11 px-3.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs font-semibold text-on-surface focus:outline-none focus:border-secondary"
              >
                {stations.map((s) => (
                  <option key={s} value={s} className="bg-surface-container text-on-surface">
                    {s} Metro Station (Gate 2 Bay)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-on-surface-variant font-semibold flex items-center gap-1.5">
                <span className="material-symbols-outlined text-tertiary text-[16px]">pin_drop</span>
                Destination Tech Park / Work Hub
              </label>
              <select
                value={destinationZone}
                onChange={(e) => setDestinationZone(e.target.value)}
                className="h-11 px-3.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs font-semibold text-on-surface focus:outline-none focus:border-secondary"
              >
                {destinations.map((d) => (
                  <option key={d} value={d} className="bg-surface-container text-on-surface">
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-on-surface-variant font-semibold">
                Drop Point Landmark
              </label>
              <input
                type="text"
                value={destinationLabel}
                onChange={(e) => setDestinationLabel(e.target.value)}
                placeholder="e.g. Tower 3 Main Lobby / Phase 1 Circle"
                className="h-11 px-3.5 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none"
              />
            </div>
          </div>

          {/* Seat Capacity & Fuel Share Config */}
          <div className="p-4 rounded-2xl bg-surface-container border border-surface-container-high space-y-3.5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-on-surface-variant font-semibold">
                Vacant Seats Available
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSeats((s) => Math.max(1, s - 1))}
                  className="w-8 h-8 rounded-lg bg-surface-container-low border border-surface-container-high flex items-center justify-center font-bold text-on-surface"
                >
                  -
                </button>
                <span className="font-mono text-base font-bold text-secondary">{seats}</span>
                <button
                  type="button"
                  onClick={() => setSeats((s) => Math.min(4, s + 1))}
                  className="w-8 h-8 rounded-lg bg-surface-container-low border border-surface-container-high flex items-center justify-center font-bold text-on-surface"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-xs text-on-surface-variant font-semibold">
                  Fuel Share Per Commuter
                </span>
                <p className="text-[10px] text-tertiary">Recommended Pune Metro Feeder Rate</p>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-on-surface-variant">₹</span>
                <input
                  type="number"
                  min="20"
                  max="150"
                  value={fuelShare}
                  onChange={(e) => setFuelShare(Number(e.target.value))}
                  className="w-16 h-9 px-2 text-center rounded-lg bg-surface-container-low border border-surface-container-high font-mono font-bold text-sm text-secondary focus:outline-none"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || success}
            className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-secondary to-tertiary text-on-tertiary font-headline-sm text-sm font-bold shadow-xl shadow-tertiary/25 active:scale-95 transition-all hover:brightness-105 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>Publishing to Metro Network...</span>
            ) : (
              <>
                <span className="material-symbols-outlined text-[18px]">publish</span>
                <span>Publish Feeder Commute Now</span>
              </>
            )}
          </button>
        </form>
      </main>

      <BottomNav />
    </div>
  );
};

export default PublishJourneyPage;
