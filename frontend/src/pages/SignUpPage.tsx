import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiService } from "../api/client";
import Navbar from "../components/Navbar";

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fromLocation = (location.state as any)?.from?.pathname || "/home";

  const [authMode, setAuthMode] = useState<"signup" | "signin">("signup");
  const [role, setRole] = useState<"passenger" | "driver">("passenger");
  const [fullName, setFullName] = useState("");
  const [mobileNumber, setMobileNumber] = useState("+91");
  const [email, setEmail] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    let formattedPhone = mobileNumber.trim();
    if (!formattedPhone.startsWith("+91")) {
      formattedPhone = "+91" + formattedPhone.replace(/^0+/, "");
    }
    if (formattedPhone.length < 12) {
      setErrorMsg("Please enter a valid 10-digit mobile number");
      return;
    }
    setIsLoading(true);
    try {
      if (authMode === "signup") {
        if (!fullName.trim()) { setErrorMsg("Please enter your name"); setIsLoading(false); return; }
        const res = await apiService.register({
          full_name: fullName.trim(),
          mobile_number: formattedPhone,
          email: email.trim() || undefined,
          role,
        });
        navigate("/verify-otp", { state: { mobileNumber: formattedPhone, demoOtp: res.demo_otp || "123456", role, fullName: fullName.trim(), redirectTo: fromLocation } });
      } else {
        const res = await apiService.requestOtp(formattedPhone);
        navigate("/verify-otp", { state: { mobileNumber: formattedPhone, demoOtp: res.demo_otp || "123456", redirectTo: fromLocation } });
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col pb-12">
      <Navbar title="StationPool" showBack={true} />

      <main className="flex-1 flex flex-col max-w-md mx-auto w-full pt-20 px-5 gap-6">

        {/* Mode Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-surface-container-low rounded-xl border border-surface-container-high/60">
          {(["signup", "signin"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => { setAuthMode(mode); setErrorMsg(""); }}
              className={`py-2.5 rounded-lg text-xs font-bold transition-all ${
                authMode === mode
                  ? "bg-surface-container-high text-secondary shadow-sm"
                  : "text-on-surface-variant"
              }`}
            >
              {mode === "signup" ? "Create Account" : "Sign In"}
            </button>
          ))}
        </div>

        {/* Title */}
        <div>
          <h1 className="text-xl font-extrabold text-on-surface">
            {authMode === "signup" ? "Join StationPool" : "Welcome back"}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {authMode === "signup"
              ? "Set up your commuter profile to find feeder rides."
              : "Enter your mobile number to get a sign-in OTP."}
          </p>
        </div>

        {/* Role Selector (signup only) */}
        {authMode === "signup" && (
          <div className="grid grid-cols-2 gap-2">
            {([
              { val: "passenger", icon: "directions_walk", label: "Rider", sub: "Find a ride" },
              { val: "driver",    icon: "directions_car",  label: "Driver", sub: "Offer seats" },
            ] as const).map(({ val, icon, label, sub }) => (
              <button
                key={val}
                type="button"
                onClick={() => setRole(val)}
                className={`flex flex-col items-start p-3.5 rounded-xl border transition-all ${
                  role === val
                    ? "border-secondary bg-surface-container-high"
                    : "border-surface-container-high bg-surface-container-low opacity-60"
                }`}
              >
                <span className="material-symbols-outlined text-secondary text-[22px] mb-1">{icon}</span>
                <span className="font-bold text-sm text-on-surface">{label}</span>
                <span className="text-[11px] text-on-surface-variant">{sub}</span>
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        {errorMsg && (
          <div className="px-3 py-2.5 rounded-xl bg-error-container text-error text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[16px]">error</span>
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {authMode === "signup" && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-on-surface-variant font-semibold">Full Name</label>
              <input
                type="text" required value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Pooja Deshmukh"
                className="w-full h-12 px-4 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-secondary"
              />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-xs text-on-surface-variant font-semibold">Mobile Number</label>
            <input
              type="tel" required value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full h-12 px-4 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface font-mono text-sm focus:outline-none focus:border-secondary"
            />
          </div>

          {authMode === "signup" && (
            <div className="flex flex-col gap-1">
              <label className="text-xs text-on-surface-variant font-semibold">Work Email <span className="font-normal">(optional)</span></label>
              <input
                type="email" value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full h-12 px-4 rounded-xl bg-surface-container-low border border-surface-container-high text-on-surface text-sm focus:outline-none focus:border-secondary"
              />
            </div>
          )}

          {authMode === "signup" && (
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox" id="terms" checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-secondary"
              />
              <span className="text-xs text-on-surface-variant leading-relaxed">
                I agree to the StationPool commuter safety guidelines.
              </span>
            </label>
          )}

          <button
            type="submit"
            disabled={isLoading || (authMode === "signup" && !agreeTerms)}
            className="w-full py-4 mt-1 rounded-xl bg-gradient-to-r from-secondary to-tertiary text-on-tertiary font-bold text-sm shadow-lg active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? "Sending OTP..." : (
              <>{authMode === "signup" ? "Continue" : "Get OTP"} <span className="material-symbols-outlined text-[18px]">arrow_forward</span></>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-on-surface-variant">
          {authMode === "signup" ? "Already have an account? " : "New to StationPool? "}
          <button
            type="button"
            onClick={() => { setAuthMode(authMode === "signup" ? "signin" : "signup"); setErrorMsg(""); }}
            className="text-secondary font-bold hover:underline"
          >
            {authMode === "signup" ? "Sign In" : "Create account"}
          </button>
        </p>
      </main>
    </div>
  );
};

export default SignUpPage;
