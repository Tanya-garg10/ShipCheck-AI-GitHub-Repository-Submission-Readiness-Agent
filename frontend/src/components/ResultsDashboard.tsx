import { ReadinessReport } from '../types';
import { ScoreCard } from './ScoreCard';
import { RepoMetaCard } from './RepoMetaCard';
import { FindingsList } from './FindingsList';
import { AIRecommendationsPanel } from './AIRecommendationsPanel';
import { RotateCcw } from 'lucide-react';

interface ResultsDashboardProps {
  report: ReadinessReport;
  onReset: () => void;
}

export function ResultsDashboard({ report, onReset }: ResultsDashboardProps) {
  return (
    <div className="space-y-4 animate-slide-up">
      {/* Top bar */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm text-slate-400">
          Results for{' '}
          <a
            href={`https://github.com/${report.metadata.fullName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-400 hover:underline"
          >
            {report.metadata.fullName}
          </a>
        </h2>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
          aria-label="Analyze another repository"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          Analyze another
        </button>
      </div>

      {/* Repository metadata */}
      <RepoMetaCard metadata={report.metadata} />

      {/* Score */}
      <ScoreCard score={report.score} durationMs={report.checkDurationMs} />

      {/* AI Recommendations */}
      {report.aiRecommendations && (
        <AIRecommendationsPanel recommendations={report.aiRecommendations} />
      )}

      {/* Findings */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4">
        <h2 className="text-sm font-semibold text-white mb-4">
          Findings{' '}
          <span className="text-slate-500 font-normal">({report.findings.length})</span>
        </h2>
        <FindingsList findings={report.findings} repoUrl={report.repoUrl} />
      </div>
    </div>
  );
}
