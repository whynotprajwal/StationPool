import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../api/client";
import { useToast } from "../components/Toast";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import SelectSheet from "../components/SelectSheet";
import Segmented from "../components/Segmented";
import RouteLine from "../components/RouteLine";

const DEPARTURE_OPTIONS = [
  { minutes: 5, label: "In 5 min" },
  { minutes: 15, label: "In 15 min" },
  { minutes: 30, label: "In 30 min" },
  { minutes: 60, label: "In 1 hour" },
];

export const PublishJourneyPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [stations, setStations] = useState<string[]>(["Ramwadi", "Vanaz", "Civil Court", "Nal Stop"]);
  const [destinations, setDestinations] = useState<string[]>([
    "EON IT Park Kharadi",
    "Hinjawadi Phase 1",
    "Magarpatta City",
  ]);
  const [originStation, setOriginStation] = useState("Ramwadi");
  const [destinationZone, setDestinationZone] = useState("EON IT Park Kharadi");
  const [destinationLabel, setDestinationLabel] = useState("Gate 1 Main Hub");
  const [seats, setSeats] = useState(3);
  const [fuelShare, setFuelShare] = useState(55);
  const [vehicleCategory, setVehicleCategory] = useState<"four_wheeler" | "two_wheeler">(
    "four_wheeler"
  );
  const [departureMinutes, setDepartureMinutes] = useState(15);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [driverStatus, setDriverStatus] = useState<"loading" | "ready" | "missing">("loading");

  useEffect(() => {
    apiService
      .getStations()
      .then((data) => {
        if (data.stations?.length) setStations(data.stations);
        if (data.feeder_destinations?.length) setDestinations(data.feeder_destinations);
      })
      .catch(() => undefined);

    apiService
      .getDriverProfile()
      .then(() => setDriverStatus("ready"))
      .catch(() => setDriverStatus("missing"));
  }, []);

  const handlePublish = async (event: React.FormEvent) => {
    event.preventDefault();
    if (driverStatus !== "ready") {
      navigate("/driver/register");
      return;
    }
    setIsLoading(true);
    try {
      const departure = new Date(Date.now() + departureMinutes * 60 * 1000).toISOString();
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
      toast("Ride published", "Commuters near your metro gate can now match.", "success");
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast("Could not publish", detail || "Please check your details and retry.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const totalPerSeat = Math.round(fuelShare);

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col pb-28">
      <Navbar title="Offer a ride" subtitle="Publish a feeder seat" showBack />

      <main className="flex flex-1 flex-col gap-4 px-4 pt-20">
        {driverStatus === "loading" ? (
          <div className="glass-card flex flex-col gap-3 p-6">
            <div className="skeleton h-4 w-32" />
            <div className="skeleton h-20 w-full" />
            <div className="skeleton h-10 w-full" />
          </div>
        ) : success ? (
          <section className="flex flex-col items-center gap-4 py-8 text-center animate-pop">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-tertiary/20" />
              <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-tertiary text-ink shadow-glow-tertiary">
                <span className="material-symbols-outlined fill text-[30px]">check_circle</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-on-surface">Ride is live</h1>
              <p className="mt-1 text-sm text-on-surface-variant">
                {originStation} → {destinationZone} · {seats} seats · ₹{totalPerSeat}/seat
              </p>
            </div>
            <div className="mt-2 w-full max-w-[280px]">
              <RouteLine
                origin={originStation}
                destination={destinationZone}
                originSub="Metro exit"
                destinationSub={destinationLabel || "Drop point"}
              />
            </div>
            <button onClick={() => navigate("/driver/dashboard")} className="btn-primary mt-2 max-w-[280px]">
              Open driver hub
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
            <button
              onClick={() => navigate("/home")}
              className="text-[11px] font-semibold text-on-surface-variant hover:text-secondary"
            >
              Back to home
            </button>
          </section>
        ) : driverStatus === "missing" ? (
          <section className="glass-card p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-secondary/10 text-secondary ring-1 ring-secondary/25">
                <span className="material-symbols-outlined fill text-[26px]">badge</span>
              </div>
              <div>
                <h1 className="text-sm font-extrabold text-on-surface">Verify before you publish</h1>
                <p className="text-[11px] leading-relaxed text-on-surface-variant">
                  Rider safety starts with a verified licence and vehicle.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-2">
              {[
                { icon: "id_card", text: "Government ID + driving licence" },
                { icon: "directions_car", text: "Vehicle make, model and plate" },
                { icon: "verified_user", text: "Instant simulated verification" },
              ].map((row) => (
                <div key={row.text} className="flex items-center gap-2.5 rounded-xl bg-white/[0.03] px-3 py-2.5">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">{row.icon}</span>
                  <span className="text-[11px] font-semibold text-on-surface-variant">{row.text}</span>
                </div>
              ))}
            </div>

            <button onClick={() => navigate("/driver/register")} className="btn-primary mt-4">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              Start verification
            </button>
          </section>
        ) : (
          <form onSubmit={handlePublish} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="eyebrow">Publish a feeder seat</p>
                <h1 className="mt-0.5 text-lg font-extrabold tracking-tight text-on-surface">
                  Share your commute
                </h1>
              </div>
              <span className="chip chip-active">
                <span className="material-symbols-outlined fill text-[13px]">verified</span>
                Verified
              </span>
            </div>

            {/* Route */}
            <section className="glass-card p-4">
              <div className="mb-2.5 flex items-center justify-between">
                <p className="eyebrow">Route</p>
                <span className="text-[10px] text-on-surface-variant">Pune Metro feeder</span>
              </div>
              <div className="flex flex-col gap-2.5">
                <SelectSheet
                  label="Metro exit station"
                  value={originStation}
                  options={stations.map((station) => ({
                    value: station,
                    label: station,
                    sub: "Pune Metro station",
                    icon: "directions_subway",
                  }))}
                  onChange={setOriginStation}
                  sheetTitle="Where do you start?"
                  searchPlaceholder="Search stations…"
                  icon="directions_subway"
                />
                <SelectSheet
                  label="Destination"
                  value={destinationZone}
                  options={destinations.map((destination) => ({
                    value: destination,
                    label: destination,
                    sub: "Feeder destination",
                    icon: "apartment",
                  }))}
                  onChange={setDestinationZone}
                  sheetTitle="Where are you headed?"
                  searchPlaceholder="Search destinations…"
                  icon="apartment"
                  accent="tertiary"
                />
                <input
                  value={destinationLabel}
                  onChange={(event) => setDestinationLabel(event.target.value)}
                  placeholder="Drop point e.g. Tower 3 lobby"
                  className="field text-xs"
                />
              </div>
            </section>

            {/* Departure */}
            <section className="glass-panel p-4">
              <div className="mb-2.5 flex items-center justify-between">
                <p className="eyebrow">Departure</p>
                <span className="text-[10px] text-on-surface-variant">From metro gate</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {DEPARTURE_OPTIONS.map((option) => (
                  <button
                    key={option.minutes}
                    type="button"
                    onClick={() => setDepartureMinutes(option.minutes)}
                    className={`rounded-xl border py-2 text-[10px] font-bold transition-all ${
                      departureMinutes === option.minutes
                        ? "border-secondary/40 bg-secondary/15 text-secondary"
                        : "border-white/10 bg-white/[0.03] text-on-surface-variant"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </section>

            {/* Seats & fare */}
            <section className="glass-panel p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="eyebrow">Seats available</p>
                  <p className="text-[10px] text-on-surface-variant">Forward-facing passenger seats</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSeats((prev) => Math.max(1, prev - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm font-bold text-on-surface"
                  >
                    −
                  </button>
                  <span className="w-4 text-center font-mono text-base font-extrabold text-secondary">
                    {seats}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSeats((prev) => Math.min(4, prev + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm font-bold text-on-surface"
                  >
                    +
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="eyebrow">Fuel share per rider</p>
                    <p className="text-[10px] text-on-surface-variant">Cost sharing only · no profit</p>
                  </div>
                  <span className="font-mono text-xl font-extrabold text-tertiary">₹{totalPerSeat}</span>
                </div>
                <input
                  type="range"
                  min={20}
                  max={150}
                  step={5}
                  value={fuelShare}
                  onChange={(event) => setFuelShare(Number(event.target.value))}
                  className="mt-3 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-secondary"
                  style={{
                    background: `linear-gradient(to right, #94ccff ${((fuelShare - 20) / 130) * 100}%, rgba(255,255,255,0.1) ${((fuelShare - 20) / 130) * 100}%)`,
                  }}
                />
                <div className="mt-1.5 flex justify-between font-mono text-[9px] text-on-surface-variant/60">
                  <span>₹20</span>
                  <span>₹150</span>
                </div>
              </div>

              <div className="mt-4">
                <Segmented
                  value={vehicleCategory}
                  onChange={setVehicleCategory}
                  options={[
                    { value: "four_wheeler", label: "Car", icon: "directions_car" },
                    { value: "two_wheeler", label: "Bike", icon: "two_wheeler" },
                  ]}
                  size="sm"
                />
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2.5">
                <span className="text-[10px] text-on-surface-variant">You'll collect if full</span>
                <span className="font-mono text-sm font-extrabold text-tertiary">
                  ₹{totalPerSeat * seats}
                </span>
              </div>
            </section>

            <button type="submit" disabled={isLoading} className="btn-primary">
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/70 border-t-transparent" />
                  Publishing…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">publish</span>
                  Publish ride
                </>
              )}
            </button>
          </form>
        )}
      </main>

      <BottomNav />
    </div>
  );
};

export default PublishJourneyPage;
