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
        if (t.passengers && t.passengers.length > 0) {
          setPassengerId(t.passengers[0].id);
        }
      }).catch(console.error);
    }
  }, [tripId]);

  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1);
    const newDigits = [...pinDigits];
    newDigits[index] = char;
    setPinDigits(newDigits);

    if (char && index < 3) {
      const nextInput = document.getElementById(`driver-pin-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const enteredPin = pinDigits.join("");
    if (enteredPin.length !== 4) {
      setStatusMsg({ text: "Please enter 4 digits", isError: true });
      return;
    }

    setIsLoading(true);
    setStatusMsg(null);

    try {
      if (tripId && tripId !== "trip-demo") {
        const res = await apiService.verifyPin(
          tripId,
          passengerId || "demo-passenger",
          enteredPin
        );

        if (res.success) {
          setStatusMsg({ text: res.message, isError: false });
          setTimeout(() => {
            navigate(`/ride/driver/${tripId}`);
          }, 800);
        } else {
          setStatusMsg({ text: res.message, isError: true });
        }
      } else {
        // Demo fallback
        setStatusMsg({ text: "Demo PIN verified successfully!", isError: false });
        setTimeout(() => {
          navigate(`/ride/driver/${tripId || "demo"}`);
        }, 800);
      }
    } catch (err: any) {
      setStatusMsg({
        text: err.response?.data?.detail || "PIN verification failed",
        isError: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col pb-12">
      <Navbar title="Driver Gate Verification" subtitle="Enter Passenger PIN" showBack={true} />

      <main className="flex-1 flex flex-col max-w-md mx-auto w-full pt-20 px-4 space-y-5">
        {/* Header Hero */}
        <div className="p-5 rounded-2xl bg-surface-container-high border border-surface-container-highest shadow-xl text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-secondary-container/40 flex items-center justify-center text-secondary mb-3 shadow-md">
            <span className="material-symbols-outlined text-[30px]">pin</span>
          </div>
          <h1 className="font-headline-sm text-lg font-bold text-on-surface">
            Verify Passenger Boarding
          </h1>
          <p className="text-xs text-on-surface-variant mt-1 max-w-xs">
            Ask passenger for their 4-digit StationPool gate verification PIN before departing.
          </p>
        </div>

        {/* Passenger selector (if multiple) */}
        {trip?.passengers && trip.passengers.length > 0 && (
          <div className="p-3.5 rounded-xl bg-surface-container border border-surface-container-high flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-secondary text-[20px]">person</span>
              <span className="text-sm font-bold text-on-surface">
                {trip.passengers[0].full_name}
              </span>
            </div>
            <span className="text-xs font-mono text-tertiary">
              {trip.passengers[0].seats_requested} seat(s)
            </span>
          </div>
        )}

        {statusMsg && (
          <div
            className={`p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm ${
              statusMsg.isError
                ? "bg-error-container text-error"
                : "bg-tertiary-container text-tertiary"
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {statusMsg.isError ? "error" : "check_circle"}
            </span>
            <span>{statusMsg.text}</span>
          </div>
        )}

        {/* 4-Digit Input Form */}
        <form onSubmit={handleVerify} className="flex flex-col gap-5">
          <div className="flex justify-center gap-3">
            {pinDigits.map((digit, idx) => (
              <input
                key={idx}
                id={`driver-pin-${idx}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(idx, e.target.value)}
                className="w-14 h-16 text-center rounded-2xl bg-surface-container-low border-2 border-surface-container-high focus:border-secondary focus:bg-surface-container text-2xl font-mono font-bold text-secondary shadow-md focus:outline-none transition-all"
              />
            ))}
          </div>

          <button
            type="submit"
            disabled={isLoading || pinDigits.join("").length !== 4}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-secondary to-tertiary text-on-tertiary font-headline-sm text-sm font-bold shadow-xl shadow-tertiary/20 active:scale-95 transition-all hover:brightness-105 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>Verifying Cryptographic PIN...</span>
            ) : (
              <>
                <span>Confirm PIN & Start Trip</span>
                <span className="material-symbols-outlined text-[18px]">check</span>
              </>
            )}
          </button>
        </form>

        {/* Info Note */}
        <div className="p-4 rounded-xl bg-surface-container border border-surface-container-high/60 text-xs text-on-surface-variant space-y-1">
          <p className="font-bold text-on-surface flex items-center gap-1.5">
            <span className="material-symbols-outlined text-secondary text-[16px]">verified_user</span>
            Zero Passenger Fraud Security
          </p>
          <p>
            PIN is cryptographically verified against the backend SHA-256 hash before journey insurance begins.
          </p>
        </div>
      </main>
    </div>
  );
};

export default VerifyPassengerPINPage;
