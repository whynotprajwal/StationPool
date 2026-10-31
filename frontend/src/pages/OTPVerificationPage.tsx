import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiService } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import Navbar from "../components/Navbar";

interface OTPState {
  mobileNumber?: string;
  demoOtp?: string;
  role?: string;
  fullName?: string;
  redirectTo?: string;
}

export const OTPVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();

  const stateData = location.state as OTPState | null;
  const mobileNumber = stateData?.mobileNumber || "";
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [demoCode] = useState(stateData?.demoOtp || "123456");
  const [timer, setTimer] = useState(45);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const autoSubmitted = useRef(false);

  useEffect(() => {
    if (!mobileNumber) navigate("/signup", { replace: true });
  }, [mobileNumber, navigate]);

  useEffect(() => {
    const interval = setInterval(() => setTimer((previous) => (previous > 0 ? previous - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, []);

  const submitOtp = async (code: string) => {
    if (code.length !== 6) {
      setErrorMsg("Please enter all 6 digits");
      return;
    }
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await apiService.verifyOtp(mobileNumber, code);
      login(res.access_token, res.user);
      toast("Verified", "Your Pune Metro commuter session is active.", "success");
      navigate(stateData?.redirectTo || "/home", { replace: true });
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setErrorMsg(detail || "Invalid or expired OTP. Please retry.");
      autoSubmitted.current = false;
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-submit the moment all six digits are present.
  useEffect(() => {
    const code = digits.join("");
    if (code.length === 6 && !autoSubmitted.current && !isLoading) {
      autoSubmitted.current = true;
      const timeout = window.setTimeout(() => submitOtp(code), 320);
      return () => window.clearTimeout(timeout);
    }
  }, [digits, isLoading]);

  const setDigitAt = (index: number, value: string) => {
    const chars = value.replace(/\D/g, "").split("");
    if (chars.length === 0) {
      const next = [...digits];
      next[index] = "";
      setDigits(next);
      return;
    }
    const next = [...digits];
    let cursor = index;
    for (const char of chars) {
      if (cursor > 5) break;
      next[cursor] = char;
      cursor += 1;
    }
    setDigits(next);
    inputRefs.current[Math.min(cursor, 5)]?.focus();
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (event.key === "ArrowLeft" && index > 0) inputRefs.current[index - 1]?.focus();
    if (event.key === "ArrowRight" && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;
    const next = ["", "", "", "", "", ""];
    pasted.split("").forEach((char, index) => {
      next[index] = char;
    });
    setDigits(next);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const fillDemoOtp = () => {
    const next = (demoCode || "123456").slice(0, 6).split("");
    while (next.length < 6) next.push("");
    setDigits(next);
    autoSubmitted.current = false;
    inputRefs.current[5]?.focus();
  };

  const handleResend = async () => {
    if (!mobileNumber) return;
    setIsResending(true);
    try {
      await apiService.requestOtp(mobileNumber);
      setTimer(45);
      setErrorMsg("");
      toast("Code resent", `A fresh OTP was sent to ${mobileNumber}.`, "success");
    } catch {
      setErrorMsg("Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const progress = Math.max(0, Math.min(100, (timer / 45) * 100));

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col pb-10">
      <Navbar title="Verify mobile" showBack />

      <main className="flex flex-1 flex-col gap-6 px-5 pt-24">
        <div className="flex flex-col items-center gap-4 text-center animate-fadeInUp">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <span className="absolute inset-0 rounded-[28px] bg-secondary/10 blur-xl" />
            <span className="absolute inset-1 rounded-[26px] border border-secondary/20" />
            <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient-soft ring-1 ring-secondary/30">
              <span className="material-symbols-outlined fill text-[30px] text-secondary">
                phonelink_lock
              </span>
            </div>
            <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border border-surface bg-tertiary text-ink">
              <span className="material-symbols-outlined fill text-[14px]">lock</span>
            </span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold tracking-tight text-on-surface">
              Check your messages
            </h1>
            <p className="mt-1 text-sm text-on-surface-variant">
              We sent a 6-digit code to{" "}
              <span className="font-mono text-[13px] font-bold text-secondary">{mobileNumber}</span>
            </p>
          </div>
          <button
            onClick={fillDemoOtp}
            className="chip chip-active font-mono text-[11px] transition active:scale-95"
          >
            <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
            Auto-fill dev code · {demoCode}
          </button>
        </div>

        {errorMsg && (
          <div className="flex items-start gap-2 rounded-2xl border border-error/30 bg-error-container/50 px-3.5 py-2.5 text-xs font-semibold text-error animate-shake">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            submitOtp(digits.join(""));
          }}
          className="flex flex-col gap-6"
        >
          <div className="flex justify-between gap-2">
            {digits.map((digit, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={1}
                value={digit}
                onChange={(event) => setDigitAt(index, event.target.value)}
                onKeyDown={(event) => handleKeyDown(index, event)}
                onPaste={handlePaste}
                aria-label={`OTP digit ${index + 1}`}
                className={`h-14 w-full rounded-2xl border bg-surface-container-low/80 text-center font-mono text-xl font-extrabold text-on-surface outline-none transition-all ${
                  digit
                    ? "border-secondary/60 bg-secondary/10 text-secondary shadow-[0_0_0_3px_rgba(148,204,255,0.08)]"
                    : "border-white/10"
                } focus:border-secondary focus:bg-surface-container/90`}
              />
            ))}
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-3">
            <div className="flex items-center gap-2">
              <div className="relative flex h-8 w-8 items-center justify-center">
                <svg viewBox="0 0 36 36" className="absolute h-8 w-8 -rotate-90">
                  <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
                  <circle
                    cx="18"
                    cy="18"
                    r="15"
                    fill="none"
                    stroke="#94ccff"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeDasharray={`${(progress / 100) * 94.2} 94.2`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <span className="font-mono text-[9px] font-bold text-secondary">{timer}</span>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant/60">
                  {timer > 0 ? "Resend available in" : "Code expired"}
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  {timer > 0 ? `${timer} seconds remaining` : "Request a fresh code"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResend}
              disabled={timer > 0 || isResending}
              className={`text-[11px] font-extrabold transition ${
                timer > 0 ? "text-on-surface-variant/40" : "text-tertiary hover:underline"
              }`}
            >
              {isResending ? "Sending…" : "Resend"}
            </button>
          </div>

          <button
            type="submit"
            disabled={isLoading || digits.join("").length !== 6}
            className="btn-primary"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/70 border-t-transparent" />
                Verifying…
              </>
            ) : (
              <>
                Confirm & continue
                <span className="material-symbols-outlined text-[18px]">verified</span>
              </>
            )}
          </button>
        </form>

        <button
          onClick={() => navigate("/signup")}
          className="mx-auto flex items-center gap-1 text-[11px] font-semibold text-on-surface-variant transition hover:text-secondary"
        >
          <span className="material-symbols-outlined text-[14px]">edit</span>
          Wrong number? Go back
        </button>

        <div className="mt-auto flex items-center justify-center gap-1.5 text-[10px] text-on-surface-variant/60">
          <span className="material-symbols-outlined text-[13px] text-tertiary">shield_lock</span>
          End-to-end encrypted session · OTP valid for 10 minutes
        </div>
      </main>
    </div>
  );
};

export default OTPVerificationPage;
