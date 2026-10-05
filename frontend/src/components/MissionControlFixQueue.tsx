import { Finding } from '../types';

interface MissionControlFixQueueProps {
  findings: Finding[];
}

const SEVERITY_CONFIG: Record<string, { color: string; bg: string; emoji: string }> = {
  critical: { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30', emoji: '🔴' },
  warning: { color: 'text-yellow-400', bg: 'bg-yellow-500/10 border-yellow-500/30', emoji: '🟠' },
  info: { color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30', emoji: '🟡' },
  pass: { color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30', emoji: '🟢' },
};

export function MissionControlFixQueue({ findings }: MissionControlFixQueueProps) {
  const actionableFindings = findings.filter(f => f.severity !== 'pass');
  const count = actionableFindings.length;

  if (count === 0) {
    return null;
  }

  return (
    <div className="rounded-xl glass-card p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white">
          {count} FIX{count !== 1 ? 'ES' : ''} BETWEEN YOU AND READY
        </h2>
      </div>

      <div className="space-y-2">
        {actionableFindings.map((finding, i) => {
          const cfg = SEVERITY_CONFIG[finding.severity] || SEVERITY_CONFIG.info;

          return (
            <div
              key={finding.id}
              className={`flex items-start gap-3 p-3 rounded-lg border ${cfg.bg}`}
            >
              <span className="text-lg" aria-hidden="true">{cfg.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-label text-slate-500">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className={`text-sm font-medium ${cfg.color}`}>
                    {finding.title}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-1">{finding.description}</p>
                {finding.suggestion && (
                  <p className="text-xs text-slate-500">
                    → {finding.suggestion}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
