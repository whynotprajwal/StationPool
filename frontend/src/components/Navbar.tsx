import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import SOSModal from "./SOSModal";

interface NavbarProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ title, subtitle, showBack = false }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isSOSOpen, setIsSOSOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 w-full z-50 pt-safe bg-surface/90 backdrop-blur-xl border-b border-surface-container-high/40 shadow-sm">
        <div className="max-w-2xl mx-auto h-16 px-4 flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center gap-3">
            {showBack ? (
              <button
                aria-label="Go back"
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-[24px]">arrow_back</span>
              </button>
            ) : (
              <div 
                onClick={() => navigate("/")}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-secondary-container to-tertiary flex items-center justify-center shadow-md">
                  <span className="material-symbols-outlined text-surface-container-lowest text-[22px] font-bold">
                    directions_subway
                  </span>
                </div>
              </div>
            )}

            <div className="flex flex-col">
              <span className="font-headline-sm text-base font-bold text-on-surface tracking-tight leading-tight">
                {title || "StationPool"}
              </span>
              <span className="font-label-numeric-sm text-xs text-tertiary flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                {subtitle || "Pune Metro Feeder Live"}
              </span>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSOSOpen(true)}
              aria-label="SOS Emergency Helpline"
              className="px-3 py-1.5 rounded-full bg-error-container/90 text-error font-label-ui text-xs font-bold flex items-center gap-1.5 shadow-[0_2px_8px_rgba(147,0,10,0.35)] hover:brightness-110 active:scale-95 transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">sos</span>
              <span>SOS</span>
            </button>

            {isAuthenticated && user ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => navigate("/activity")}
                  className="h-9 px-2.5 rounded-full bg-surface-container-high flex items-center gap-2 text-primary hover:ring-2 hover:ring-secondary/50 transition-all relative"
                  title={`${user.full_name} (${user.mobile_number})`}
                >
                  <div className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary flex items-center justify-center text-xs font-bold font-mono">
                    {user.full_name ? user.full_name[0].toUpperCase() : "U"}
                  </div>
                  <span className="text-xs font-bold hidden sm:inline text-on-surface max-w-[90px] truncate">
                    {user.full_name.split(" ")[0]}
                  </span>
                  <span className="w-2 h-2 bg-tertiary rounded-full ring-2 ring-surface"></span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-error hover:bg-error-container/30 transition-all"
                  title="Sign Out"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/signup")}
                className="px-3.5 py-1.5 rounded-xl bg-secondary text-surface-container-lowest font-headline-sm text-xs font-bold shadow hover:brightness-110 active:scale-95 transition-all flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">login</span>
                <span>Sign In</span>
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
