import { ReadinessReport } from '../types';
import { CheckCircle, Sparkles } from 'lucide-react';

interface SubmissionSummaryProps {
  report: ReadinessReport;
}

export function SubmissionSummary({ report }: SubmissionSummaryProps) {
  const criticalFindings = report.findings.filter(f => f.severity === 'critical');
  const warningFindings = report.findings.filter(f => f.severity === 'warning');
  const passedFindings = report.findings.filter(f => f.severity === 'pass');

  const strongAreas = passedFindings.slice(0, 3).map(f => f.title);
  const beforeSubmitting = [...criticalFindings, ...warningFindings].slice(0, 5).map(f => f.title);

  const isReady = report.score.total >= 85;
  const needsAttention = report.score.total >= 70 && report.score.total < 85;

  return (
    <div className="glass-card rounded-2xl p-6 premium-shadow">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-brand-400" />
        <h2 className="text-sm font-semibold text-white">Submission Summary</h2>
      </div>

      {/* Status */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl font-bold text-white">{report.score.total}/100</span>
          <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
            isReady ? 'bg-emerald-500/20 text-emerald-400' :
            needsAttention ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'
          }`}>
            {isReady ? 'Submission Ready' : needsAttention ? 'Needs Attention' : 'Not Ready'}
          </div>
        </div>
        <p className="text-sm text-slate-400">
          {isReady
            ? 'Your repository is well-prepared for submission!'
            : needsAttention
            ? 'A few improvements needed before submission.'
            : 'Significant issues need to be addressed.'}
        </p>
      </div>

      {/* Strong Areas */}
      {strongAreas.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Strong Areas
          </h3>
          <ul className="space-y-2">
            {strongAreas.map((area) => (
              <li key={area} className="flex items-start gap-2 text-sm text-slate-300">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                {area}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Before Submitting */}
      {beforeSubmitting.length > 0 && (
        <div>
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">
            Before Submitting
          </h3>
          <ol className="space-y-2">
            {beforeSubmitting.map((item, index) => {
              const isCritical = criticalFindings.some(f => f.title === item);
              return (
                <li key={item} className="flex items-start gap-3 text-sm">
                  <span className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    isCritical ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="text-slate-300">{item}</span>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {/* AI Summary */}
      {report.aiRecommendations?.overallAdvice && (
        <div className="mt-6 pt-4 border-t border-slate-800/50">
          <p className="text-sm text-slate-400 leading-relaxed">
            💡 {report.aiRecommendations.overallAdvice}
          </p>
        </div>
      )}
    </div>
  );
}
