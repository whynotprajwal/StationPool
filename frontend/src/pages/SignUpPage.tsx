import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { apiService } from "../api/client";
import Navbar from "../components/Navbar";

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const fromLocation = (location.state as any)?.from?.pathname || "/home";

  // Toggle between 'signup' and 'signin'
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
        if (!fullName.trim()) {
          setErrorMsg("Please enter your legal name");
          setIsLoading(false);
          return;
        }

        const res = await apiService.register({
          full_name: fullName.trim(),
          mobile_number: formattedPhone,
          email: email.trim() || undefined,
          role: role,
        });

        navigate("/verify-otp", {
          state: {
            mobileNumber: formattedPhone,
            demoOtp: res.demo_otp || "123456",
            role: role,
            fullName: fullName.trim(),
            redirectTo: fromLocation,
          },
        });
      } else {
        // Sign In mode: request OTP for existing user
        const res = await apiService.requestOtp(formattedPhone);

        navigate("/verify-otp", {
          state: {
            mobileNumber: formattedPhone,
            demoOtp: res.demo_otp || "123456",
            redirectTo: fromLocation,
          },
        });
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(
        err.response?.data?.detail || "Authentication request failed. Please check details."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col pb-12">
      <Navbar title="StationPool" subtitle="Commuter Identification" showBack={true} />

      <main className="flex-1 flex flex-col max-w-md mx-auto w-full pt-20 px-4">
        {/* Live Radar Pulse Banner */}
        <div className="w-full mb-4 px-3 py-2.5 rounded-xl bg-surface-container-low flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-tertiary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-tertiary"></span>
            </span>
            <span className="font-label-ui text-xs text-tertiary tracking-wide uppercase font-bold">
              Pune Metro Identity Verification
            </span>
          </div>
          <span className="font-label-numeric-sm text-xs text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full font-mono">
            Zero Surge
          </span>
        </div>

        {/* Auth Mode Toggle Tabs (Sign Up vs Sign In) */}
        <div className="grid grid-cols-2 gap-2 p-1.5 bg-surface-container-lowest rounded-2xl mb-4 border border-surface-container-high/60">
          <button
            type="button"
            onClick={() => {
              setAuthMode("signup");
              setErrorMsg("");
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              authMode === "signup"
                ? "bg-surface-container-high text-secondary shadow-sm ring-1 ring-secondary/40"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">person_add</span>
            <span>New Commuter (Sign Up)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMode("signin");
              setErrorMsg("");
            }}
            className={`py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              authMode === "signin"
                ? "bg-surface-container-high text-secondary shadow-sm ring-1 ring-secondary/40"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">login</span>
            <span>Existing (Sign In)</span>
          </button>
        </div>

        {/* Header Card */}
        <div className="relative w-full rounded-2xl bg-surface-container-high p-5 mb-5 overflow-hidden shadow-md">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 rounded-full bg-secondary-container/20 blur-2xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-secondary">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span className="font-label-ui text-xs uppercase tracking-wider font-bold">
                {authMode === "signup" ? "Create Pune Metro Profile" : "Welcome Back Commuter"}
              </span>
            </div>
            <h1 className="font-headline-lg text-2xl font-extrabold text-on-surface tracking-tight">
              {authMode === "signup" ? "Join StationPool" : "Enter Mobile Number"}
            </h1>
            <p className="font-body-md text-sm text-on-surface-variant">
              {authMode === "signup"
                ? "Sign up once with your phone number and verify with OTP to access feeder rides."
                : "Enter your registered 10-digit mobile number to receive your sign-in OTP."}
            </p>
          </div>
        </div>

        {/* Role Selector Bento Tabs (only for Sign Up) */}
        {authMode === "signup" && (
          <div className="w-full mb-5">
            <div className="flex justify-between items-center mb-2 px-1">
              <span className="font-label-ui text-xs text-on-surface-variant uppercase tracking-wider font-semibold">
                Select Commute Mode
              </span>
              <span className="font-label-numeric-sm text-xs text-secondary font-mono">Switch anytime</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5 p-1 bg-surface-container-lowest rounded-2xl">
              <button
                type="button"
                onClick={() => setRole("passenger")}
                className={`flex flex-col text-left p-3.5 rounded-xl transition-all duration-200 shadow-sm ${
                  role === "passenger"
                    ? "bg-surface-container-high ring-1 ring-secondary/50"
                    : "bg-transparent opacity-65 hover:opacity-90"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="w-8 h-8 rounded-lg bg-secondary-container/40 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[20px]">directions_walk</span>
                  </div>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      role === "passenger" ? "bg-secondary" : "bg-transparent"
                    }`}
                  ></span>
                </div>
                <span className="font-headline-sm text-sm font-bold text-on-surface leading-snug">
                  Metro Rider
                </span>
                <span className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                  Need first/last-mile ride
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRole("driver")}
                className={`flex flex-col text-left p-3.5 rounded-xl transition-all duration-200 shadow-sm ${
                  role === "driver"
                    ? "bg-surface-container-high ring-1 ring-secondary/50"
                    : "bg-transparent opacity-65 hover:opacity-90"
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <div className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px]">directions_car</span>
                  </div>
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      role === "driver" ? "bg-secondary" : "bg-transparent"
                    }`}
                  ></span>
                </div>
                <span className="font-headline-sm text-sm font-bold text-on-surface leading-snug">
                  Vehicle Owner
                </span>
                <span className="font-body-sm text-xs text-on-surface-variant mt-0.5">
                  Offer vacant seats
                </span>
              </button>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="p-3 mb-4 rounded-xl bg-error-container text-error text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Elements */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4">
          {authMode === "signup" && (
            <div className="flex flex-col gap-1.5">
              <label className="font-label-ui text-xs text-on-surface-variant px-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">badge</span>
                Full Legal Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g., Pooja Deshmukh"
                className="w-full h-12 px-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline text-sm focus:bg-surface-container focus:outline-none border border-surface-container-high shadow-sm"
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="font-label-ui text-xs text-on-surface-variant px-1 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-primary">call</span>
              Mobile Number (receives SMS & WhatsApp OTP)
            </label>
            <input
              type="tel"
              required
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full h-12 px-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline font-mono text-sm focus:bg-surface-container focus:outline-none border border-surface-container-high shadow-sm"
            />
          </div>

          {authMode === "signup" && (
            <div className="flex flex-col gap-1.5">
              <label className="font-label-ui text-xs text-on-surface-variant px-1 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-primary">mail</span>
                Work Email (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pooja.d@techmahindra.com"
                className="w-full h-12 px-4 rounded-xl bg-surface-container-low text-on-surface placeholder:text-outline text-sm focus:bg-surface-container focus:outline-none border border-surface-container-high shadow-sm"
              />
            </div>
          )}

          {authMode === "signup" && (
            <div className="flex items-start gap-2.5 p-1 mt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-secondary focus:ring-secondary"
              />
              <label htmlFor="terms" className="text-xs text-on-surface-variant leading-relaxed">
                I agree to the StationPool Pune Metro Commuter Safety Guidelines and boarding verification terms.
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || (authMode === "signup" && !agreeTerms)}
            className="w-full py-4 mt-2 rounded-xl bg-gradient-to-r from-secondary to-tertiary text-on-tertiary font-headline-sm text-sm font-bold shadow-lg shadow-tertiary/20 active:scale-95 transition-all hover:brightness-105 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span>Sending Verification OTP...</span>
            ) : (
              <>
                <span>Continue to OTP Verification</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-xs text-on-surface-variant">
            {authMode === "signup" ? "Already have an account? " : "New to StationPool? "}
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === "signup" ? "signin" : "signup");
                setErrorMsg("");
              }}
              className="text-secondary font-bold hover:underline"
            >
              {authMode === "signup" ? "Sign In directly" : "Create new account"}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
};

export default SignUpPage;
