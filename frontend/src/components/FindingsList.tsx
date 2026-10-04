import { useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Info, Filter } from 'lucide-react';
import { Finding, Severity, CheckCategory } from '../types';
import { FindingItem } from './FindingItem';

interface FindingsListProps {
  findings: Finding[];
  repoUrl: string;
}

type SeverityFilter = Severity | 'all';
type CategoryFilter = CheckCategory | 'all';

const SEVERITY_ORDER: Severity[] = ['critical', 'warning', 'info', 'pass'];

const SEVERITY_LABELS: Record<Severity, string> = {
  critical: 'Critical',
  warning: 'Warning',
  info: 'Info',
  pass: 'Pass',
};

const SEVERITY_ICONS = {
  critical: XCircle,
  warning: AlertTriangle,
  info: Info,
  pass: CheckCircle2,
};

const SEVERITY_COLORS: Record<Severity, string> = {
  critical: 'text-red-400',
  warning:  'text-yellow-400',
  info:     'text-blue-400',
  pass:     'text-emerald-400',
};

const CATEGORY_LABELS: Record<CheckCategory, string> = {
  readme:       'README',
  build_config: 'Build Config',
  security:     'Security',
  links:        'Links',
  repo_hygiene: 'Repo Hygiene',
  license:      'License',
};

export function FindingsList({ findings, repoUrl }: FindingsListProps) {
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all');
  const [showPasses, setShowPasses] = useState(false);

  // Count by severity for badge
  const counts = SEVERITY_ORDER.reduce<Record<Severity, number>>(
    (acc, s) => {
      acc[s] = findings.filter((f) => f.severity === s).length;
      return acc;
    },
    { critical: 0, warning: 0, info: 0, pass: 0 }
  );

  const filtered = findings
    .filter((f) => {
      if (!showPasses && f.severity === 'pass') return false;
      if (severityFilter !== 'all' && f.severity !== severityFilter) return false;
      if (categoryFilter !== 'all' && f.category !== categoryFilter) return false;
      return true;
    })
    .sort((a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity));

  const categories = [...new Set(findings.map((f) => f.category))] as CheckCategory[];

  return (
    <section aria-label="Findings">
      {/* Summary badges */}
      <div className="flex flex-wrap gap-2 mb-4" role="list" aria-label="Finding summary by severity">
        {SEVERITY_ORDER.filter((s) => counts[s] > 0).map((s) => {
          const Icon = SEVERITY_ICONS[s];
          return (
            <button
              key={s}
              role="listitem"
              onClick={() => setSeverityFilter(severityFilter === s ? 'all' : s)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                border transition-colors
                ${severityFilter === s
                  ? 'bg-slate-700 border-slate-500 text-slate-100'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'}
              `}
              aria-pressed={severityFilter === s}
            >
              <Icon className={`w-3.5 h-3.5 ${SEVERITY_COLORS[s]}`} aria-hidden="true" />
              {SEVERITY_LABELS[s]}
              <span className="ml-0.5 opacity-70">{counts[s]}</span>
            </button>
          );
        })}
      </div>

      {/* Filter controls */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Filter className="w-4 h-4 text-slate-500" aria-hidden="true" />

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as CategoryFilter)}
          className="
            text-xs bg-slate-900 border border-slate-700 text-slate-300
            rounded-lg px-2.5 py-1.5
            focus:border-brand-500
          "
          aria-label="Filter by category"
        >
          <option value="all">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>
          ))}
        </select>

        <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
          <input
            type="checkbox"
            checked={showPasses}
            onChange={(e) => setShowPasses(e.target.checked)}
            className="rounded border-slate-600 bg-slate-800 text-brand-500"
          />
          Show passed checks
        </label>

        <span className="ml-auto text-xs text-slate-500">
          {filtered.length} of {findings.length} findings
        </span>
      </div>

      {/* Findings */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-slate-500 text-sm">
          No findings match the current filters.
        </div>
      ) : (
        <ul className="space-y-2" aria-live="polite">
          {filtered.map((finding) => (
            <li key={finding.id}>
              <FindingItem finding={finding} repoUrl={repoUrl} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
