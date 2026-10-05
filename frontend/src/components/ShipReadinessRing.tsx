import { ReadinessScore } from '../types';

interface ShipReadinessRingProps {
  score: ReadinessScore;
  size?: number;
}

const CATEGORIES = [
  { key: 'readme', label: 'README', color: '#10b981' },
  { key: 'build_config', label: 'CONFIG', color: '#3b82f6' },
  { key: 'security', label: 'SECURITY', color: '#f59e0b' },
  { key: 'links', label: 'LINKS', color: '#8b5cf6' },
  { key: 'repo_hygiene', label: 'HEALTH', color: '#06b6d4' },
  { key: 'license', label: 'TESTING', color: '#ec4899' },
];

const CATEGORY_MAX: Record<string, number> = {
  readme: 30,
  build_config: 20,
  security: 20,
  links: 10,
  repo_hygiene: 12,
  license: 8,
};

export function ShipReadinessRing({ score, size = 200 }: ShipReadinessRingProps) {
  const radius = size / 2 - 20;
  const circumference = 2 * Math.PI * radius;
  const segmentAngle = 360 / CATEGORIES.length;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        {/* Background ring */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth="8"
        />

        {/* Segmented zones */}
        {CATEGORIES.map((cat, i) => {
          const value = (score.breakdown as Record<string, number>)[cat.key] || 0;
          const max = CATEGORY_MAX[cat.key] || 20;
          const percentage = value / max;
          const segmentLength = (circumference / CATEGORIES.length) * percentage;
          const offset = (i * circumference / CATEGORIES.length) + (circumference / CATEGORIES.length) - segmentLength;

          return (
            <circle
              key={cat.key}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={cat.color}
              strokeWidth="8"
              strokeDasharray={segmentLength}
              strokeDashoffset={-offset}
              strokeLinecap="round"
              className="transition-all duration-1000"
              style={{ opacity: percentage > 0 ? 0.8 : 0.2 }}
            />
          );
        })}
      </svg>

      {/* Center score */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-white">{score.total}</span>
        <span className="text-xs text-slate-500">/100</span>
      </div>

      {/* Category labels around the ring */}
      <div className="absolute inset-0">
        {CATEGORIES.map((cat, i) => {
          const angle = (i * segmentAngle - 90) * (Math.PI / 180);
          const labelRadius = radius + 25;
          const x = size / 2 + labelRadius * Math.cos(angle);
          const y = size / 2 + labelRadius * Math.sin(angle);

          return (
            <div
              key={cat.key}
              className="absolute text-xs text-slate-400 text-label"
              style={{
                left: x,
                top: y,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {cat.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
