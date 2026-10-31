import React, { useMemo } from "react";

interface ConfettiProps {
  active?: boolean;
  pieces?: number;
}

const COLORS = ["#94ccff", "#4edea3", "#6ffbbe", "#fbbf24", "#cde5ff", "#0378b7"];

export const Confetti: React.FC<ConfettiProps> = ({ active = true, pieces = 36 }) => {
  const particles = useMemo(
    () =>
      Array.from({ length: pieces }, (_, index) => ({
        id: index,
        left: Math.random() * 100,
        delay: Math.random() * 0.9,
        duration: 2.2 + Math.random() * 1.8,
        size: 5 + Math.random() * 7,
        color: COLORS[index % COLORS.length],
        rotate: Math.random() > 0.5 ? 1 : 0,
      })),
    [pieces]
  );

  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[60] overflow-hidden" aria-hidden="true">
      {particles.map((particle) => (
        <span
          key={particle.id}
          className="absolute top-0 animate-confetti"
          style={{
            left: `${particle.left}%`,
            width: particle.size,
            height: particle.rotate ? particle.size * 0.45 : particle.size,
            borderRadius: particle.rotate ? 2 : 999,
            backgroundColor: particle.color,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

export default Confetti;
