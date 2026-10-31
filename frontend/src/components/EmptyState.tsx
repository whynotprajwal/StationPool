import React from "react";

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  tone?: "secondary" | "tertiary";
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = "travel_explore",
  title,
  description,
  actionLabel,
  onAction,
  tone = "secondary",
}) => {
  const toneClass =
    tone === "tertiary"
      ? "text-tertiary bg-tertiary/10 border-tertiary/20"
      : "text-secondary bg-secondary/10 border-secondary/20";

  return (
    <div className="glass-card flex flex-col items-center gap-3 px-6 py-8 text-center">
      <div className={`flex h-14 w-14 items-center justify-center rounded-2xl border ${toneClass}`}>
        <span className="material-symbols-outlined text-[28px]">{icon}</span>
      </div>
      <div>
        <p className="text-sm font-extrabold text-on-surface">{title}</p>
        <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">{description}</p>
      </div>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary mt-1 max-w-[240px] py-2.5 text-xs">
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
