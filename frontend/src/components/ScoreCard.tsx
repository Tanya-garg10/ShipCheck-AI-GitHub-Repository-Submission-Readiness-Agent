import { ReadinessScore } from '../types';
import { ShipReadinessRing } from './ShipReadinessRing';

interface ScoreCardProps {
  score: ReadinessScore;
  durationMs: number;
  repoName?: string;
  branch?: string;
  lastScan?: string;
}

const GRADE_CONFIG = {
  A: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', label: 'READY FOR SUBMISSION' },
  B: { color: 'text-blue-400',    bg: 'bg-blue-500/10 border-blue-500/30',    label: 'CONDITIONALLY READY' },
  C: { color: 'text-yellow-400',  bg: 'bg-yellow-500/10 border-yellow-500/30',  label: 'NEEDS ATTENTION' },
  D: { color: 'text-orange-400',  bg: 'bg-orange-500/10 border-orange-500/30',  label: 'NOT READY' },
  F: { color: 'text-red-400',     bg: 'bg-red-500/10 border-red-500/30',     label: 'CRITICAL ISSUES' },
};

const CATEGORY_LABELS: Record<string, string> = {
  readme:       'README',
  build_config: 'CONFIGURATION',
  security:     'SECURITY',
  links:        'LINKS',
  repo_hygiene: 'REPO HEALTH',
  license:      'TESTING',
};

const CATEGORY_MAX: Record<string, number> = {
  readme:       30,
  build_config: 20,
  security:     20,
  links:        10,
  repo_hygiene: 12,
  license:       8,
};

export function ScoreCard({ score, repoName, branch, lastScan }: ScoreCardProps) {
  const grade = GRADE_CONFIG[score.grade];

  const getLastScanTime = () => {
    if (lastScan) return lastScan;
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour12: false });
  };

  return (
    <div className="rounded-xl glass-card p-6 animate-slide-up premium-shadow-lg">
      {/* Repository info header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-label text-slate-500">REPOSITORY:</span>
            <span className="text-sm text-slate-200 text-mono">{repoName || 'unknown'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-label text-slate-500">BRANCH:</span>
            <span className="text-sm text-slate-200 text-mono">{branch || 'main'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-label text-slate-500">LAST SCAN:</span>
          <span className="text-sm text-slate-400 text-mono">{getLastScanTime()}</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Ship Readiness Ring */}
        <div className="flex-shrink-0">
          <ShipReadinessRing score={score} size={200} />
        </div>

        {/* Status and categories */}
        <div className="flex-1 w-full">
          {/* Readiness status */}
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border mb-6 ${grade.bg} glass-card`}>
            <span className={`text-2xl font-bold ${grade.color}`}>{score.total} / 100</span>
            <span className={`text-sm font-medium ${grade.color}`}>{grade.label}</span>
          </div>

          {/* Category scores */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(score.breakdown).map(([cat, val]) => {
              const max = CATEGORY_MAX[cat] || 20;
              const pct = Math.round((val / max) * 100);
              const color =
                pct >= 80 ? 'text-emerald-400' :
                pct >= 60 ? 'text-blue-400' :
                pct >= 40 ? 'text-yellow-400' :
                'text-red-400';

              return (
                <div key={cat} className="glass-card p-3 rounded-lg">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-label text-slate-500">{CATEGORY_LABELS[cat] ?? cat}</span>
                    <span className={`text-sm font-bold ${color}`}>{pct}</span>
                  </div>
                  <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        pct >= 80 ? 'bg-emerald-500' :
                        pct >= 60 ? 'bg-blue-500' :
                        pct >= 40 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
