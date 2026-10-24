import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiService } from "../api/client";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";

export const OTPVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const stateData = location.state as {
    mobileNumber?: string;
    demoOtp?: string;
    role?: string;
    fullName?: string;
    redirectTo?: string;
  } | null;

  const [mobileNumber, setMobileNumber] = useState(
    stateData?.mobileNumber || ""
  );
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [demoCode, setDemoCode] = useState(stateData?.demoOtp || "123456");
  const [timer, setTimer] = useState(45);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // If user arrived here directly without a mobile number, send them to /signup
    if (!stateData?.mobileNumber && !mobileNumber) {
      navigate("/signup", { replace: true });
    }
  }, [stateData, mobileNumber, navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const fillDemoOtp = () => {
    const code = demoCode || "123456";
    const newDigits = code.slice(0, 6).split("");
    while (newDigits.length < 6) newDigits.push("");
    setDigits(newDigits);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = digits.join("");
    if (otpCode.length !== 6) {
      setErrorMsg("Please enter all 6 digits of the OTP");
      return;
    }

    setIsLoading(true);
    setErrorMsg("");

    try {
      const res = await apiService.verifyOtp(mobileNumber, otpCode);
      // Authenticate session in AuthContext & localStorage
      login(res.access_token, res.user);

      // Navigate to Dashboard with verified commuter info
      const destination = stateData?.redirectTo || "/home";
      navigate(destination, { replace: true });
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.detail || "Invalid or expired OTP code. Please retry."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!mobileNumber) return;
    try {
      const res = await apiService.requestOtp(mobileNumber);
      if (res.demo_otp) setDemoCode(res.demo_otp);
      setTimer(45);
      setErrorMsg("");
    } catch (err: any) {
      setErrorMsg("Failed to resend OTP");
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col pb-12">
      <Navbar title="StationPool" subtitle="Mobile OTP Verification" showBack={true} />

      <main className="flex-1 flex flex-col max-w-md mx-auto w-full pt-20 px-4">
        {/* Header Hero */}
        <div className="w-full text-center py-6 flex flex-col items-center">
          <div className="w-16 h-16 rounded-2xl bg-secondary-container/30 border border-secondary/30 flex items-center justify-center text-secondary mb-4 shadow-lg">
            <span className="material-symbols-outlined text-[32px]">phonelink_lock</span>
          </div>

          <h1 className="font-headline-lg text-2xl font-bold tracking-tight text-on-surface">
            Verify Your Mobile
          </h1>
          <p className="font-body-sm text-sm text-on-surface-variant mt-2 max-w-xs">
            We sent a 6-digit transit verification code to{" "}
            <span className="text-secondary font-mono font-semibold">{mobileNumber}</span>
          </p>

          {/* Quick Demo Pill */}
          <button
            type="button"
            onClick={fillDemoOtp}
            className="mt-3 px-3 py-1.5 rounded-full bg-tertiary-container/80 text-tertiary text-xs font-mono font-bold flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
            <span>Tap to auto-fill OTP: {demoCode}</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-error-container text-error text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 6-Digit PIN Form */}
        <form onSubmit={handleVerify} className="flex flex-col gap-6">
          <div className="flex justify-between gap-2 px-1">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center rounded-xl bg-surface-container-low border border-surface-container-high focus:border-secondary focus:bg-surface-container text-on-surface text-xl font-bold font-mono focus:outline-none transition-all shadow-sm"
              />
            ))}
          </div>

          {/* Resend timer */}
          <div className="flex items-center justify-between px-2 text-xs text-on-surface-variant">
            <span>Didn't receive code?</span>
            {timer > 0 ? (
              <span className="font-mono text-secondary">Resend in {timer}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResend}
                className="text-tertiary font-bold hover:underline"
              >
                Resend OTP
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || digits.join("").length !== 6}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-secondary to-tertiary text-on-tertiary font-headline-sm text-sm font-bold shadow-lg shadow-tertiary/20 active:scale-95 transition-all hover:brightness-105 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>Verifying OTP...</span>
            ) : (
              <>
                <span>Confirm & Enter Dashboard</span>
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
              </>
            )}
          </button>
        </form>

        {/* Metro transit safety notice */}
        <div className="mt-8 p-3.5 rounded-xl bg-surface-container border border-surface-container-high flex items-center gap-3">
          <span className="material-symbols-outlined text-secondary text-[22px]">security</span>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Upon successful OTP verification, your encrypted profile is activated and unlocks the Pune Metro Feeder pool network.
          </p>
        </div>
      </main>
    </div>
  );
};

export default OTPVerificationPage;
