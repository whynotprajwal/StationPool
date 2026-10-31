import React from "react";

interface StatTileProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  icon?: string;
  tone?: "secondary" | "tertiary" | "neutral" | "amber";
  className?: string;
}

const tones = {
  secondary: "text-secondary bg-secondary/10 border-secondary/20",
  tertiary: "text-tertiary bg-tertiary/10 border-tertiary/20",
  amber: "text-amber-400 bg-amber-400/10 border-amber-400/20",
  neutral: "text-on-surface bg-white/5 border-white/10",
};

export const StatTile: React.FC<StatTileProps> = ({
  label,
  value,
  hint,
  icon,
  tone = "neutral",
  className = "",
}) => {
  return (
    <div className={`glass-panel p-3.5 ${className}`}>
      <div className="flex items-center gap-2">
        {icon && (
          <span className={`flex h-7 w-7 items-center justify-center rounded-lg border ${tones[tone]}`}>
            <span className="material-symbols-outlined text-[15px]">{icon}</span>
          </span>
        )}
        <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-on-surface-variant/70">
          {label}
        </span>
      </div>
      <p className="mt-2 font-mono text-xl font-extrabold tracking-tight text-on-surface">{value}</p>
      {hint && <p className={`mt-0.5 text-[10px] font-semibold ${tones[tone].split(" ")[0]}`}>{hint}</p>}
    </div>
  );
};

export default StatTile;
