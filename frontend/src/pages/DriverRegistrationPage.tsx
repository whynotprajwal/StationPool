import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import Navbar from "../components/Navbar";
import Segmented from "../components/Segmented";

const STEPS = [
  { id: 1, label: "Identity", icon: "id_card" },
  { id: 2, label: "Vehicle", icon: "directions_car" },
  { id: 3, label: "Review", icon: "fact_check" },
];

export const DriverRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState(1);
  const [idType, setIdType] = useState("Aadhaar");
  const [idNumber, setIdNumber] = useState("");
  const [dlNumber, setDlNumber] = useState("");
  const [vehicleCategory, setVehicleCategory] = useState<"four_wheeler" | "two_wheeler">(
    "four_wheeler"
  );
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleReg, setVehicleReg] = useState("");
  const [seats, setSeats] = useState(3);
  const [hasHelmet, setHasHelmet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const goNext = () => {
    setErrorMsg("");
    if (step === 1) {
      if (idNumber.replace(/\s/g, "").length < 6) {
        setErrorMsg("Enter a valid government ID number");
        return;
      }
      if (dlNumber.replace(/\s/g, "").length < 8) {
        setErrorMsg("Enter a valid driving licence number");
        return;
      }
    }
    if (step === 2) {
      if (!vehicleModel.trim()) {
        setErrorMsg("Add your vehicle make and model");
        return;
      }
      if (vehicleReg.replace(/\s/g, "").length < 6) {
        setErrorMsg("Enter a valid registration plate");
        return;
      }
    }
    setStep((prev) => Math.min(3, prev + 1));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrorMsg("");
    try {
      await apiService.registerDriver({
        id_type: idType,
        id_number: idNumber,
        dl_number: dlNumber,
        dl_expiry: "2036-12-31",
        vehicle_category: vehicleCategory,
        vehicle_make_model: vehicleModel,
        vehicle_registration: vehicleReg.toUpperCase(),
        vehicle_capacity: seats,
        has_helmet: hasHelmet,
      });
      await refreshUser();
      toast("Verification complete", "You can now publish Pune Metro feeder rides.", "success");
      navigate("/driver/publish");
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setErrorMsg(detail || "Driver verification failed. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col pb-10">
      <Navbar title="Driver verification" subtitle="Two-minute onboarding" showBack />

      <main className="flex flex-1 flex-col gap-5 px-4 pt-20">
        {/* Header */}
        <section className="glass-card p-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-secondary/10 text-secondary ring-1 ring-secondary/25">
              <span className="material-symbols-outlined fill text-[24px]">verified_user</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-sm font-extrabold text-on-surface">Become a verified feeder</h1>
              <p className="text-[11px] leading-relaxed text-on-surface-variant">
                Simulated instant verification for this prototype.
              </p>
            </div>
          </div>

          {/* Progress */}
          <div className="mt-4 flex items-center">
            {STEPS.map((item, index) => {
              const done = step > item.id;
              const active = step === item.id;
              return (
                <React.Fragment key={item.id}>
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full border text-[11px] font-extrabold transition-all ${
                        done
                          ? "border-tertiary/40 bg-tertiary/15 text-tertiary"
                          : active
                            ? "border-secondary/60 bg-secondary/15 text-secondary shadow-glow"
                            : "border-white/10 bg-white/5 text-on-surface-variant/60"
                      }`}
                    >
                      {done ? (
                        <span className="material-symbols-outlined text-[16px]">check</span>
                      ) : (
                        item.id
                      )}
                    </span>
                    <span
                      className={`text-[9px] font-bold ${
                        active || done ? "text-on-surface" : "text-on-surface-variant/50"
                      }`}
                    >
                      {item.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <span className={`mx-1 mb-4 h-px flex-1 ${done ? "bg-tertiary/40" : "bg-white/10"}`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </section>

        {errorMsg && (
          <div className="flex items-start gap-2 rounded-2xl border border-error/30 bg-error-container/50 px-3.5 py-2.5 text-xs font-semibold text-error animate-shake">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Step 1 */}
        {step === 1 && (
          <section className="flex flex-col gap-3 animate-fadeInUp">
            <div className="glass-panel p-4">
              <p className="eyebrow mb-3">Government ID</p>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={idType}
                  onChange={(event) => setIdType(event.target.value)}
                  className="field py-2.5 text-xs"
                >
                  <option value="Aadhaar">Aadhaar card</option>
                  <option value="PAN">PAN card</option>
                  <option value="Voter ID">Voter ID</option>
                </select>
                <input
                  value={idNumber}
                  onChange={(event) => setIdNumber(event.target.value)}
                  placeholder="ID number"
                  className="field py-2.5 font-mono text-xs"
                />
              </div>
              <p className="mt-2 flex items-center gap-1 text-[10px] text-on-surface-variant">
                <span className="material-symbols-outlined text-[13px] text-tertiary">lock</span>
                We only store a masked version of your ID.
              </p>
            </div>

            <div className="glass-panel p-4">
              <p className="eyebrow mb-3">Driving licence</p>
              <input
                value={dlNumber}
                onChange={(event) => setDlNumber(event.target.value)}
                placeholder="MH12-20200012345"
                className="field font-mono text-xs uppercase"
              />
              <div className="mt-2 flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2">
                <span className="text-[10px] text-on-surface-variant">Validity</span>
                <span className="font-mono text-[11px] font-bold text-tertiary">Valid · 2036</span>
              </div>
            </div>
          </section>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <section className="flex flex-col gap-3 animate-fadeInUp">
            <div className="glass-panel p-4">
              <p className="eyebrow mb-3">Vehicle type</p>
              <Segmented
                value={vehicleCategory}
                onChange={(value) => {
                  setVehicleCategory(value);
                  setSeats(value === "two_wheeler" ? 1 : 3);
                }}
                options={[
                  { value: "four_wheeler", label: "4-wheeler car", icon: "directions_car" },
                  { value: "two_wheeler", label: "2-wheeler bike", icon: "two_wheeler" },
                ]}
              />

              <div className="mt-3 flex flex-col gap-2.5">
                <div>
                  <label className="label mb-1.5 block">Make & model</label>
                  <input
                    value={vehicleModel}
                    onChange={(event) => setVehicleModel(event.target.value)}
                    placeholder={
                      vehicleCategory === "four_wheeler"
                        ? "e.g. Honda City (Silver)"
                        : "e.g. Ather 450X"
                    }
                    className="field text-xs"
                  />
                </div>
                <div>
                  <label className="label mb-1.5 block">Registration plate</label>
                  <input
                    value={vehicleReg}
                    onChange={(event) => setVehicleReg(event.target.value.toUpperCase())}
                    placeholder="MH 12 AB 1234"
                    className="field font-mono text-xs uppercase tracking-wider"
                  />
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2.5">
                <div>
                  <p className="text-[11px] font-bold text-on-surface">Passenger seats</p>
                  <p className="text-[9px] text-on-surface-variant">Excluding the driver</p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSeats((prev) => Math.max(1, prev - 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm font-bold text-on-surface"
                  >
                    −
                  </button>
                  <span className="w-4 text-center font-mono text-sm font-extrabold text-secondary">
                    {seats}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSeats((prev) => Math.min(6, prev + 1))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-sm font-bold text-on-surface"
                  >
                    +
                  </button>
                </div>
              </div>

              {vehicleCategory === "two_wheeler" && (
                <label className="mt-2.5 flex items-center justify-between rounded-xl bg-white/[0.03] px-3 py-2.5">
                  <span className="flex items-center gap-1.5 text-[11px] font-bold text-on-surface">
                    <span className="material-symbols-outlined text-[16px] text-secondary">sports_motorsports</span>
                    Spare helmet available
                  </span>
                  <button
                    type="button"
                    onClick={() => setHasHelmet((prev) => !prev)}
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      hasHelmet ? "bg-tertiary/80" : "bg-white/15"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
                        hasHelmet ? "left-[22px]" : "left-0.5"
                      }`}
                    />
                  </button>
                </label>
              )}
            </div>
          </section>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <section className="flex flex-col gap-3 animate-fadeInUp">
            <div className="glass-panel p-4">
              <p className="eyebrow mb-3">Confirm your details</p>
              <div className="flex flex-col gap-2">
                {[
                  { label: "ID type", value: idType },
                  { label: "ID number", value: `•••• •••• ${idNumber.slice(-4)}` },
                  { label: "Licence", value: dlNumber.toUpperCase() },
                  { label: "Vehicle", value: vehicleModel || "—" },
                  { label: "Plate", value: vehicleReg.toUpperCase() || "—" },
                  {
                    label: "Type",
                    value: vehicleCategory === "four_wheeler" ? "Car pool" : "Bike pool",
                  },
                  { label: "Seats", value: `${seats} passenger seat(s)` },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex items-center justify-between border-b border-white/[0.05] pb-2 last:border-0 last:pb-0"
                  >
                    <span className="text-[11px] text-on-surface-variant">{row.label}</span>
                    <span className="max-w-[58%] truncate text-right font-mono text-[11px] font-bold text-on-surface">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-start gap-2 rounded-2xl border border-tertiary/20 bg-tertiary/[0.06] p-3">
              <span className="material-symbols-outlined text-[18px] text-tertiary">verified</span>
              <p className="text-[11px] leading-relaxed text-on-surface-variant">
                By continuing you agree to share only vacant seats, follow Pune Metro feeder rules,
                and keep fares at cost-sharing rates.
              </p>
            </div>
          </section>
        )}

        {/* Actions */}
        <div className="mt-auto flex gap-2 pb-2">
          {step > 1 && (
            <button onClick={() => setStep((prev) => prev - 1)} className="btn-ghost flex-1 py-3">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              Back
            </button>
          )}
          {step < 3 ? (
            <button onClick={goNext} className="btn-primary flex-1 py-3">
              Continue
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={isLoading} className="btn-primary flex-1 py-3">
              {isLoading ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/70 border-t-transparent" />
                  Verifying…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  Complete verification
                </>
              )}
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default DriverRegistrationPage;
