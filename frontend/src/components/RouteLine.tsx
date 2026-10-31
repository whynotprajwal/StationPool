import React from "react";

interface RouteLineProps {
  origin: string;
  destination: string;
  originSub?: string;
  destinationSub?: string;
  compact?: boolean;
}

export const RouteLine: React.FC<RouteLineProps> = ({
  origin,
  destination,
  originSub = "Metro exit",
  destinationSub = "Drop point",
  compact = false,
}) => {
  return (
    <div className={`flex items-stretch gap-3 ${compact ? "" : "py-1"}`}>
      <div className="flex flex-col items-center pt-1.5">
        <span className="relative flex h-3.5 w-3.5 items-center justify-center">
          <span className="absolute h-3.5 w-3.5 animate-pulseRing rounded-full bg-secondary/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-secondary shadow-[0_0_10px_rgba(148,204,255,0.8)]" />
        </span>
        <span className="my-1 w-px flex-1 border-l-2 border-dashed border-white/15" />
        <span className="h-2.5 w-2.5 rounded-full bg-tertiary shadow-[0_0_10px_rgba(78,222,163,0.8)]" />
      </div>
      <div className="flex flex-1 flex-col justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant/60">
            {originSub}
          </p>
          <p className="truncate text-sm font-extrabold text-on-surface">{origin}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant/60">
            {destinationSub}
          </p>
          <p className="truncate text-sm font-extrabold text-on-surface">{destination}</p>
        </div>
      </div>
    </div>
  );
};

export default RouteLine;
