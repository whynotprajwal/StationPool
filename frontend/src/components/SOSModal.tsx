import React, { useEffect, useState } from "react";

interface SOSModalProps {
  onClose: () => void;
}

type Phase = "idle" | "arming" | "active";

const CONTACTS = [
  {
    href: "tel:112",
    icon: "local_police",
    title: "Police emergency",
    sub: "112 · immediate response",
    tone: "bg-error-container/50 text-error border-error/25",
  },
  {
    href: "tel:18002677863",
    icon: "directions_subway",
    title: "Pune Metro control",
    sub: "1800-267-7863 · station desk",
    tone: "bg-secondary/10 text-secondary border-secondary/25",
  },
  {
    href: "tel:1091",
    icon: "support_agent",
    title: "Women's helpline",
    sub: "1091 · 24×7 counselling",
    tone: "bg-tertiary/10 text-tertiary border-tertiary/25",
  },
];

export const SOSModal: React.FC<SOSModalProps> = ({ onClose }) => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (phase !== "arming") return;
    if (countdown <= 0) {
      setPhase("active");
      return;
    }
    const timer = window.setTimeout(() => setCountdown((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [phase, countdown]);

  useEffect(() => {
    if (phase === "active" && navigator.vibrate) navigator.vibrate([200, 100, 200]);
  }, [phase]);

  const arm = () => {
    setCountdown(3);
    setPhase("arming");
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center">
      <div
        className="absolute inset-0 bg-ink/85 backdrop-blur-md animate-fadeIn"
        onClick={phase === "arming" ? undefined : onClose}
      />

      <div className="relative w-full max-w-[480px] animate-slideUp rounded-t-[28px] border-t border-white/10 bg-surface-container/95 p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-float backdrop-blur-2xl">
        <div className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-white/20" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-error-container/50 text-error ring-1 ring-error/30">
              {phase === "active" && (
                <span className="absolute inset-0 animate-ping rounded-2xl bg-error/30" />
              )}
              <span className="material-symbols-outlined fill relative text-[24px]">emergency</span>
            </span>
            <div>
              <p className="eyebrow text-error/80">Silent SOS</p>
              <h2 className="mt-0.5 text-base font-extrabold tracking-tight text-on-surface">
                {phase === "active" ? "Help is on the way" : "Emergency assistance"}
              </h2>
            </div>
          </div>
          <button onClick={onClose} className="icon-btn h-8 w-8" aria-label="Close SOS">
            <span className="material-symbols-outlined text-[17px]">close</span>
          </button>
        </div>

        {phase === "active" ? (
          <div className="mt-4 flex flex-col items-center rounded-2xl border border-error/30 bg-error-container/25 px-4 py-5 text-center">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-error/25" />
              <span className="absolute inset-2 animate-pulse rounded-full border border-error/40" />
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-error text-on-error shadow-glow">
                <span className="material-symbols-outlined fill text-[26px]">sos</span>
              </span>
            </div>
            <p className="mt-3 text-sm font-extrabold text-on-error-container">SOS broadcast active</p>
            <p className="mt-1 text-[11px] leading-relaxed text-on-surface-variant">
              Live GPS and trip details are being shared with Pune Police (112) and the nearest
              metro security desk. Keep your phone unlocked.
            </p>
            <div className="mt-3 flex items-center gap-1.5 rounded-full bg-white/5 px-3 py-1 font-mono text-[9px] text-on-surface-variant">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-error" />
              Transmitting location every 10s
            </div>
          </div>
        ) : phase === "arming" ? (
          <div className="mt-4 flex flex-col items-center rounded-2xl border border-error/30 bg-error-container/20 px-4 py-5 text-center">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <span className="absolute inset-0 animate-ping rounded-full bg-error/20" />
              <span className="relative font-mono text-4xl font-extrabold text-error">{countdown}</span>
            </div>
            <p className="mt-2 text-xs font-extrabold text-on-error-container">Broadcasting in {countdown}s</p>
            <p className="mt-1 text-[10px] text-on-surface-variant">
              Tap cancel if this was accidental.
            </p>
            <button
              onClick={() => {
                setPhase("idle");
                setCountdown(3);
              }}
              className="btn-ghost mt-3 border-error/30 px-5 py-2 text-error"
            >
              Cancel broadcast
            </button>
          </div>
        ) : (
          <p className="mt-3 text-[11px] leading-relaxed text-on-surface-variant">
            A silent alert sends your live GPS, ride and driver details to emergency responders
            without sounding an alarm on your phone.
          </p>
        )}

        {phase !== "arming" && (
          <div className="mt-4 flex flex-col gap-2">
            {CONTACTS.map((contact) => (
              <a
                key={contact.href}
                href={contact.href}
                className={`flex items-center justify-between rounded-2xl border px-3.5 py-3 transition-all active:scale-[0.98] ${contact.tone}`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined fill text-[20px]">{contact.icon}</span>
                  <div>
                    <p className="text-[11px] font-extrabold">{contact.title}</p>
                    <p className="text-[9px] text-on-surface-variant">{contact.sub}</p>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[18px]">call</span>
              </a>
            ))}
          </div>
        )}

        {phase === "idle" && (
          <button
            onClick={arm}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-error px-4 py-3.5 text-xs font-extrabold uppercase tracking-[0.08em] text-on-error shadow-glow transition-all hover:brightness-110 active:scale-[0.98]"
          >
            <span className="material-symbols-outlined fill text-[20px]">sos</span>
            Broadcast silent SOS
          </button>
        )}

        {phase === "active" && (
          <button onClick={onClose} className="btn-ghost mt-3 w-full py-3">
            I'm safe · stand down
          </button>
        )}

        <p className="mt-3 text-center text-[9px] leading-relaxed text-on-surface-variant/60">
          Demo build — alerts are simulated and no real dispatch is made.
        </p>
      </div>
    </div>
  );
};

export default SOSModal;
