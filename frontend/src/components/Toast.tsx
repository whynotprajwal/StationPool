import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastTone = "success" | "error" | "info";

interface ToastItem {
  id: number;
  title: string;
  message?: string;
  tone: ToastTone;
}

interface ToastContextValue {
  toast: (title: string, message?: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const toneMeta: Record<ToastTone, { icon: string; ring: string; text: string; bg: string }> = {
  success: {
    icon: "check_circle",
    ring: "border-tertiary/40",
    text: "text-tertiary",
    bg: "bg-tertiary-container/40",
  },
  error: {
    icon: "error",
    ring: "border-error/40",
    text: "text-error",
    bg: "bg-error-container/50",
  },
  info: {
    icon: "info",
    ring: "border-secondary/40",
    text: "text-secondary",
    bg: "bg-secondary-container/30",
  },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback(
    (title: string, message?: string, tone: ToastTone = "info") => {
      const id = Date.now() + Math.round(Math.random() * 1000);
      setItems((prev) => [...prev.slice(-2), { id, title, message, tone }]);
      window.setTimeout(() => dismiss(id), 3600);
    },
    [dismiss]
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-0 z-[80] flex flex-col items-center gap-2 px-4 pt-[max(1rem,env(safe-area-inset-top))]">
        {items.map((item) => {
          const meta = toneMeta[item.tone];
          return (
            <div
              key={item.id}
              className={`pointer-events-auto flex w-full max-w-[420px] items-start gap-3 rounded-2xl border ${meta.ring} ${meta.bg} px-4 py-3 text-left shadow-float backdrop-blur-xl animate-slideUp`}
            >
              <span className={`material-symbols-outlined fill mt-0.5 text-[20px] ${meta.text}`}>
                {meta.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-on-surface">{item.title}</p>
                {item.message && (
                  <p className="mt-0.5 text-xs leading-relaxed text-on-surface-variant">{item.message}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(item.id)}
                aria-label="Dismiss notification"
                className="rounded-full p-1 text-on-surface-variant transition hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
};

export default ToastProvider;
