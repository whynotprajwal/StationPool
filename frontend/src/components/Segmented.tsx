import React from "react";

export interface SegmentOption<T extends string> {
  value: T;
  label: string;
  icon?: string;
}

interface SegmentedProps<T extends string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
}

export const Segmented = <T extends string>({
  options,
  value,
  onChange,
  size = "md",
}: SegmentedProps<T>) => {
  return (
    <div className="flex gap-1 rounded-2xl border border-white/10 bg-surface-container-lowest/80 p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`relative flex flex-1 items-center justify-center gap-1.5 rounded-xl font-bold transition-all duration-200 ${
              size === "sm" ? "py-2 text-[11px]" : "py-2.5 text-xs"
            } ${
              active
                ? "bg-brand-gradient-soft text-secondary shadow-[inset_0_0_0_1px_rgba(148,204,255,0.35)]"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {option.icon && (
              <span
                className="material-symbols-outlined text-[16px]"
                style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
              >
                {option.icon}
              </span>
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
};

export default Segmented;
