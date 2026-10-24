import React from "react";
import { useNavigate, useLocation } from "react-router-dom";

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: "Transit", icon: "confirmation_number", path: "/home" },
    { label: "Radar Match", icon: "radar", path: "/match" },
    { label: "Publish", icon: "add_circle", path: "/driver/publish" },
    { label: "Activity", icon: "shield", path: "/activity" },
  ];

  const isActive = (path: string) => {
    if (path === "/home" && (location.pathname === "/" || location.pathname === "/home")) return true;
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface-container-low/95 backdrop-blur-xl border-t border-surface-container-high/40 pb-safe">
      <div className="max-w-2xl mx-auto flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex-1 flex flex-col items-center justify-center py-1 transition-all ${
                active ? "text-tertiary font-bold" : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span
                className={`material-symbols-outlined text-[24px] ${active ? "scale-110" : ""}`}
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {item.icon}
              </span>
              <span className="text-[11px] font-label-ui mt-0.5 tracking-tight">{item.label}</span>
              {active && <span className="w-1 h-1 rounded-full bg-tertiary mt-0.5"></span>}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
