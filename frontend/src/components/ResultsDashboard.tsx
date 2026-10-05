import { ReadinessReport } from '../types';
import { ScoreCard } from './ScoreCard';
import { FindingsList } from './FindingsList';
import { AIRecommendationsPanel } from './AIRecommendationsPanel';
import { ExportMenu } from './ExportMenu';
import { SubmissionSummary } from './SubmissionSummary';
import { MissionControlFixQueue } from './MissionControlFixQueue';
import { RescanComparison } from './RescanComparison';
import { RotateCcw, TrendingUp } from 'lucide-react';

interface ResultsDashboardProps {
  report: ReadinessReport;
  previousReport?: ReadinessReport;
  onReset: () => void;
  onRescan: () => void;
  isDemo?: boolean;
}

export function ResultsDashboard({ report, previousReport, onReset, onRescan, isDemo = false }: ResultsDashboardProps) {
  const scoreImprovement = previousReport
    ? report.score.total - previousReport.score.total
    : 0;

  return (
    <div className="space-y-5 animate-slide-up max-w-5xl mx-auto px-4">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 glass-card px-4 py-3 rounded-xl relative">
        <div className="flex items-center gap-3 flex-wrap">
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
          {isDemo && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
              Demo
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {previousReport && scoreImprovement !== 0 && (
            <div className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{scoreImprovement > 0 ? '+' : ''}{scoreImprovement} improvement</span>
            </div>
          )}
          <button
            onClick={onRescan}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800/50"
            aria-label="Run scan again"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            Run Scan Again
          </button>
          <ExportMenu report={report} />
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800/50"
            aria-label="Analyze another repository"
          >
            Analyze another
          </button>
        </div>
      </div>

      {/* Score */}
      <div id="score">
        <ScoreCard
          score={report.score}
          durationMs={report.checkDurationMs}
          repoName={report.metadata.fullName}
          branch={report.metadata.defaultBranch}
        />
      </div>

      {/* Score improvement comparison */}
      {previousReport && scoreImprovement !== 0 && (
        <>
          <RescanComparison previousReport={previousReport} currentReport={report} />
          <div className="flex justify-center">
            <button
              onClick={onRescan}
              className="flex items-center gap-2 px-6 py-3 rounded-lg btn-primary font-medium"
            >
              RUN ANOTHER SHIP CHECK →
            </button>
          </div>
        </>
      )}

      {/* AI Recommendations */}
      {report.aiRecommendations && (
        <div id="recommendations">
          <AIRecommendationsPanel recommendations={report.aiRecommendations} />
        </div>
      )}

      {/* Submission Summary */}
      <div id="summary">
        <SubmissionSummary report={report} />
      </div>

      {/* Mission Control Fix Queue */}
      <MissionControlFixQueue findings={report.findings} />

      {/* Findings */}
      <div id="findings" className="rounded-2xl glass-card p-5 premium-shadow">
        <h2 className="text-sm font-semibold text-white mb-4">
          Findings{' '}
          <span className="text-slate-500 font-normal">({report.findings.length})</span>
        </h2>
        <FindingsList findings={report.findings} repoUrl={report.repoUrl} />
      </div>
    </div>
  );
}
