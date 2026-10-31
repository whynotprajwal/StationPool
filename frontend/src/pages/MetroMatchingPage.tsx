import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiService } from "../api/client";
import { useToast } from "../components/Toast";
import type { Journey } from "../types";
import Navbar from "../components/Navbar";
import TransitMap from "../components/TransitMap";
import SelectSheet from "../components/SelectSheet";
import Segmented from "../components/Segmented";
import DriverBadge from "../components/DriverBadge";
import EmptyState from "../components/EmptyState";

type SortMode = "best" | "cheapest" | "earliest";

interface MatchState {
  station?: string;
  destination?: string;
  vehicleCategory?: "four_wheeler" | "two_wheeler";
}

export const MetroMatchingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const queryState = location.state as MatchState | null;
  const [station, setStation] = useState(queryState?.station || "Ramwadi");
  const [destination, setDestination] = useState(
    queryState?.destination || "EON IT Park Kharadi"
  );
  const [vehicleCategory, setVehicleCategory] = useState<"four_wheeler" | "two_wheeler">(
    queryState?.vehicleCategory || "four_wheeler"
  );
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [stations, setStations] = useState<string[]>([]);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [isSearching, setIsSearching] = useState(true);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("best");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    apiService
      .getStations()
      .then((data) => {
        setStations(data.stations || []);
        setDestinations(data.feeder_destinations || []);
      })
      .catch(() => undefined);
  }, []);

  const fetchMatches = async (silent = false) => {
    if (!silent) setIsSearching(true);
    try {
      const results = await apiService.searchJourneys({
        origin_station: station,
        destination_zone: destination,
        vehicle_category: vehicleCategory,
      });
      if (results.length === 0) {
        const all = await apiService.searchJourneys({ vehicle_category: vehicleCategory });
        setJourneys(all);
      } else {
        setJourneys(results);
      }
    } catch {
      setJourneys([]);
      toast("Could not reach the radar", "Check that the backend is running on port 8000.", "error");
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => fetchMatches(), 650);
    return () => window.clearTimeout(timer);
  }, [station, destination, vehicleCategory]);

  const sortedJourneys = useMemo(() => {
    const copy = [...journeys];
    if (sortMode === "cheapest") return copy.sort((a, b) => a.estimated_total_cost - b.estimated_total_cost);
    if (sortMode === "earliest")
      return copy.sort(
        (a, b) => new Date(a.departure_time).getTime() - new Date(b.departure_time).getTime()
      );
    return copy.sort((a, b) => b.available_seats - a.available_seats);
  }, [journeys, sortMode]);

  const stationOptions = stations.map((item) => ({
    value: item,
    label: item,
    sub: "Pune Metro station",
    icon: "directions_subway",
  }));
  const destinationOptions = destinations.map((item) => ({
    value: item,
    label: item,
    sub: "Feeder destination",
    icon: "apartment",
  }));

  const handleConfirmMatch = async (journey: Journey) => {
    setSelectedJourney(journey);
    setBookingId(journey.id);
    try {
      await apiService.requestSeat(journey.id, 1);
      const trip = await apiService.startTrip(journey.id);
      toast("Seat secured", `Your boarding PIN is ready for ${journey.origin_station}.`, "success");
      navigate(`/match/${journey.id}`, { state: { tripId: trip.id, journey } });
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast("Booking failed", detail || "This pool may have just filled up. Try another.", "error");
    } finally {
      setBookingId(null);
    }
  };

  const minutesUntil = (iso: string) => {
    const diff = Math.round((new Date(iso).getTime() - Date.now()) / 60000);
    if (diff <= 0) return "Departing now";
    if (diff < 60) return `Departs in ${diff} min`;
    return `Departs in ${Math.floor(diff / 60)}h ${diff % 60}m`;
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col pb-10">
      <Navbar title="Live feeder radar" subtitle={`Metro ${station} exit`} showBack />

      <main className="flex flex-1 flex-col gap-4 px-4 pt-20">
        {/* Map */}
        <section className="glass-card animate-fadeIn p-1.5">
          <div className="relative overflow-hidden rounded-[20px]">
            <TransitMap originName={station} destinationName={destination} mode="radar" height="210px" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent" />
            <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-2 rounded-xl border border-white/10 bg-surface-container/80 px-3 py-2 backdrop-blur">
              <div className="flex min-w-0 items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tertiary opacity-70" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-tertiary" />
                </span>
                <span className="truncate text-[11px] font-extrabold text-on-surface">
                  {isSearching
                    ? "Scanning station perimeter…"
                    : `${sortedJourneys.length} pool${sortedJourneys.length === 1 ? "" : "s"} in range`}
                </span>
              </div>
              <button
                onClick={() => fetchMatches()}
                disabled={isSearching}
                aria-label="Rescan pools"
                className="flex h-7 w-7 items-center justify-center rounded-full bg-white/5 text-secondary transition hover:bg-white/10"
              >
                <span className={`material-symbols-outlined text-[16px] ${isSearching ? "animate-spin" : ""}`}>
                  radar
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Refine */}
        <section className="grid grid-cols-2 gap-2">
          <SelectSheet
            label="From"
            value={station}
            options={stationOptions.length ? stationOptions : [{ value: station, label: station }]}
            onChange={setStation}
            sheetTitle="Change metro exit"
            searchPlaceholder="Search stations…"
            icon="directions_subway"
          />
          <SelectSheet
            label="To"
            value={destination}
            options={
              destinationOptions.length ? destinationOptions : [{ value: destination, label: destination }]
            }
            onChange={setDestination}
            sheetTitle="Change destination"
            searchPlaceholder="Search destinations…"
            icon="apartment"
            accent="tertiary"
          />
        </section>

        <Segmented
          value={vehicleCategory}
          onChange={setVehicleCategory}
          options={[
            { value: "four_wheeler", label: "Car pools", icon: "directions_car" },
            { value: "two_wheeler", label: "Bike pools", icon: "two_wheeler" },
          ]}
          size="sm"
        />

        {/* Results header */}
        <div className="flex items-center justify-between px-0.5">
          <div>
            <p className="eyebrow">Verified commuter drivers</p>
            <p className="text-[10px] text-on-surface-variant">Arrival synced with metro feed</p>
          </div>
          <div className="flex gap-1 rounded-full border border-white/10 bg-white/[0.03] p-0.5">
            {(
              [
                { value: "best", label: "Best" },
                { value: "cheapest", label: "₹" },
                { value: "earliest", label: "Soon" },
              ] as const
            ).map((option) => (
              <button
                key={option.value}
                onClick={() => setSortMode(option.value)}
                className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold transition ${
                  sortMode === option.value
                    ? "bg-secondary/20 text-secondary"
                    : "text-on-surface-variant"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <section className="flex flex-col gap-2.5">
          {isSearching ? (
            [0, 1, 2].map((index) => (
              <div key={index} className="glass-panel flex flex-col gap-3 p-4">
                <div className="flex items-center gap-3">
                  <div className="skeleton h-11 w-11 rounded-2xl" />
                  <div className="flex flex-1 flex-col gap-2">
                    <div className="skeleton h-3 w-1/2" />
                    <div className="skeleton h-2.5 w-1/3" />
                  </div>
                </div>
                <div className="skeleton h-12 w-full" />
              </div>
            ))
          ) : sortedJourneys.length === 0 ? (
            <EmptyState
              icon="near_me_disabled"
              title="No pools on this route yet"
              description="Try another station or destination, or publish your own feeder ride to help someone out."
              actionLabel="Offer a ride instead"
              onAction={() => navigate("/driver/publish")}
            />
          ) : (
            sortedJourneys.map((journey) => {
              const expanded = expandedId === journey.id;
              const booking = bookingId === journey.id;
              const isBike = journey.vehicle_category === "two_wheeler";
              return (
                <article
                  key={journey.id}
                  className="glass-card animate-fadeInUp p-4 transition-all hover:border-secondary/25"
                >
                  <div className="flex items-start justify-between gap-3">
                    <DriverBadge
                      driver={journey.driver}
                      subtitle={`${journey.driver?.vehicle_model || (isBike ? "Bike" : "Car")} · Pune Metro verified`}
                      showCall={false}
                    />
                    <div className="shrink-0 text-right">
                      <p className="font-mono text-lg font-extrabold leading-none text-tertiary">
                        ₹{journey.estimated_total_cost}
                      </p>
                      <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.1em] text-on-surface-variant/60">
                        per seat
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-white/[0.06] bg-surface-container-low/60 px-3 py-2.5">
                    <div className="flex min-w-0 items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
                        <span className="material-symbols-outlined text-[15px]">
                          {isBike ? "two_wheeler" : "directions_car"}
                        </span>
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-extrabold text-on-surface">
                          {journey.origin_station} → {journey.destination_zone}
                        </p>
                        <p className="truncate text-[10px] text-on-surface-variant">
                          {journey.destination_label || "Feeder drop point"}
                        </p>
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-[10px] font-bold text-secondary">{minutesUntil(journey.departure_time)}</p>
                      <p className="text-[10px] text-tertiary">{journey.available_seats} seats left</p>
                    </div>
                  </div>

                  {expanded && (
                    <div className="mt-2.5 grid grid-cols-3 gap-2 animate-fadeIn">
                      {[
                        { label: "Vehicle", value: journey.driver?.vehicle_registration || "—" },
                        { label: "Seats", value: `${journey.available_seats}/${journey.total_seats}` },
                        { label: "Type", value: isBike ? "Bike pool" : "Car pool" },
                      ].map((item) => (
                        <div key={item.label} className="rounded-xl bg-white/[0.03] p-2 text-center">
                          <p className="text-[9px] font-bold uppercase tracking-[0.08em] text-on-surface-variant/60">
                            {item.label}
                          </p>
                          <p className="mt-0.5 truncate font-mono text-[11px] font-bold text-on-surface">
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => setExpandedId(expanded ? null : journey.id)}
                      className="icon-btn h-10 w-10 shrink-0"
                      aria-label="Toggle details"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {expanded ? "expand_less" : "expand_more"}
                      </span>
                    </button>
                    <button
                      onClick={() => handleConfirmMatch(journey)}
                      disabled={bookingId !== null}
                      className="btn-primary flex-1 py-2.5 text-xs"
                    >
                      {booking ? (
                        <>
                          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-ink/70 border-t-transparent" />
                          Securing seat…
                        </>
                      ) : (
                        <>
                          Match & reserve seat
                          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </>
                      )}
                    </button>
                  </div>

                  {selectedJourney?.id === journey.id && booking && (
                    <p className="mt-2 text-center text-[10px] text-on-surface-variant">
                      Generating your dynamic boarding PIN…
                    </p>
                  )}
                </article>
              );
            })
          )}
        </section>
      </main>
    </div>
  );
};

export default MetroMatchingPage;
