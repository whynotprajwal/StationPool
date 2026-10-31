import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { apiService } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/Toast";
import Navbar from "../components/Navbar";

const DEMO_ACCOUNTS = [
  {
    mobile: "+919876543220",
    name: "Tanvi Joshi",
    role: "Rider demo",
    detail: "Has trip history & an active pool",
    icon: "hiking",
    tint: "text-tertiary",
  },
  {
    mobile: "+919876543210",
    name: "Rahul Deshmukh",
    role: "Driver demo",
    detail: "Verified car owner publishing rides",
    icon: "directions_car",
    tint: "text-secondary",
  },
];

export const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { toast } = useToast();
  const fromLocation = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname || "/home";

  const [authMode, setAuthMode] = useState<"signup" | "signin">("signup");
  const [role, setRole] = useState<"passenger" | "driver">("passenger");
  const [fullName, setFullName] = useState("");
  const [digits, setDigits] = useState("");
  const [email, setEmail] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMsg("");

    if (digits.replace(/\D/g, "").length !== 10) {
      setErrorMsg("Enter a valid 10-digit mobile number");
      return;
    }
    const formattedPhone = `+91${digits.replace(/\D/g, "").slice(-10)}`;

    setIsLoading(true);
    try {
      if (authMode === "signup") {
        if (!fullName.trim()) {
          setErrorMsg("Please enter your name");
          return;
        }
        const res = await apiService.register({
          full_name: fullName.trim(),
          mobile_number: formattedPhone,
          email: email.trim() || undefined,
          role,
        });
        navigate("/verify-otp", {
          state: {
            mobileNumber: formattedPhone,
            demoOtp: res.demo_otp || "123456",
            role,
            fullName: fullName.trim(),
            redirectTo: fromLocation,
          },
        });
      } else {
        const res = await apiService.requestOtp(formattedPhone);
        navigate("/verify-otp", {
          state: {
            mobileNumber: formattedPhone,
            demoOtp: res.demo_otp || "123456",
            redirectTo: fromLocation,
          },
        });
      }
    } catch (err: unknown) {
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setErrorMsg(detail || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemo = async (mobile: string) => {
    setDemoLoading(mobile);
    setErrorMsg("");
    try {
      const res = await apiService.demoLogin(mobile);
      login(res.access_token, res.user);
      toast("Demo session started", `Welcome back, ${res.user.full_name}.`, "success");
      navigate("/home");
    } catch {
      setErrorMsg("Could not start the demo. Is the backend running on port 8000?");
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col pb-10">
      <Navbar title="StationPool" showBack />

      <main className="flex flex-1 flex-col gap-5 px-5 pt-20">
        <div className="animate-fadeInUp">
          <p className="eyebrow">Commuter access</p>
          <h1 className="mt-1.5 text-2xl font-extrabold tracking-tight text-on-surface">
            {authMode === "signup" ? "Join the metro pool" : "Welcome back"}
          </h1>
          <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
            {authMode === "signup"
              ? "One mobile number. Verified co-commuters. No passwords."
              : "We'll text you a one-time code to sign back in."}
          </p>
        </div>

        {/* Mode switch */}
        <div className="grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-surface-container-lowest/70 p-1">
          {(
            [
              { value: "signup", label: "Create account" },
              { value: "signin", label: "Sign in" },
            ] as const
          ).map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => {
                setAuthMode(item.value);
                setErrorMsg("");
              }}
              className={`relative rounded-xl py-2.5 text-xs font-extrabold transition-all ${
                authMode === item.value
                  ? "bg-brand-gradient-soft text-secondary shadow-[inset_0_0_0_1px_rgba(148,204,255,0.3)]"
                  : "text-on-surface-variant"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Role cards */}
        {authMode === "signup" && (
          <div className="grid grid-cols-2 gap-2.5">
            {(
              [
                {
                  value: "passenger",
                  icon: "hiking",
                  label: "I need a ride",
                  sub: "Match a feeder seat",
                },
                {
                  value: "driver",
                  icon: "directions_car",
                  label: "I'm driving",
                  sub: "Share empty seats",
                },
              ] as const
            ).map((item) => {
              const active = role === item.value;
              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setRole(item.value)}
                  className={`relative flex flex-col items-start gap-1 rounded-2xl border p-3.5 text-left transition-all ${
                    active
                      ? "border-secondary/50 bg-secondary/[0.08] shadow-glow"
                      : "border-white/10 bg-surface-container/60 opacity-70 hover:opacity-100"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                      active ? "bg-secondary/20 text-secondary" : "bg-white/5 text-on-surface-variant"
                    }`}
                  >
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  </span>
                  <span className="mt-1 text-xs font-extrabold text-on-surface">{item.label}</span>
                  <span className="text-[10px] text-on-surface-variant">{item.sub}</span>
                  {active && (
                    <span className="absolute right-2.5 top-2.5 material-symbols-outlined fill text-[18px] text-secondary">
                      check_circle
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {errorMsg && (
          <div className="flex items-start gap-2 rounded-2xl border border-error/30 bg-error-container/50 px-3.5 py-2.5 text-xs font-semibold text-error animate-shake">
            <span className="material-symbols-outlined text-[16px]">error</span>
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {authMode === "signup" && (
            <div>
              <label className="label mb-1.5 block">Full name</label>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
                  person
                </span>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  placeholder="Pooja Deshmukh"
                  className="field pl-11"
                />
              </div>
            </div>
          )}

          <div>
            <label className="label mb-1.5 block">Mobile number</label>
            <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-surface-container-low/80 px-3 py-1 transition-all focus-within:border-secondary/70 focus-within:bg-surface-container/90 focus-within:shadow-[0_0_0_4px_rgba(148,204,255,0.12)]">
              <span className="flex items-center gap-1.5 rounded-xl bg-white/5 px-2.5 py-2 font-mono text-xs font-bold text-on-surface-variant">
                <span className="text-[11px]">🇮🇳</span> +91
              </span>
              <input
                type="tel"
                inputMode="numeric"
                required
                maxLength={10}
                value={digits}
                onChange={(event) => setDigits(event.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="98765 43210"
                className="w-full bg-transparent py-2.5 font-mono text-sm tracking-wide text-on-surface outline-none"
              />
              {digits.length === 10 && (
                <span className="material-symbols-outlined fill text-[18px] text-tertiary">
                  check_circle
                </span>
              )}
            </div>
            <p className="mt-1.5 px-1 text-[10px] text-on-surface-variant/70">
              In development the OTP is always <span className="font-mono text-secondary">123456</span>.
            </p>
          </div>

          {authMode === "signup" && (
            <div>
              <label className="label mb-1.5 block">Work email (optional)</label>
              <div className="relative">
                <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">
                  alternate_email
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@company.com"
                  className="field pl-11"
                />
              </div>
            </div>
          )}

          {authMode === "signup" && (
            <label className="flex cursor-pointer items-start gap-2.5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3">
              <span
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all ${
                  agreeTerms
                    ? "border-tertiary/60 bg-tertiary/20 text-tertiary"
                    : "border-white/20 bg-transparent text-transparent"
                }`}
              >
                <span className="material-symbols-outlined text-[14px]">check</span>
              </span>
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(event) => setAgreeTerms(event.target.checked)}
                className="sr-only"
              />
              <span className="text-[11px] leading-relaxed text-on-surface-variant">
                I agree to the StationPool commuter safety guidelines and shared-ride code of
                conduct.
              </span>
            </label>
          )}

          <button
            type="submit"
            disabled={isLoading || (authMode === "signup" && !agreeTerms)}
            className="btn-primary mt-1"
          >
            {isLoading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink/70 border-t-transparent" />
                Sending code…
              </>
            ) : (
              <>
                {authMode === "signup" ? "Continue" : "Send sign-in code"}
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </>
            )}
          </button>
        </form>

        <div className="flex items-center gap-3">
          <span className="h-px flex-1 bg-white/10" />
          <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-on-surface-variant/60">
            or try a demo account
          </span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <div className="flex flex-col gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.mobile}
              type="button"
              onClick={() => handleDemo(account.mobile)}
              disabled={demoLoading !== null}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-surface-container/60 p-3 text-left transition-all hover:border-secondary/30 hover:bg-surface-container-high/70 disabled:opacity-60"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/5">
                <span className={`material-symbols-outlined text-[19px] ${account.tint}`}>
                  {account.icon}
                </span>
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1.5">
                  <span className="text-xs font-extrabold text-on-surface">{account.role}</span>
                  <span className="rounded-full bg-white/5 px-1.5 py-0.5 text-[9px] font-bold text-on-surface-variant">
                    {account.name}
                  </span>
                </span>
                <span className="mt-0.5 block truncate text-[10px] text-on-surface-variant">
                  {account.detail}
                </span>
              </span>
              {demoLoading === account.mobile ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-secondary border-t-transparent" />
              ) : (
                <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                  arrow_forward
                </span>
              )}
            </button>
          ))}
        </div>

        <p className="text-center text-[11px] text-on-surface-variant">
          {authMode === "signup" ? "Already pooling with us? " : "New to StationPool? "}
          <button
            type="button"
            onClick={() => {
              setAuthMode(authMode === "signup" ? "signin" : "signup");
              setErrorMsg("");
            }}
            className="font-bold text-secondary hover:underline"
          >
            {authMode === "signup" ? "Sign in" : "Create account"}
          </button>
        </p>
      </main>
    </div>
  );
};

export default SignUpPage;
