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
    mobileNumber?: string; demoOtp?: string;
    role?: string; fullName?: string; redirectTo?: string;
  } | null;

  const [mobileNumber] = useState(stateData?.mobileNumber || "");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [demoCode] = useState(stateData?.demoOtp || "123456");
  const [timer, setTimer] = useState(45);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!stateData?.mobileNumber && !mobileNumber) navigate("/signup", { replace: true });
  }, [stateData, mobileNumber, navigate]);

  useEffect(() => {
    const interval = setInterval(() => setTimer((p) => (p > 0 ? p - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDigitChange = (index: number, val: string) => {
    const char = val.slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);
    if (char && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) inputRefs.current[index - 1]?.focus();
  };

  const fillDemoOtp = () => {
    const newDigits = (demoCode || "123456").slice(0, 6).split("");
    while (newDigits.length < 6) newDigits.push("");
    setDigits(newDigits);
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = digits.join("");
    if (otpCode.length !== 6) { setErrorMsg("Please enter all 6 digits"); return; }
    setIsLoading(true);
    setErrorMsg("");
    try {
      const res = await apiService.verifyOtp(mobileNumber, otpCode);
      login(res.access_token, res.user);
      navigate(stateData?.redirectTo || "/home", { replace: true });
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Invalid or expired OTP. Please retry.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!mobileNumber) return;
    try {
      await apiService.requestOtp(mobileNumber);
      setTimer(45);
      setErrorMsg("");
    } catch {
      setErrorMsg("Failed to resend OTP");
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col pb-12">
      <Navbar title="Verify Mobile" showBack={true} />

      <main className="flex-1 flex flex-col max-w-md mx-auto w-full pt-20 px-5 gap-6">

        {/* Header */}
        <div className="text-center flex flex-col items-center gap-3 pt-4">
          <div className="w-14 h-14 rounded-2xl bg-surface-container-high flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary text-[30px]">phonelink_lock</span>
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-on-surface">Verify Your Mobile</h1>
            <p className="text-sm text-on-surface-variant mt-1">
              OTP sent to <span className="text-secondary font-mono font-semibold">{mobileNumber}</span>
            </p>
          </div>
          <button
            type="button" onClick={fillDemoOtp}
            className="px-3 py-1.5 rounded-full bg-tertiary-container/80 text-tertiary text-xs font-mono font-bold flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[14px]">auto_fix_high</span>
            Auto-fill OTP: {demoCode}
          </button>
        </div>

        {/* Error */}
        {errorMsg && (
          <div className="px-3 py-2.5 rounded-xl bg-error-container text-error text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            {errorMsg}
          </div>
        )}

        {/* OTP Form */}
        <form onSubmit={handleVerify} className="flex flex-col gap-6">
          <div className="flex justify-between gap-2">
            {digits.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text" inputMode="numeric" maxLength={1}
                value={digit}
                onChange={(e) => handleDigitChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className="w-12 h-14 text-center rounded-xl bg-surface-container-low border border-surface-container-high focus:border-secondary text-on-surface text-xl font-bold font-mono focus:outline-none transition-all"
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-xs text-on-surface-variant">
            <span>Didn't receive code?</span>
            {timer > 0 ? (
              <span className="font-mono text-secondary">Resend in {timer}s</span>
            ) : (
              <button type="button" onClick={handleResend} className="text-tertiary font-bold hover:underline">
                Resend OTP
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || digits.join("").length !== 6}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-secondary to-tertiary text-on-tertiary font-bold text-sm shadow-lg active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? "Verifying..." : (
              <><span>Confirm & Continue</span><span className="material-symbols-outlined text-[18px]">check_circle</span></>
            )}
          </button>
        </form>
      </main>
    </div>
  );
};

export default OTPVerificationPage;
