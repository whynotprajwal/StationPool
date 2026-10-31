import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  { label: "Home", icon: "home", path: "/home" },
  { label: "Match", icon: "radar", path: "/match" },
  { label: "Publish", icon: "add_road", path: "/driver/publish", primary: true },
  { label: "Activity", icon: "insights", path: "/activity" },
];

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/home") return location.pathname === "/" || location.pathname === "/home";
    if (path === "/driver/publish") {
      return location.pathname.startsWith("/driver");
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <nav className="pointer-events-auto mx-3 flex w-full max-w-[440px] items-center justify-between gap-1 rounded-[26px] border border-white/10 bg-surface-container/90 p-2 shadow-dock backdrop-blur-2xl">
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          if (item.primary) {
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                aria-label={item.label}
                className="group relative -mt-6 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient shadow-glow-tertiary transition-transform active:scale-95"
              >
                <span className="material-symbols-outlined text-[24px] text-ink">
                  {item.icon}
                </span>
                <span className="absolute inset-0 rounded-2xl border border-white/30" />
              </button>
            );
          }
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 rounded-2xl py-2 transition-all ${
                active
                  ? "bg-brand-gradient-soft text-secondary"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span
                className="material-symbols-outlined text-[22px] transition-transform"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="text-[10px] font-bold tracking-tight">{item.label}</span>
              {active && (
                <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-secondary" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNav;
