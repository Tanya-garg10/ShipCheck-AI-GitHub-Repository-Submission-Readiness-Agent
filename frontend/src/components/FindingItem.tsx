import { useState } from 'react';
import {
  CheckCircle2, AlertTriangle, XCircle, Info,
  ChevronDown, ChevronUp, Wand2, Loader2, Copy, Check,
} from 'lucide-react';
import { Finding } from '../types';
import { fetchFixSuggestion } from '../api';

interface FindingItemProps {
  finding: Finding;
  repoUrl: string;
}

const SEVERITY_CONFIG = {
  critical: {
    icon: XCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/5 border-red-500/20',
    badge: 'bg-red-500/20 text-red-300',
    label: 'Critical',
  },
  warning: {
    icon: AlertTriangle,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/5 border-yellow-500/20',
    badge: 'bg-yellow-500/20 text-yellow-300',
    label: 'Warning',
  },
  info: {
    icon: Info,
    color: 'text-blue-400',
    bg: 'bg-blue-500/5 border-blue-500/20',
    badge: 'bg-blue-500/20 text-blue-300',
    label: 'Info',
  },
  pass: {
    icon: CheckCircle2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/5 border-emerald-500/20',
    badge: 'bg-emerald-500/20 text-emerald-300',
    label: 'Pass',
  },
};

export function FindingItem({ finding, repoUrl }: FindingItemProps) {
  const [expanded, setExpanded] = useState(false);
  const [fixText, setFixText] = useState<string | null>(null);
  const [fixLoading, setFixLoading] = useState(false);
  const [fixError, setFixError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const cfg = SEVERITY_CONFIG[finding.severity];
  const Icon = cfg.icon;
  const isPass = finding.severity === 'pass';

  async function handleGetFix() {
    if (fixText) {
      setExpanded(true);
      return;
    }
    setFixLoading(true);
    setFixError(null);
    try {
      const res = await fetchFixSuggestion(repoUrl, finding.id);
      if (res.success && res.suggestion) {
        setFixText(res.suggestion);
        setExpanded(true);
      } else {
        setFixError(res.error ?? 'Failed to get suggestion.');
      }
    } catch {
      setFixError('Network error. Please try again.');
    } finally {
      setFixLoading(false);
    }
  }

  async function handleCopy() {
    if (!fixText) return;
    await navigator.clipboard.writeText(fixText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={`rounded-xl border p-4 ${cfg.bg} animate-fade-in`}>
      <div className="flex items-start gap-3">
        <Icon
          className={`w-4 h-4 mt-0.5 flex-shrink-0 ${cfg.color}`}
          aria-hidden="true"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${cfg.badge}`}
              >
                {cfg.label}
              </span>
              <span className="text-xs text-slate-500 capitalize">
                {finding.category.replace('_', ' ')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {!isPass && (
                <button
                  onClick={handleGetFix}
                  disabled={fixLoading}
                  className="
                    flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg
                    border border-brand-500/40 text-brand-400
                    hover:bg-brand-500/10 disabled:opacity-50
                    transition-colors
                  "
                  aria-label={`Get AI fix for: ${finding.title}`}
                >
                  {fixLoading ? (
                    <Loader2 className="w-3 h-3 animate-spin" aria-hidden="true" />
                  ) : (
                    <Wand2 className="w-3 h-3" aria-hidden="true" />
                  )}
                  Fix
                </button>
              )}
              <button
                onClick={() => setExpanded((p) => !p)}
                className="text-slate-400 hover:text-slate-200 transition-colors p-0.5"
                aria-expanded={expanded}
                aria-label={expanded ? 'Collapse details' : 'Expand details'}
              >
                {expanded ? (
                  <ChevronUp className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <ChevronDown className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <p className="mt-1 text-sm font-medium text-slate-200">{finding.title}</p>

          {expanded && (
            <div className="mt-2 space-y-2 animate-fade-in">
              <p className="text-sm text-slate-400">{finding.description}</p>

              {finding.evidence && (
                <div className="rounded-lg bg-slate-950/60 px-3 py-2">
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                    Evidence
                  </span>
                  <p className="text-xs text-slate-300 mt-0.5 font-mono break-all">
                    {finding.evidence}
                  </p>
                </div>
              )}

              {finding.suggestion && (
                <div className="rounded-lg bg-slate-950/60 px-3 py-2">
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wide">
                    Quick fix
                  </span>
                  <p className="text-xs text-slate-300 mt-0.5">{finding.suggestion}</p>
                </div>
              )}

              {fixError && (
                <p className="text-xs text-red-400">{fixError}</p>
              )}

              {fixText && (
                <div className="rounded-lg bg-slate-950/80 border border-slate-700 overflow-hidden">
                  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700">
                    <span className="text-xs text-slate-400 font-medium flex items-center gap-1.5">
                      <Wand2 className="w-3 h-3 text-brand-400" aria-hidden="true" />
                      AI Fix Suggestion
                    </span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                      aria-label="Copy fix suggestion to clipboard"
                    >
                      {copied ? (
                        <><Check className="w-3 h-3 text-emerald-400" aria-hidden="true" /> Copied</>
                      ) : (
                        <><Copy className="w-3 h-3" aria-hidden="true" /> Copy</>
                      )}
                    </button>
                  </div>
                  <div className="px-3 py-3 text-xs text-slate-300 whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto scrollbar-thin">
                    {fixText}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
