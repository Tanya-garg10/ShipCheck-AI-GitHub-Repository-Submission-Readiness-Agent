import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';

export function SamplePreview() {
  return (
    <section className="py-16 sm:py-20">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">See It In Action</h2>
          <p className="text-slate-400 text-sm">Sample analysis preview</p>
        </div>

        <div className="glass-card rounded-2xl p-6 premium-shadow-lg">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800/50">
            <div>
              <h3 className="text-sm text-slate-400">Results for</h3>
              <p className="text-base font-semibold text-white">username/demo-project</p>
            </div>
            <span className="text-xs text-slate-500">Sample Analysis</span>
          </div>

          {/* Score Display */}
          <div className="flex items-center gap-6 mb-6 flex-col sm:flex-row">
            <div className="relative w-24 h-24 flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke="rgb(30 41 59)"
                  strokeWidth="8"
                />
                <circle
                  cx="50" cy="50" r="40"
                  fill="none"
                  stroke="url(#sampleGradient)"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset="45"
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="sampleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-white">82</span>
                <span className="text-xs text-slate-400">/100</span>
              </div>
            </div>
            <div className="flex-1 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-yellow-500/10 border border-yellow-500/30 mb-2">
                <span className="text-xl font-bold text-yellow-400">B</span>
                <span className="text-sm font-medium text-yellow-400">Needs Attention</span>
              </div>
              <div className="flex gap-4 text-sm justify-center sm:justify-start">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span>18 Passed</span>
                </div>
                <div className="flex items-center gap-1.5 text-yellow-400">
                  <AlertTriangle className="w-4 h-4" />
                  <span>5 Warnings</span>
                </div>
                <div className="flex items-center gap-1.5 text-red-400">
                  <XCircle className="w-4 h-4" />
                  <span>2 Critical</span>
                </div>
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
            {[
              { label: 'Repository Health', score: 95 },
              { label: 'README Quality', score: 82 },
              { label: 'Configuration', score: 90 },
              { label: 'Security', score: 100 },
              { label: 'Links', score: 75 },
              { label: 'Testing', score: 60 },
            ].map((cat) => (
              <div key={cat.label} className="glass-card p-3 rounded-xl">
                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-300">{cat.label}</span>
                  <span className="text-slate-400">{cat.score}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      cat.score >= 80 ? 'bg-emerald-500' :
                      cat.score >= 60 ? 'bg-blue-500' :
                      cat.score >= 40 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${cat.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Sample Findings */}
          <div className="glass-card p-4 rounded-xl">
            <h4 className="text-sm font-semibold text-white mb-3">Sample Findings</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-sm">
                <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200">Missing setup instructions</p>
                  <p className="text-xs text-slate-500">README does not contain clear installation steps</p>
                </div>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-slate-200">Environment variables not documented</p>
                  <p className="text-xs text-slate-500">No .env.example file found</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
