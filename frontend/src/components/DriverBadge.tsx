import React from "react";
import type { DriverSummary } from "../types";

interface DriverBadgeProps {
  driver?: DriverSummary;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
  onCall?: () => void;
  showCall?: boolean;
}

const sizeMap = {
  sm: { avatar: "h-9 w-9 text-sm", name: "text-sm", sub: "text-[11px]" },
  md: { avatar: "h-11 w-11 text-base", name: "text-sm", sub: "text-[11px]" },
  lg: { avatar: "h-14 w-14 text-lg", name: "text-base", sub: "text-xs" },
};

export const DriverBadge: React.FC<DriverBadgeProps> = ({
  driver,
  subtitle,
  size = "md",
  onCall,
  showCall = true,
}) => {
  const sizes = sizeMap[size];
  const name = driver?.full_name || "Verified Commuter";
  const initial = name.trim().charAt(0).toUpperCase() || "S";

  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative shrink-0">
          <div
            className={`flex ${sizes.avatar} items-center justify-center rounded-2xl bg-brand-gradient-soft font-extrabold text-secondary ring-1 ring-secondary/30`}
          >
            {initial}
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-surface">
            <span className="material-symbols-outlined fill text-[14px] text-tertiary">verified</span>
          </span>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className={`truncate font-extrabold text-on-surface ${sizes.name}`}>{name}</span>
            <span className="flex items-center gap-0.5 rounded-full bg-white/5 px-1.5 py-0.5 text-[10px] font-bold text-amber-400">
              <span className="material-symbols-outlined fill text-[12px]">star</span>
              {(driver?.rating || 4.9).toFixed(1)}
            </span>
          </div>
          <p className={`truncate text-on-surface-variant ${sizes.sub}`}>
            {subtitle ||
              [driver?.vehicle_model, driver?.vehicle_registration].filter(Boolean).join(" · ") ||
              "Pune Metro verified"}
          </p>
        </div>
      </div>

      {showCall && (
        <a
          href={`tel:${driver?.mobile_number || "+919876543210"}`}
          onClick={(event) => {
            if (onCall) {
              event.preventDefault();
              onCall();
            }
          }}
          aria-label={`Call ${name}`}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-secondary/25 bg-secondary/10 text-secondary transition-all hover:bg-secondary/20 active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">call</span>
        </a>
      )}
    </div>
  );
};

export default DriverBadge;
