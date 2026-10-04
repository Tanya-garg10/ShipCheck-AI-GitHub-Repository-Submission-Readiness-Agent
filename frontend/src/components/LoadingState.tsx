import { Loader2, Search, FileText, Shield, Link, FolderGit2 } from 'lucide-react';

const STEPS = [
  { icon: FolderGit2, label: 'Fetching repository metadata…' },
  { icon: Search,     label: 'Scanning file tree…' },
  { icon: FileText,   label: 'Analysing README…' },
  { icon: Shield,     label: 'Running security checks…' },
  { icon: Link,       label: 'Validating links…' },
];

export function LoadingState() {
  return (
    <div
      className="flex flex-col items-center gap-6 py-16 animate-fade-in"
      role="status"
      aria-label="Analysing repository"
      aria-live="polite"
    >
      <div className="relative">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-brand-400 animate-spin" aria-hidden="true" />
        </div>
      </div>

      <div className="text-center">
        <h2 className="text-lg font-semibold text-white">Analysing repository…</h2>
        <p className="text-sm text-slate-400 mt-1">
          Running checks across 6 categories. This usually takes 5–15 seconds.
        </p>
      </div>

      <ul className="space-y-2 w-full max-w-xs">
        {STEPS.map(({ icon: Icon, label }, i) => (
          <li
            key={i}
            className="flex items-center gap-2 text-sm text-slate-500"
            style={{ animationDelay: `${i * 0.3}s` }}
          >
            <Icon className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            {label}
          </li>
        ))}
      </ul>
    </div>
  );
}
