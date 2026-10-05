import { ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { AIRecommendation } from '../types';

interface AIRecommendationsPanelProps {
  recommendations: AIRecommendation;
}

export function AIRecommendationsPanel({ recommendations }: AIRecommendationsPanelProps) {
  const [expanded, setExpanded] = useState(true);

  return (
    <section
      aria-label="ShipCheck Intelligence"
      className="rounded-xl glass-card border border-slate-700 overflow-hidden animate-slide-up"
    >
      {/* Header */}
      <button
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/50 transition-colors"
        onClick={() => setExpanded((p) => !p)}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
            <span className="text-white font-bold text-xs">AI</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">SHIPCHECK INTELLIGENCE</h2>
            <p className="text-xs text-slate-500">
              Evidence received → Rule evaluated → AI explanation generated
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
          <div className="rounded-lg glass-card px-4 py-3 border border-slate-800">
            <p className="text-sm text-slate-300 leading-relaxed">{recommendations.summary}</p>
          </div>

          {/* Prioritized fixes with FACT/AI distinction */}
          {recommendations.prioritized.length > 0 && (
            <div>
              <h3 className="text-label text-slate-500 uppercase tracking-wide mb-3">
                Analysis
              </h3>
              <ol className="space-y-4">
                {recommendations.prioritized.map((fix) => (
                  <li key={fix.findingId} className="space-y-2">
                    <div className="flex gap-3">
                      <span
                        className="
                          flex-shrink-0 w-6 h-6 rounded-lg
                          bg-slate-800 border border-slate-700 text-slate-300
                          text-xs font-bold flex items-center justify-center mt-0.5
                        "
                        aria-label={`Priority ${fix.priority}`}
                      >
                        {fix.priority}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-200">{fix.title}</p>
                      </div>
                    </div>

                    {/* FACT section */}
                    <div className="ml-9 rounded-lg glass-card px-3 py-2 border border-slate-800">
                      <span className="text-label text-slate-500 uppercase tracking-wide mb-1 block">
                        FACT
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {fix.explanation}
                      </p>
                    </div>

                    {/* AI EXPLANATION section */}
                    <div className="ml-9 rounded-lg glass-card px-3 py-2 border border-slate-800">
                      <span className="text-label text-slate-500 uppercase tracking-wide mb-1 block">
                        AI EXPLANATION
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {fix.explanation}
                      </p>
                    </div>

                    {/* RECOMMENDED FIX section */}
                    <div className="ml-9 rounded-lg glass-card px-3 py-2 border border-slate-800">
                      <span className="text-label text-slate-500 uppercase tracking-wide mb-1 block">
                        RECOMMENDED FIX
                      </span>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {fix.suggestedAction}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Overall advice */}
          {recommendations.overallAdvice && (
            <div className="rounded-lg glass-card px-4 py-3 border border-slate-800">
              <p className="text-xs text-slate-400 leading-relaxed">
                {recommendations.overallAdvice}
              </p>
            </div>
          )}

          {/* Grounded label */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="status-dot online" aria-hidden="true" />
            AI RESPONSE GROUNDED IN SCAN EVIDENCE
          </div>
        </div>
      )}
    </section>
  );
}
