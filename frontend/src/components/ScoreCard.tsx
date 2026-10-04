import { ReadinessScore } from '../types';

interface ScoreCardProps {
  score: ReadinessScore;
  durationMs: number;
}

const GRADE_CONFIG = {
  A: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', label: 'Excellent' },
  B: { color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/30',    label: 'Good' },
  C: { color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/30',  label: 'Needs Work' },
  D: { color: 'text-orange-400',  bg: 'bg-orange-500/10 border-orange-500/30',  label: 'Poor' },
  F: { color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/30',     label: 'Not Ready' },
};

const CATEGORY_LABELS: Record<string, string> = {
  readme:       'README',
  build_config: 'Build Config',
  security:     'Security',
  links:        'Links',
  repo_hygiene: 'Repo Hygiene',
  license:      'License',
};

const CATEGORY_MAX: Record<string, number> = {
  readme:       30,
  build_config: 20,
  security:     20,
  links:        10,
  repo_hygiene: 12,
  license:       8,
};

function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  const color =
    pct >= 80 ? 'bg-emerald-500' :
    pct >= 60 ? 'bg-blue-500' :
    pct >= 40 ? 'bg-yellow-500' :
    'bg-red-500';

  return (
    <div
      className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={`${value} of ${max} points`}
    >
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function ScoreCard({ score, durationMs }: ScoreCardProps) {
  const grade = GRADE_CONFIG[score.grade];
  const circumference = 2 * Math.PI * 44; // r=44
  const offset = circumference - (score.total / 100) * circumference;

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Circular score gauge */}
        <div className="relative flex-shrink-0" aria-label={`Score: ${score.total} out of 100`}>
          <svg width="120" height="120" className="-rotate-90" aria-hidden="true">
            <circle
              cx="60" cy="60" r="44"
              fill="none"
              stroke="rgb(30 41 59)"
              strokeWidth="10"
            />
            <circle
              cx="60" cy="60" r="44"
              fill="none"
              stroke="rgb(99 102 241)"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{score.total}</span>
            <span className="text-xs text-slate-400">/100</span>
          </div>
        </div>

        {/* Grade badge + summary */}
        <div className="flex-1 text-center sm:text-left">
          <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border mb-2 ${grade.bg}`}>
            <span className={`text-2xl font-bold ${grade.color}`}>{score.grade}</span>
            <span className={`text-sm font-medium ${grade.color}`}>{grade.label}</span>
          </div>
          <p className="text-sm text-slate-400">
            Analyzed in {(durationMs / 1000).toFixed(1)}s across 6 categories
          </p>
        </div>
      </div>

      {/* Category breakdown */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
        {Object.entries(score.breakdown).map(([cat, val]) => (
          <div key={cat}>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-300">{CATEGORY_LABELS[cat] ?? cat}</span>
              <span className="text-slate-400 tabular-nums">
                {val}/{CATEGORY_MAX[cat]}
              </span>
            </div>
            <ProgressBar value={val} max={CATEGORY_MAX[cat] ?? 20} />
          </div>
        ))}
      </div>
    </div>
  );
}
