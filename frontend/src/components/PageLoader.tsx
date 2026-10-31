import React from "react";

export const PageLoader: React.FC<{ label?: string }> = ({ label = "Syncing metro feed…" }) => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-6">
      <div className="flex flex-col items-center gap-4">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <span className="absolute inset-0 animate-ping rounded-full border border-secondary/30" />
          <span className="absolute inset-2 rounded-full border border-secondary/20" />
          <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-gradient shadow-glow">
            <span className="material-symbols-outlined text-[22px] text-ink">directions_subway</span>
          </span>
        </div>
        <div className="text-center">
          <p className="text-sm font-extrabold text-on-surface">StationPool</p>
          <p className="mt-1 text-[11px] font-mono text-on-surface-variant">{label}</p>
        </div>
        <div className="h-1 w-40 overflow-hidden rounded-full bg-white/10">
          <div className="h-full w-1/2 animate-[shimmer_1.2s_linear_infinite] rounded-full bg-brand-gradient" />
        </div>
      </div>
    </div>
  );
};

export default PageLoader;
