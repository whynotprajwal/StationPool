import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SOSModal from "./SOSModal";

interface NavbarProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  transparent?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  title,
  subtitle,
  showBack = false,
  transparent = false,
}) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/");
  };

  const initials = (user?.full_name || "S")
    .split(" ")
    .map((part) => part.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 pt-safe ${
          transparent ? "" : "border-b border-white/[0.06] bg-surface/80 backdrop-blur-2xl"
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-[480px] items-center justify-between px-4">
          <div className="flex min-w-0 items-center gap-2.5">
            {showBack ? (
              <button
                aria-label="Go back"
                onClick={() => navigate(-1)}
                className="icon-btn -ml-1"
              >
                <span className="material-symbols-outlined text-[22px]">arrow_back</span>
              </button>
            ) : (
              <button
                onClick={() => navigate(isAuthenticated ? "/home" : "/")}
                aria-label="StationPool home"
                className="group relative flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-gradient shadow-glow transition-transform active:scale-95"
              >
                <span className="material-symbols-outlined fill text-[22px] text-ink">
                  directions_subway
                </span>
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-tertiary" />
              </button>
            )}

            <div className="min-w-0">
              <h1 className="truncate text-[15px] font-extrabold leading-tight tracking-tight text-on-surface">
                {title || "StationPool"}
              </h1>
              <p className="flex items-center gap-1.5 truncate text-[10px] font-semibold text-tertiary/90">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-tertiary opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-tertiary" />
                </span>
                {subtitle || "Pune Metro feeder live"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setIsSOSOpen(true)}
              aria-label="SOS emergency helpline"
              className="group flex items-center gap-1.5 rounded-full border border-error/30 bg-error-container/40 px-2.5 py-1.5 text-error transition-all hover:bg-error-container/60 active:scale-95"
            >
              <span className="material-symbols-outlined text-[16px]">sos</span>
              <span className="text-[10px] font-extrabold tracking-wide">SOS</span>
            </button>

            {isAuthenticated && user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((open) => !open)}
                  className="flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 pl-1 pr-1.5 transition-all hover:border-secondary/40"
                  aria-label="Open profile menu"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient font-mono text-[11px] font-extrabold text-ink">
                    {initials}
                  </span>
                  <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                    {menuOpen ? "keyboard_arrow_up" : "keyboard_arrow_down"}
                  </span>
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-60 animate-fadeIn rounded-2xl border border-white/10 bg-surface-container/95 p-2 shadow-float backdrop-blur-2xl">
                    <div className="flex items-center gap-2.5 rounded-xl bg-white/5 p-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-gradient font-mono text-xs font-extrabold text-ink">
                        {initials}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-xs font-extrabold text-on-surface">
                          {user.full_name}
                        </p>
                        <p className="truncate font-mono text-[10px] text-on-surface-variant">
                          {user.mobile_number}
                        </p>
                      </div>
                    </div>
                    <div className="mt-1 flex flex-col">
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/activity");
                        }}
                        className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-on-surface-variant transition hover:bg-white/5 hover:text-on-surface"
                      >
                        <span className="material-symbols-outlined text-[18px]">shield_person</span>
                        Safety & activity
                      </button>
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          navigate("/driver/dashboard");
                        }}
                        className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-on-surface-variant transition hover:bg-white/5 hover:text-on-surface"
                      >
                        <span className="material-symbols-outlined text-[18px]">dashboard</span>
                        Driver hub
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-xs font-semibold text-error/90 transition hover:bg-error-container/30"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/signup")}
                className="flex items-center gap-1.5 rounded-full bg-brand-gradient px-3.5 py-2 text-[11px] font-extrabold text-ink shadow-glow active:scale-95"
              >
                <span className="material-symbols-outlined text-[15px]">login</span>
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      {isSOSOpen && <SOSModal onClose={() => setIsSOSOpen(false)} />}
    </>
  );
};

export default Navbar;
