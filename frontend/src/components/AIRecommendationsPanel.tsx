import { Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { AIRecommendation } from '../types';

interface AIRecommendationsPanelProps {
  recommendations: AIRecommendation;
}

export function AIRecommendationsPanel({ recommendations }: AIRecommendationsPanelProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <section
      aria-label="AI Recommendations"
      className="rounded-2xl bg-slate-900 border border-brand-500/20 overflow-hidden animate-slide-up"
    >
      {/* Header */}
      <button
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/50 transition-colors"
        onClick={() => setExpanded((p) => !p)}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-brand-400" aria-hidden="true" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">AI Recommendations</h2>
            <p className="text-xs text-slate-500">
              {recommendations.prioritized.length} prioritized fix{recommendations.prioritized.length !== 1 ? 'es' : ''}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-slate-400" aria-hidden="true" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-400" aria-hidden="true" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 space-y-4 animate-fade-in">
          {/* Summary */}
          <div className="rounded-xl bg-brand-500/5 border border-brand-500/15 px-4 py-3">
            <p className="text-sm text-slate-300 leading-relaxed">{recommendations.summary}</p>
          </div>

          {/* Prioritized fixes */}
          {recommendations.prioritized.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                Prioritized Actions
              </h3>
              <ol className="space-y-3">
                {recommendations.prioritized.map((fix) => (
                  <li key={fix.findingId} className="flex gap-3">
                    <span
                      className="
                        flex-shrink-0 w-5 h-5 rounded-full
                        bg-brand-500/20 text-brand-400
                        text-xs font-bold flex items-center justify-center mt-0.5
                      "
                      aria-label={`Priority ${fix.priority}`}
                    >
                      {fix.priority}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-slate-200">{fix.title}</p>
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                        {fix.explanation}
                      </p>
                      <p className="text-xs text-brand-300 mt-1 leading-relaxed">
                        → {fix.suggestedAction}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Overall advice */}
          {recommendations.overallAdvice && (
            <div className="rounded-xl bg-slate-800 px-4 py-3">
              <p className="text-xs text-slate-400 leading-relaxed">
                💡 {recommendations.overallAdvice}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
