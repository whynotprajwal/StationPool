import React, { useState } from "react";
import Navbar from "../components/Navbar";
import BottomNav from "../components/BottomNav";
import SOSModal from "../components/SOSModal";

export const ActivitySafetyCenterPage: React.FC = () => {
  const [isSOSOpen, setIsSOSOpen] = useState(false);

  const mockTrips = [
    {
      id: "t1",
      date: "Today, 09:25 AM",
      origin: "Ramwadi Metro Gate 2",
      destination: "EON IT Park Kharadi",
      driver: "Rahul Deshmukh (Honda City)",
      cost: "₹55",
      co2: "1.8 kg",
      status: "Completed",
    },
    {
      id: "t2",
      date: "Yesterday, 06:15 PM",
      origin: "EON IT Park Kharadi",
      destination: "Ramwadi Metro Station",
      driver: "Amit Kulkarni (Ather 450X)",
      cost: "₹40",
      co2: "1.2 kg",
      status: "Completed",
    },
    {
      id: "t3",
      date: "22 Oct, 08:50 AM",
      origin: "Vanaz Metro Station",
      destination: "Hinjawadi Phase 1",
      driver: "Priya Sharma (Hyundai Creta)",
      cost: "₹75",
      co2: "2.4 kg",
      status: "Completed",
    },
  ];

  return (
    <div className="bg-surface font-body-md text-on-surface min-h-screen flex flex-col pb-24">
      <Navbar title="Safety & Activity" subtitle="Pune Metro Feeder Club" />

      <main className="flex-1 flex flex-col max-w-md mx-auto w-full pt-20 px-4 space-y-4">
        {/* Bento Metrics Card: Fuel & Money Saved */}
        <section className="bg-primary-container text-on-primary rounded-2xl p-5 shadow-xl relative overflow-hidden border border-surface-container-highest">
          <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-secondary-container/20 blur-2xl pointer-events-none"></div>
          <div className="absolute -left-6 -top-6 w-36 h-36 rounded-full bg-tertiary-fixed-dim/15 blur-xl pointer-events-none"></div>

          <div className="relative z-10 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse"></span>
                <span className="font-label-ui text-xs text-primary font-bold uppercase tracking-wider">
                  Verified Green Rider
                </span>
              </div>
              <span className="font-label-numeric-sm text-xs text-primary bg-primary/20 px-2 py-0.5 rounded-full font-mono">
                30-Day Snapshot
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-1">
              <div>
                <p className="font-body-sm text-xs text-on-primary-container">
                  Fuel & Solo Auto Money Saved
                </p>
                <h2 className="font-display-lg text-3xl font-extrabold text-tertiary tracking-tight mt-0.5">
                  ₹4,920
                </h2>
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 text-tertiary bg-tertiary-container px-2 py-0.5 rounded-lg text-xs font-bold font-mono">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>
                  <span>+28%</span>
                </span>
                <p className="text-[10px] text-surface-variant mt-1">vs auto rickshaw</p>
              </div>
            </div>

            {/* Split Metrics */}
            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <div className="bg-surface-variant/20 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-secondary">
                  <span className="material-symbols-outlined text-[18px]">directions_subway</span>
                  <span className="font-label-ui text-xs font-semibold">Total Trips</span>
                </div>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="font-label-numeric-lg text-xl font-bold text-surface-bright font-mono">
                    48
                  </span>
                  <span className="text-[11px] text-on-primary-container">Metro+Pool</span>
                </div>
              </div>

              <div className="bg-surface-variant/20 rounded-xl p-3 flex flex-col gap-1">
                <div className="flex items-center gap-1.5 text-tertiary">
                  <span className="material-symbols-outlined text-[18px]">park</span>
                  <span className="font-label-ui text-xs font-semibold">CO₂ Offset</span>
                </div>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="font-label-numeric-lg text-xl font-bold text-surface-bright font-mono">
                    88.4
                  </span>
                  <span className="text-[11px] text-on-primary-container">kg offset</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Safety Quick Access Action Banner */}
        <div className="p-4 rounded-2xl bg-surface-container border border-error/30 shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-error-container/40 flex items-center justify-center text-error">
              <span className="material-symbols-outlined text-[24px]">sos</span>
            </div>
            <div>
              <p className="font-bold text-sm text-on-surface">Emergency Response</p>
              <p className="text-xs text-on-surface-variant">Pune Police (112) & Metro Desk</p>
            </div>
          </div>
          <button
            onClick={() => setIsSOSOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-error-container text-error font-bold text-xs shadow hover:brightness-110 active:scale-95 transition-all"
          >
            Open SOS
          </button>
        </div>

        {/* Recent Commuter Trips History */}
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between px-1">
            <span className="font-label-ui text-xs font-bold uppercase tracking-wider text-secondary">
              Recent Feeder Trips
            </span>
            <span className="text-xs text-on-surface-variant font-mono">All verified</span>
          </div>

          <div className="space-y-2.5">
            {mockTrips.map((t) => (
              <div
                key={t.id}
                className="p-3.5 rounded-2xl bg-surface-container border border-surface-container-high flex flex-col gap-2 shadow-sm"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="text-on-surface-variant font-mono">{t.date}</span>
                  <span className="text-tertiary font-bold font-mono bg-tertiary-container/40 px-2 py-0.5 rounded text-[10px]">
                    {t.status}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm text-on-surface">{t.origin} → {t.destination}</p>
                    <p className="text-xs text-on-surface-variant">{t.driver}</p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-sm font-bold text-secondary">{t.cost}</span>
                    <p className="text-[10px] text-tertiary">-{t.co2} CO₂</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
      {isSOSOpen && <SOSModal onClose={() => setIsSOSOpen(false)} />}
    </div>
  );
};

export default ActivitySafetyCenterPage;
