import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiService } from "../api/client";
import { Trip } from "../types";
import Navbar from "../components/Navbar";

export const VerifyPassengerPINPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [pinDigits, setPinDigits] = useState<string[]>(["", "", "", ""]);
  const [passengerId, setPassengerId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);

  useEffect(() => {
    if (tripId && tripId !== "trip-demo") {
      apiService.getTrip(tripId).then((t) => {
        setTrip(t);
        if (t.passengers && t.passengers.length > 0) setPassengerId(t.passengers[0].id);
      }).catch(console.error);
    }
  }, [tripId]);

  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1);
    const newDigits = [...pinDigits];
    newDigits[index] = char;
    setPinDigits(newDigits);
    if (char && index < 3) document.getElementById(`driver-pin-${index + 1}`)?.focus();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredPin = pinDigits.join("");
    if (enteredPin.length !== 4) { setStatusMsg({ text: "Please enter all 4 digits", isError: true }); return; }
    setIsLoading(true);
    setStatusMsg(null);
    try {
      if (tripId && tripId !== "trip-demo") {
        const res = await apiService.verifyPin(tripId, passengerId || "demo-passenger", enteredPin);
        setStatusMsg({ text: res.message, isError: !res.success });
        if (res.success) setTimeout(() => navigate(`/ride/driver/${tripId}`), 800);
      } else {
        setStatusMsg({ text: "Demo PIN verified!", isError: false });
        setTimeout(() => navigate(`/ride/driver/${tripId || "demo"}`), 800);
      }
    } catch (err: any) {
      setStatusMsg({ text: err.response?.data?.detail || "PIN verification failed", isError: true });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col pb-12">
      <Navbar title="Verify Passenger PIN" showBack={true} />

      <main className="flex-1 flex flex-col max-w-md mx-auto w-full pt-20 px-4 gap-5">

        {/* Header */}
        <div className="text-center flex flex-col items-center gap-3 pt-4">
          <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary text-[30px]">pin</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-on-surface">Check Passenger PIN</h1>
            <p className="text-sm text-on-surface-variant mt-1">Ask the passenger for their 4-digit boarding PIN.</p>
          </div>
        </div>

        {/* Passenger info */}
        {trip?.passengers && trip.passengers.length > 0 && (
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container border border-surface-container-high">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-secondary text-[20px]">person</span>
              <span className="text-sm font-bold text-on-surface">{trip.passengers[0].full_name}</span>
            </div>
            <span className="text-xs font-mono text-tertiary">{trip.passengers[0].seats_requested} seat(s)</span>
          </div>
        )}

        {/* Status */}
        {statusMsg && (
          <div className={`px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            statusMsg.isError ? "bg-error-container text-error" : "bg-tertiary-container text-tertiary"
          }`}>
            <span className="material-symbols-outlined text-[16px]">{statusMsg.isError ? "error" : "check_circle"}</span>
            {statusMsg.text}
          </div>
        )}

        {/* 4-digit form */}
        <form onSubmit={handleVerify} className="flex flex-col gap-6">
          <div className="flex justify-center gap-3">
            {pinDigits.map((digit, idx) => (
              <input key={idx} id={`driver-pin-${idx}`} type="text" inputMode="numeric"
                maxLength={1} value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                className="w-14 h-16 text-center rounded-xl bg-surface-container-low border-2 border-surface-container-high focus:border-secondary text-2xl font-mono font-bold text-secondary focus:outline-none transition-all" />
            ))}
          </div>

          <button type="submit" disabled={isLoading || pinDigits.join("").length !== 4}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-secondary to-tertiary text-on-tertiary font-bold text-sm shadow-lg active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-[18px]">check</span>
            {isLoading ? "Verifying..." : "Confirm & Start Trip"}
          </button>
        </form>
      </main>
    </div>
  );
};

export default VerifyPassengerPINPage;
