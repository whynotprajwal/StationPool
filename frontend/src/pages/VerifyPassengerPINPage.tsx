import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiService } from "../api/client";
import { useToast } from "../components/Toast";
import type { Trip } from "../types";
import Navbar from "../components/Navbar";

export const VerifyPassengerPINPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [pinDigits, setPinDigits] = useState<string[]>(["", "", "", ""]);
  const [passengerId, setPassengerId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shake, setShake] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError: boolean } | null>(null);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (tripId && tripId !== "trip-demo") {
      apiService
        .getTrip(tripId)
        .then((loaded) => {
          setTrip(loaded);
          if (loaded.passengers?.length) setPassengerId(loaded.passengers[0].id);
        })
        .catch(() => toast("Could not load trip", "Showing the demo verification flow.", "error"));
    }
  }, [tripId, toast]);

  const setDigit = (index: number, value: string) => {
    const digits = value.replace(/\D/g, "").split("");
    if (!digits.length) {
      const next = [...pinDigits];
      next[index] = "";
      setPinDigits(next);
      return;
    }
    const next = [...pinDigits];
    let cursor = index;
    for (const digit of digits) {
      if (cursor > 3) break;
      next[cursor] = digit;
      cursor += 1;
    }
    setPinDigits(next);
    inputRefs.current[Math.min(cursor, 3)]?.focus();
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !pinDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < 3) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    if (!pasted) return;
    const next = pasted.split("");
    while (next.length < 4) next.push("");
    setPinDigits(next);
    inputRefs.current[3]?.focus();
  };

  const handleVerify = async (event: React.FormEvent) => {
    event.preventDefault();
    const enteredPin = pinDigits.join("");
    if (enteredPin.length !== 4) {
      setStatusMsg({ text: "Please enter all 4 digits", isError: true });
      return;
    }
    setIsLoading(true);
    setStatusMsg(null);
    try {
      if (tripId && tripId !== "trip-demo") {
        const res = await apiService.verifyPin(tripId, passengerId || "demo-passenger", enteredPin);
        setStatusMsg({ text: res.message, isError: !res.success });
        if (res.success) {
          setSuccess(true);
          toast("Passenger verified", "PIN accepted. Have a safe commute.", "success");
          setTimeout(() => navigate(`/ride/driver/${tripId}`), 1100);
        } else {
          setShake(true);
          setTimeout(() => setShake(false), 500);
          setPinDigits(["", "", "", ""]);
          inputRefs.current[0]?.focus();
        }
      } else {
        setSuccess(true);
        setStatusMsg({ text: "Demo PIN verified successfully.", isError: false });
        setTimeout(() => navigate("/ride/driver/trip-demo"), 1100);
      }
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setStatusMsg({ text: detail || "PIN verification failed", isError: true });
      setShake(true);
      setTimeout(() => setShake(false), 500);
      setPinDigits(["", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const passenger = trip?.passengers?.[0];

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col pb-10">
      <Navbar title="Verify passenger" showBack />

      <main className="flex flex-1 flex-col gap-5 px-5 pt-24">
        {success ? (
          <div className="flex flex-col items-center gap-4 py-10 text-center animate-pop">
            <div className="relative flex h-24 w-24 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-tertiary/20" />
              <span className="absolute inset-2 rounded-full border border-tertiary/30" />
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-tertiary text-ink shadow-glow-tertiary">
                <span className="material-symbols-outlined fill text-[34px]">verified</span>
              </div>
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-on-surface">Passenger verified</h1>
              <p className="mt-1 text-sm text-on-surface-variant">
                {passenger?.full_name || "Your co-commuter"} is cleared to board.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-3 text-center animate-fadeInUp">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-secondary/20 bg-secondary/10 text-secondary">
                <span className="material-symbols-outlined fill text-[30px]">pin</span>
                <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-surface bg-tertiary text-ink">
                  <span className="material-symbols-outlined text-[12px]">lock</span>
                </span>
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-on-surface">
                  Enter boarding PIN
                </h1>
                <p className="mt-1 max-w-[300px] text-sm text-on-surface-variant">
                  Ask your rider for the 4-digit code on their active ride screen.
                </p>
              </div>
            </div>

            {passenger && (
              <div className="glass-panel flex items-center justify-between p-3.5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient-soft text-sm font-extrabold text-secondary ring-1 ring-secondary/25">
                    {passenger.full_name.charAt(0)}
                  </span>
                  <div>
                    <p className="text-xs font-extrabold text-on-surface">{passenger.full_name}</p>
                    <p className="font-mono text-[10px] text-on-surface-variant">
                      {passenger.mobile_number}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-white/5 px-2 py-0.5 text-[9px] font-bold text-on-surface-variant">
                  {passenger.seats_requested} seat(s)
                </span>
              </div>
            )}

            {statusMsg && (
              <div
                className={`flex items-start gap-2 rounded-2xl border px-3.5 py-2.5 text-xs font-semibold ${
                  statusMsg.isError
                    ? "border-error/30 bg-error-container/50 text-error"
                    : "border-tertiary/30 bg-tertiary-container/40 text-tertiary"
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {statusMsg.isError ? "error" : "check_circle"}
                </span>
                <span>{statusMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleVerify} className="flex flex-col gap-6">
              <div className={`flex justify-center gap-3 ${shake ? "animate-shake" : ""}`}>
                {pinDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(element) => {
                      inputRefs.current[index] = element;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(event) => setDigit(index, event.target.value)}
                    onKeyDown={(event) => handleKeyDown(index, event)}
                    onPaste={handlePaste}
                    aria-label={`PIN digit ${index + 1}`}
                    className={`h-16 w-14 rounded-2xl border-2 bg-surface-container-low/80 text-center font-mono text-2xl font-extrabold outline-none transition-all ${
                      digit
                        ? "border-secondary/60 bg-secondary/10 text-secondary shadow-[0_0_0_3px_rgba(148,204,255,0.08)]"
                        : "border-white/10 text-on-surface"
                    } focus:border-secondary`}
                  />
                ))}
              </div>

              <button
                type="submit"
                disabled={isLoading || pinDigits.join("").length !== 4}
                className="btn-primary"
              >
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                {isLoading ? "Verifying…" : "Confirm & start trip"}
              </button>
            </form>

            <div className="glass-panel flex items-start gap-2.5 p-3.5">
              <span className="material-symbols-outlined text-[18px] text-tertiary">lightbulb</span>
              <p className="text-[11px] leading-relaxed text-on-surface-variant">
                The PIN rotates automatically every 30 minutes. If it expired, ask the rider to tap
                <span className="font-semibold text-secondary"> Refresh</span> on their boarding pass.
              </p>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default VerifyPassengerPINPage;
