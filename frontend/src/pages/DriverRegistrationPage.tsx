import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../api/client";
import Navbar from "../components/Navbar";

export const DriverRegistrationPage: React.FC = () => {
  const navigate = useNavigate();

  const [idType, setIdType] = useState("Aadhaar");
  const [idNumber, setIdNumber] = useState("");
  const [dlNumber, setDlNumber] = useState("");
  const [vehicleCategory, setVehicleCategory] = useState<"four_wheeler" | "two_wheeler">("four_wheeler");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleReg, setVehicleReg] = useState("");
  const [seats, setSeats] = useState(3);
  const [hasHelmet, setHasHelmet] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idNumber || !dlNumber || !vehicleModel || !vehicleReg) {
      setErrorMsg("Please fill all required verification fields");
      return;
    }

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

      navigate("/driver/publish");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.detail || "Driver registration failed"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col pb-12">
      <Navbar title="Driver Verification" subtitle="Pune Metro Onboarding" showBack={true} />

      <main className="flex-1 flex flex-col max-w-md mx-auto w-full pt-20 px-4 space-y-4">
        {/* Verification Info Header */}
        <div className="p-4 rounded-2xl bg-surface-container-high border border-surface-container-highest shadow-xl flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-secondary-container/30 flex items-center justify-center text-secondary shrink-0 shadow-md">
            <span className="material-symbols-outlined text-[26px]">verified_user</span>
          </div>
          <div>
            <h1 className="font-headline-sm text-base font-bold text-on-surface">
              Become a Verified Feeder Driver
            </h1>
            <p className="text-xs text-on-surface-variant">
              Share fuel costs from your daily Pune Metro station commute.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-error-container text-error text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Identity Verification Section */}
          <div className="p-4 rounded-2xl bg-surface-container border border-surface-container-high space-y-3">
            <span className="font-label-ui text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">id_card</span>
              Government ID Verification
            </span>

            <div className="grid grid-cols-2 gap-2">
              <select
                value={idType}
                onChange={(e) => setIdType(e.target.value)}
                className="h-11 px-3 rounded-xl bg-surface-container-low border border-surface-container-high text-xs font-semibold text-on-surface focus:outline-none"
              >
                <option value="Aadhaar">Aadhaar Card</option>
                <option value="PAN">PAN Card</option>
                <option value="Voter ID">Voter ID</option>
              </select>

              <input
                type="text"
                required
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="ID Number"
                className="h-11 px-3 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-on-surface-variant font-semibold">
                Driving License Number (DL)
              </label>
              <input
                type="text"
                required
                value={dlNumber}
                onChange={(e) => setDlNumber(e.target.value)}
                placeholder="MH12-20200012345"
                className="h-11 px-3 rounded-xl bg-surface-container-low border border-surface-container-high text-xs font-mono text-on-surface uppercase focus:outline-none"
              />
            </div>
          </div>

          {/* Vehicle Setup Section */}
          <div className="p-4 rounded-2xl bg-surface-container border border-surface-container-high space-y-3">
            <span className="font-label-ui text-xs font-bold uppercase tracking-wider text-secondary flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px]">directions_car</span>
              Vehicle Information
            </span>

            {/* Vehicle Category Toggle */}
            <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container-lowest rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setVehicleCategory("four_wheeler");
                  setSeats(3);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  vehicleCategory === "four_wheeler"
                    ? "bg-surface-container-high text-secondary ring-1 ring-secondary/50"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">directions_car</span>
                <span>4-Wheeler Car</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setVehicleCategory("two_wheeler");
                  setSeats(1);
                }}
                className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  vehicleCategory === "two_wheeler"
                    ? "bg-surface-container-high text-secondary ring-1 ring-secondary/50"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">two_wheeler</span>
                <span>2-Wheeler Bike</span>
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-on-surface-variant font-semibold">
                Vehicle Make & Model
              </label>
              <input
                type="text"
                required
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="e.g., Honda City (Silver) or Ather 450X"
                className="h-11 px-3 rounded-xl bg-surface-container-low border border-surface-container-high text-xs text-on-surface focus:outline-none"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-xs text-on-surface-variant font-semibold">
                Vehicle Registration Plate
              </label>
              <input
                type="text"
                required
                value={vehicleReg}
                onChange={(e) => setVehicleReg(e.target.value)}
                placeholder="MH 12 AB 1234"
                className="h-11 px-3 rounded-xl bg-surface-container-low border border-surface-container-high text-xs font-mono uppercase text-on-surface focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-on-surface-variant font-semibold">
                Available Passenger Seats
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSeats((s) => Math.max(1, s - 1))}
                  className="w-8 h-8 rounded-lg bg-surface-container-low border border-surface-container-high flex items-center justify-center text-sm font-bold text-on-surface"
                >
                  -
                </button>
                <span className="font-mono text-base font-bold text-secondary">{seats}</span>
                <button
                  type="button"
                  onClick={() => setSeats((s) => Math.min(6, s + 1))}
                  className="w-8 h-8 rounded-lg bg-surface-container-low border border-surface-container-high flex items-center justify-center text-sm font-bold text-on-surface"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-secondary to-tertiary text-on-tertiary font-headline-sm text-sm font-bold shadow-xl shadow-tertiary/25 active:scale-95 transition-all hover:brightness-105 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>Verifying Documents...</span>
            ) : (
              <>
                <span>Complete Verification & Publish Route</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>
      </main>
    </div>
  );
};

export default DriverRegistrationPage;
