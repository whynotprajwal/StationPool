import React, { useState } from "react";

interface SOSModalProps {
  onClose: () => void;
}

export const SOSModal: React.FC<SOSModalProps> = ({ onClose }) => {
  const [sosTriggered, setSosTriggered] = useState(false);

  const handleTriggerSOS = () => {
    setSosTriggered(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-surface-container-high border border-error/30 rounded-2xl p-6 max-w-md w-full shadow-2xl flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-error">
            <span className="material-symbols-outlined text-[28px] animate-pulse">emergency</span>
            <h2 className="font-headline-md text-xl font-bold">Emergency Assistance</h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-highest"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {sosTriggered ? (
          <div className="bg-error-container/40 border border-error/60 rounded-xl p-4 text-center flex flex-col gap-2">
            <span className="material-symbols-outlined text-error text-[40px] animate-bounce mx-auto">
              notifications_active
            </span>
            <p className="font-bold text-on-error-container text-base">
              SOS Broadcast Active!
            </p>
            <p className="text-xs text-on-surface-variant">
              Your GPS coordinates and ride details have been dispatched to Pune Police (112) and Pune Metro Security desk at Nal Stop.
            </p>
          </div>
        ) : (
          <p className="text-sm text-on-surface-variant">
            StationPool is integrated with Pune Metro Security and emergency response lines.
          </p>
        )}

        {/* Speed dials */}
        <div className="flex flex-col gap-2.5">
          <a
            href="tel:112"
            className="flex items-center justify-between p-3.5 rounded-xl bg-error-container text-error hover:brightness-110 font-bold transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[22px]">local_police</span>
              <span>National Police Helpline (112)</span>
            </div>
            <span className="material-symbols-outlined">call</span>
          </a>

          <a
            href="tel:18002677863"
            className="flex items-center justify-between p-3.5 rounded-xl bg-surface-container-highest text-secondary hover:bg-surface-bright transition-all"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[22px]">directions_subway</span>
              <span>Pune Metro Helpline (1800-267-7863)</span>
            </div>
            <span className="material-symbols-outlined">call</span>
          </a>
        </div>

        {!sosTriggered && (
          <button
            onClick={handleTriggerSOS}
            className="w-full py-3.5 rounded-xl bg-error text-on-error font-bold uppercase tracking-wider shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
          >
            <span className="material-symbols-outlined text-[20px]">sos</span>
            Broadcast Silent SOS with Live GPS
          </button>
        )}

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-surface-container text-on-surface-variant text-sm hover:text-on-surface transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default SOSModal;
