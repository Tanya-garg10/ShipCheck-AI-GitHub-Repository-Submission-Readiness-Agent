import { ReadinessReport } from '../types';

interface RescanComparisonProps {
  previousReport: ReadinessReport;
  currentReport: ReadinessReport;
}

const CATEGORY_LABELS: Record<string, string> = {
  readme: 'README',
  build_config: 'CONFIG',
  security: 'SECURITY',
  links: 'LINKS',
  repo_hygiene: 'HEALTH',
  license: 'TESTING',
};

const CATEGORY_MAX: Record<string, number> = {
  readme: 30,
  build_config: 20,
  security: 20,
  links: 10,
  repo_hygiene: 12,
  license: 8,
};

export function RescanComparison({ previousReport, currentReport }: RescanComparisonProps) {
  const isReady = currentReport.score.total >= 80;

  return (
    <div className="rounded-xl glass-card p-6 border border-emerald-500/20">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="status-dot online" aria-hidden="true" />
          <h2 className="text-lg font-semibold text-white">REPOSITORY STATUS IMPROVED</h2>
        </div>
        {isReady && (
          <p className="text-sm text-emerald-400 font-medium">● READY FOR SUBMISSION</p>
        )}
      </div>

      {/* Score comparison */}
      <div className="flex items-center justify-center gap-6 mb-8">
        <div className="text-center">
          <p className="text-label text-slate-500 mb-1">BEFORE</p>
          <p className="text-3xl font-bold text-slate-400">{previousReport.score.total}</p>
        </div>
        <div className="text-2xl text-slate-600">→</div>
        <div className="text-center">
          <p className="text-label text-slate-500 mb-1">AFTER</p>
          <p className="text-3xl font-bold text-emerald-400">{currentReport.score.total}</p>
        </div>
      </div>

      {/* Category breakdown comparison */}
      <div className="space-y-3">
        {Object.keys(currentReport.score.breakdown).map((cat) => {
          const prevVal = previousReport.score.breakdown[cat as keyof typeof previousReport.score.breakdown] || 0;
          const currVal = currentReport.score.breakdown[cat as keyof typeof currentReport.score.breakdown] || 0;
          const prevPct = Math.round((prevVal / (CATEGORY_MAX[cat] || 20)) * 100);
          const currPct = Math.round((currVal / (CATEGORY_MAX[cat] || 20)) * 100);
          const improvement = currPct - prevPct;

          return (
            <div key={cat} className="flex items-center gap-4">
              <span className="text-label text-slate-500 w-24">
                {CATEGORY_LABELS[cat] || cat}
              </span>
              <div className="flex-1 flex items-center gap-3">
                <span className="text-sm text-slate-400 w-12 text-right">{prevPct}</span>
                <span className="text-slate-600">→</span>
                <span className={`text-sm font-medium w-12 text-right ${improvement > 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                  {currPct}
                </span>
                {improvement > 0 && (
                  <span className="text-xs text-emerald-400">+{improvement}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
