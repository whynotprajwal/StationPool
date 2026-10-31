import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import SelectSheet from "../components/SelectSheet";
import Segmented from "../components/Segmented";
import AnimatedNumber from "../components/AnimatedNumber";
import DriverBadge from "../components/DriverBadge";
import type { Journey, Trip } from "../types";

interface LineInfo {
  name: string;
  color: string;
  terminals: string[];
  stations: string[];
}

export const MetroTicketPoolLandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [stations, setStations] = useState<string[]>(["Ramwadi", "Vanaz", "Civil Court", "Nal Stop"]);
  const [destinations, setDestinations] = useState<string[]>([
    "EON IT Park Kharadi",
    "Hinjawadi Phase 1",
    "Magarpatta City",
  ]);
  const [lines, setLines] = useState<LineInfo[]>([]);
  const [selectedStation, setSelectedStation] = useState("Ramwadi");
  const [selectedDestination, setSelectedDestination] = useState("EON IT Park Kharadi");
  const [vehicleCategory, setVehicleCategory] = useState<"four_wheeler" | "two_wheeler">(
    "four_wheeler"
  );
  const [preview, setPreview] = useState<Journey[]>([]);
  const [activeTrip, setActiveTrip] = useState<Trip | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ trips: 0, co2: 0, spend: 0 });

  const stationOptions = useMemo(
    () =>
      stations.map((station) => {
        const line = lines.find((item) => item.stations.includes(station));
        return {
          value: station,
          label: station,
          sub: line?.name || "Pune Metro station",
          icon: "directions_subway",
        };
      }),
    [stations, lines]
  );

  const destinationOptions = useMemo(
    () =>
      destinations.map((destination) => ({
        value: destination,
        label: destination,
        sub: "Feeder destination zone",
        icon: "apartment",
      })),
    [destinations]
  );

  const loadPreview = async (station: string, destination: string, showSpinner = false) => {
    if (showSpinner) setRefreshing(true);
    try {
      const results = await apiService.searchJourneys({
        origin_station: station,
        destination_zone: destination,
        vehicle_category: vehicleCategory,
      });
      const fallback = results.length ? results : await apiService.searchJourneys();
      setPreview(fallback.slice(0, 2));
    } catch {
      setPreview([]);
    } finally {
      setLoadingPreview(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    apiService
      .getStations()
      .then((data) => {
        if (data.stations?.length) setStations(data.stations);
        if (data.feeder_destinations?.length) setDestinations(data.feeder_destinations);
        if (data.lines) setLines(data.lines);
      })
      .catch(() => {
        toast("Backend offline", "Start the FastAPI server to load live metro data.", "error");
      });
  }, [toast]);

  useEffect(() => {
    loadPreview(selectedStation, selectedDestination);
  }, [selectedStation, selectedDestination, vehicleCategory]);

  useEffect(() => {
    apiService
      .getMyTrips()
      .then((trips) => {
        const live = trips.find((trip) => trip.status === "in_progress" || trip.status === "confirmed");
        setActiveTrip(live || null);
        const completed = trips.filter((trip) => trip.status === "completed");
        setStats({
          trips: completed.length,
          co2: completed.reduce((sum, trip) => sum + (trip.co2_saved_kg || 0), 0),
          spend: completed.reduce((sum, trip) => sum + (trip.total_fare || 0), 0),
        });
      })
      .catch(() => undefined);
  }, []);

  const handleStartMatching = () => {
    navigate("/match", {
      state: { station: selectedStation, destination: selectedDestination, vehicleCategory },
    });
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = user?.full_name?.split(" ")[0] || "Commuter";
  const selectedLine = lines.find((line) => line.stations.includes(selectedStation));

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col pb-28">
      <Navbar title="StationPool" subtitle="Commuter dashboard" />

      <main className="flex flex-1 flex-col gap-4 px-4 pt-20">
        {/* Greeting */}
        <section className="flex items-start justify-between gap-3 animate-fadeIn">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-on-surface-variant">
              {greeting}, <span className="text-on-surface">{firstName}</span>
            </p>
            <h1 className="mt-0.5 text-xl font-extrabold leading-tight tracking-tight text-on-surface">
              Where are you headed
              <br />
              after the metro?
            </h1>
          </div>
          <button
            onClick={() => navigate("/activity")}
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient font-mono text-sm font-extrabold text-ink shadow-glow"
            aria-label="Open safety centre"
          >
            {user?.full_name
              ? user.full_name
                  .split(" ")
                  .map((part) => part.charAt(0))
                  .join("")
                  .slice(0, 2)
              : "SP"}
            <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-surface bg-tertiary">
              <span className="material-symbols-outlined fill text-[9px] text-ink">shield</span>
            </span>
          </button>
        </section>

        {/* Quick stats */}
        <section className="grid grid-cols-3 gap-2">
          {[
            { label: "Rides", value: stats.trips, suffix: "" },
            { label: "CO₂ saved", value: Number(stats.co2.toFixed(1)), suffix: "kg" },
            { label: "Saved", value: stats.spend, prefix: "₹" },
          ].map((tile) => (
            <div key={tile.label} className="glass-panel px-2.5 py-2.5 text-center">
              <AnimatedNumber
                value={tile.value}
                prefix={tile.prefix}
                suffix={tile.suffix}
                decimals={tile.label === "CO₂ saved" ? 1 : 0}
                className="font-mono text-base font-extrabold text-on-surface"
              />
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/70">
                {tile.label}
              </p>
            </div>
          ))}
        </section>

        {/* Resume active ride */}
        {activeTrip && (
          <button
            onClick={() =>
              navigate(
                activeTrip.status === "in_progress"
                  ? `/ride/passenger/${activeTrip.id}`
                  : `/match/${activeTrip.journey_id}`
              )
            }
            className="glass-card flex items-center gap-3 p-3.5 text-left animate-fadeInUp"
          >
            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-tertiary/15 text-tertiary">
              <span className="absolute inset-0 animate-ping rounded-2xl border border-tertiary/30" />
              <span className="material-symbols-outlined fill text-[22px]">directions_car</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-tertiary">
                {activeTrip.status === "in_progress" ? "Ride in progress" : "Pool confirmed"}
              </p>
              <p className="truncate text-sm font-extrabold text-on-surface">
                {activeTrip.journey?.origin_station} → {activeTrip.journey?.destination_zone}
              </p>
              <p className="text-[10px] text-on-surface-variant">
                Tap to resume tracking · PIN {activeTrip.status === "confirmed" ? "ready" : "verified"}
              </p>
            </div>
            <span className="material-symbols-outlined text-[20px] text-tertiary">chevron_right</span>
          </button>
        )}

        {/* Search card */}
        <section className="glass-card p-4 animate-fadeInUp">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="eyebrow">Find a feeder ride</p>
              <p className="mt-0.5 text-[11px] text-on-surface-variant">
                Metro exit → your workplace
              </p>
            </div>
            {selectedLine && (
              <span
                className="chip"
                style={{ borderColor: `${selectedLine.color}55`, color: selectedLine.color }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: selectedLine.color }}
                />
                {selectedLine.name.split(" (")[0]}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2.5">
            <SelectSheet
              label="Metro exit station"
              value={selectedStation}
              options={stationOptions}
              onChange={setSelectedStation}
              sheetTitle="Pick your metro exit"
              searchPlaceholder="Search stations…"
              icon="directions_subway"
            />

            <div className="flex items-center gap-2 px-1">
              <span className="h-px flex-1 border-t border-dashed border-white/10" />
              <span className="material-symbols-outlined text-[14px] text-on-surface-variant/50">
                south
              </span>
              <span className="h-px flex-1 border-t border-dashed border-white/10" />
            </div>

            <SelectSheet
              label="Destination zone"
              value={selectedDestination}
              options={destinationOptions}
              onChange={setSelectedDestination}
              sheetTitle="Where are you headed?"
              searchPlaceholder="Search tech parks & hubs…"
              icon="apartment"
              accent="tertiary"
            />

            <Segmented
              value={vehicleCategory}
              onChange={setVehicleCategory}
              options={[
                { value: "four_wheeler", label: "Car pool", icon: "directions_car" },
                { value: "two_wheeler", label: "Bike pool", icon: "two_wheeler" },
              ]}
              size="sm"
            />

            <button onClick={handleStartMatching} className="btn-primary mt-0.5">
              <span className="material-symbols-outlined text-[18px]">radar</span>
              Find matching pools
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          </div>
        </section>

        {/* Live preview */}
        <section className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between px-0.5">
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tertiary opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-tertiary" />
              </span>
              <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-secondary">
                Leaving soon
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => loadPreview(selectedStation, selectedDestination, true)}
                disabled={refreshing}
                className="text-[10px] font-bold text-on-surface-variant transition hover:text-secondary"
              >
                {refreshing ? "Syncing…" : "Refresh"}
              </button>
              <button
                onClick={() => navigate("/match", { state: { station: selectedStation, destination: selectedDestination, vehicleCategory } })}
                className="text-[10px] font-bold text-secondary hover:underline"
              >
                See all
              </button>
            </div>
          </div>

          {loadingPreview ? (
            <div className="flex flex-col gap-2">
              {[0, 1].map((index) => (
                <div key={index} className="glass-panel flex items-center gap-3 p-3.5">
                  <div className="skeleton h-10 w-10 rounded-2xl" />
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="skeleton h-3 w-2/3" />
                    <div className="skeleton h-2.5 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : preview.length === 0 ? (
            <div className="glass-panel p-4 text-center">
              <p className="text-xs font-bold text-on-surface">No live pools at this station yet</p>
              <p className="mt-0.5 text-[11px] text-on-surface-variant">
                Publish your own ride or try another destination.
              </p>
            </div>
          ) : (
            preview.map((journey) => (
              <button
                key={journey.id}
                onClick={() =>
                  navigate("/match", {
                    state: { station: journey.origin_station, destination: journey.destination_zone, vehicleCategory },
                  })
                }
                className="glass-panel flex flex-col gap-2.5 p-3.5 text-left transition-all hover:border-secondary/30 tap-scale"
              >
                <DriverBadge driver={journey.driver} showCall={false} size="sm" />
                <div className="flex items-center justify-between rounded-xl bg-surface-container/60 px-3 py-2">
                  <div className="flex min-w-0 items-center gap-1.5 text-[11px] font-semibold text-on-surface">
                    <span className="material-symbols-outlined text-[14px] text-secondary">pin_drop</span>
                    <span className="truncate">{journey.origin_station}</span>
                    <span className="text-on-surface-variant/50">→</span>
                    <span className="truncate">{journey.destination_zone}</span>
                  </div>
                  <div className="ml-2 flex shrink-0 items-center gap-2">
                    <span className="font-mono text-sm font-extrabold text-tertiary">
                      ₹{journey.estimated_total_cost}
                    </span>
                    <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] font-bold text-on-surface-variant">
                      {journey.available_seats} left
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </section>

        {/* Quick actions */}
        <section className="grid grid-cols-2 gap-2.5">
          <button
            onClick={() => navigate("/driver/publish")}
            className="glass-panel flex flex-col items-start gap-2 p-3.5 text-left transition hover:border-tertiary/30"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-tertiary/10 text-tertiary">
              <span className="material-symbols-outlined text-[20px]">add_road</span>
            </span>
            <span className="text-xs font-extrabold text-on-surface">Offer a ride</span>
            <span className="text-[10px] text-on-surface-variant">Share empty seats, split fuel</span>
          </button>
          <button
            onClick={() => navigate("/driver/dashboard")}
            className="glass-panel flex flex-col items-start gap-2 p-3.5 text-left transition hover:border-secondary/30"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
              <span className="material-symbols-outlined text-[20px]">dashboard</span>
            </span>
            <span className="text-xs font-extrabold text-on-surface">Driver hub</span>
            <span className="text-[10px] text-on-surface-variant">Manage published journeys</span>
          </button>
        </section>
      </main>

      <BottomNav />
    </div>
  );
};

export default MetroTicketPoolLandingPage;
