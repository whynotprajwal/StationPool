import React, { useEffect, useMemo, useState } from "react";

export interface SelectOption {
  value: string;
  label: string;
  sub?: string;
  icon?: string;
}

interface SelectSheetProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  sheetTitle?: string;
  icon?: string;
  accent?: "secondary" | "tertiary";
  searchable?: boolean;
}

export const SelectSheet: React.FC<SelectSheetProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search…",
  sheetTitle,
  icon = "expand_more",
  accent = "secondary",
  searchable = true,
}) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const current = options.find((option) => option.value === value);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter(
      (option) =>
        option.label.toLowerCase().includes(q) ||
        (option.sub || "").toLowerCase().includes(q)
    );
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const accentClasses =
    accent === "tertiary"
      ? "text-tertiary bg-tertiary-container/40 border-tertiary/25"
      : "text-secondary bg-secondary/15 border-secondary/25";

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setQuery("");
          setOpen(true);
        }}
        className="group flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-surface-container-low/80 px-4 py-3 text-left transition-all hover:border-secondary/40 hover:bg-surface-container/90"
      >
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${accentClasses}`}
        >
          <span className="material-symbols-outlined fill text-[18px]">
            {current?.icon || icon}
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[10px] font-bold uppercase tracking-[0.14em] text-on-surface-variant/70">
            {label}
          </span>
          <span className="block truncate text-sm font-bold text-on-surface">
            {current?.label || placeholder}
          </span>
          {current?.sub && (
            <span className="block truncate text-[11px] text-on-surface-variant">{current.sub}</span>
          )}
        </span>
        <span className="material-symbols-outlined text-[18px] text-on-surface-variant transition-transform group-hover:translate-y-0.5">
          expand_more
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center">
          <div
            className="absolute inset-0 bg-ink/80 backdrop-blur-sm animate-fadeIn"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-[480px] animate-slideUp rounded-t-[28px] border-t border-white/10 bg-surface-container/95 shadow-float backdrop-blur-2xl">
            <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-white/20" />
            <div className="flex items-center justify-between px-5 pt-4">
              <div>
                <p className="eyebrow">{label}</p>
                <h3 className="mt-0.5 text-lg font-extrabold text-on-surface">
                  {sheetTitle || "Choose"}
                </h3>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="icon-btn"
                aria-label="Close selector"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {searchable && (
              <div className="px-5 pt-3">
                <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-surface-container-low px-3 py-2.5">
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                    search
                  </span>
                  <input
                    autoFocus
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full bg-transparent text-sm text-on-surface outline-none"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="text-on-surface-variant"
                      aria-label="Clear search"
                    >
                      <span className="material-symbols-outlined text-[16px]">cancel</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="no-scrollbar max-h-[46vh] overflow-y-auto px-3 py-3">
              {filtered.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-on-surface-variant">
                  No matches for “{query}”
                </div>
              )}
              {filtered.map((option) => {
                const active = option.value === value;
                return (
                  <button
                    key={option.value}
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                    }}
                    className={`mb-1.5 flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition-all ${
                      active
                        ? "border-secondary/40 bg-secondary/10"
                        : "border-transparent hover:border-white/10 hover:bg-white/5"
                    }`}
                  >
                    <span
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                        active ? "bg-secondary/20 text-secondary" : "bg-white/5 text-on-surface-variant"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {option.icon || "location_on"}
                      </span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-bold text-on-surface">
                        {option.label}
                      </span>
                      {option.sub && (
                        <span className="block truncate text-[11px] text-on-surface-variant">
                          {option.sub}
                        </span>
                      )}
                    </span>
                    {active && (
                      <span className="material-symbols-outlined fill text-[20px] text-secondary">
                        check_circle
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <div className="h-[max(1rem,env(safe-area-inset-bottom))]" />
          </div>
        </div>
      )}
    </>
  );
};

export default SelectSheet;
