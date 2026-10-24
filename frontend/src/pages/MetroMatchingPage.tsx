import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiService } from "../api/client";
import { Journey } from "../types";
import Navbar from "../components/Navbar";
import TransitMap from "../components/TransitMap";

export const MetroMatchingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const queryState = location.state as {
    station?: string;
    destination?: string;
    vehicleCategory?: "four_wheeler" | "two_wheeler";
  } | null;

  const station = queryState?.station || "Ramwadi";
  const destination = queryState?.destination || "EON IT Park Kharadi";

  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [isSearching, setIsSearching] = useState(true);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    // Run search against backend
    const fetchMatches = async () => {
      try {
        const results = await apiService.searchJourneys({
          origin_station: station,
          destination_zone: destination,
        });

        // If no strict match, fetch all open journeys so user always has options
        if (results.length === 0) {
          const fallback = await apiService.searchJourneys();
          setJourneys(fallback);
        } else {
          setJourneys(results);
        }
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        // Keep radar scan active for 1.5s for authentic transit radar experience
        setTimeout(() => setIsSearching(false), 1400);
      }
    };

    fetchMatches();
  }, [station, destination]);

  const handleConfirmMatch = async (journey: Journey) => {
    setSelectedJourney(journey);
    setBookingLoading(true);
    try {
      // 1. Request seat
      await apiService.requestSeat(journey.id, 1);
      // 2. Start/fetch trip
      const trip = await apiService.startTrip(journey.id);
      // 3. Navigate to match confirmed screen
      navigate(`/match/${journey.id}`, {
        state: { tripId: trip.id, journey: journey },
      });
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.detail || "Booking failed");
      setBookingLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col pb-12">
      <Navbar title="Live Feeder Radar" subtitle={`Metro ${station} Exit`} showBack={true} />

      <main className="flex-1 flex flex-col max-w-lg mx-auto w-full pt-20 px-4 space-y-5">
        {/* Live Radar Map */}
        <div className="relative w-full overflow-hidden rounded-2xl border border-surface-container-high/60 shadow-xl">
          <TransitMap
            originName={station}
            destinationName={destination}
            mode="radar"
            height="260px"
          />
          {/* Overlay scan status badge */}
          <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between px-3 py-2 rounded-xl bg-surface-container-low/90 backdrop-blur-sm border border-surface-container-high/60">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-ping"></span>
              <span className="font-headline-sm text-xs font-bold text-on-surface">
                {isSearching ? "Scanning Station Perimeter..." : `${journeys.length} Feeder Pool${journeys.length !== 1 ? "s" : ""} Ready`}
              </span>
            </div>
            <span className="text-[10px] text-on-surface-variant font-mono">
              {station} → {destination}
            </span>
          </div>
        </div>

        {/* Results Section */}
        <div className="flex flex-col space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="font-label-ui text-xs font-bold uppercase tracking-wider text-secondary">
              Verified Commuter Drivers
            </span>
            <span className="text-xs text-tertiary font-mono">Arrival synced</span>
          </div>

          {isSearching ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="p-4 rounded-xl bg-surface-container-low animate-pulse flex flex-col gap-3">
                  <div className="h-4 bg-surface-container-high rounded w-3/4"></div>
                  <div className="h-3 bg-surface-container-high rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : journeys.length === 0 ? (
            <div className="p-6 rounded-2xl bg-surface-container text-center flex flex-col items-center gap-2">
              <span className="material-symbols-outlined text-outline text-[40px]">near_me_disabled</span>
              <p className="font-bold text-sm text-on-surface">No immediate drivers found</p>
              <p className="text-xs text-on-surface-variant">Try selecting a different feeder destination or offer a ride yourself.</p>
              <button
                onClick={() => navigate("/driver/publish")}
                className="mt-2 px-4 py-2 rounded-xl bg-secondary text-surface-container-lowest font-bold text-xs"
              >
                Offer a Ride Instead
              </button>
            </div>
          ) : (
            journeys.map((j) => (
              <div
                key={j.id}
                className="p-4 rounded-2xl bg-surface-container-low border border-surface-container-high/80 hover:border-secondary/50 shadow-lg flex flex-col gap-3.5 transition-all"
              >
                {/* Driver Info Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-surface-container-high flex items-center justify-center text-primary font-bold text-base border border-secondary/30">
                      {j.driver?.full_name ? j.driver.full_name[0] : "D"}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-headline-sm text-sm font-bold text-on-surface">
                          {j.driver?.full_name || "Rahul Deshmukh"}
                        </span>
                        <span className="material-symbols-outlined text-secondary text-[16px]">verified</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-on-surface-variant font-mono">
                        <span className="flex items-center text-tertiary">
                          ★ {j.driver?.rating || 4.9}
                        </span>
                        <span>•</span>
                        <span>{j.driver?.vehicle_model || "Honda City"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-headline-sm text-lg font-bold text-tertiary font-mono">
                      ₹{j.estimated_total_cost}
                    </span>
                    <p className="text-[10px] text-on-surface-variant">per seat</p>
                  </div>
                </div>

                {/* Pickup and Timing */}
                <div className="bg-surface-container rounded-xl p-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[18px]">pin_drop</span>
                    <div>
                      <p className="font-bold text-on-surface">{j.origin_station} Metro Gate 2</p>
                      <p className="text-[11px] text-on-surface-variant">Feeder to {j.destination_zone}</p>
                    </div>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-secondary font-bold">Departs in 10m</span>
                    <p className="text-[11px] text-tertiary">{j.available_seats} seats left</p>
                  </div>
                </div>

                {/* Confirm CTA */}
                <button
                  onClick={() => handleConfirmMatch(j)}
                  disabled={bookingLoading && selectedJourney?.id === j.id}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-secondary to-tertiary text-on-tertiary font-headline-sm text-xs font-bold uppercase tracking-wider shadow-md hover:brightness-105 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {bookingLoading && selectedJourney?.id === j.id ? (
                    <span>Securing Seat...</span>
                  ) : (
                    <>
                      <span>Match & Reserve Seat</span>
                      <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                    </>
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default MetroMatchingPage;
