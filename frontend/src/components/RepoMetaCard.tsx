import { Star, GitFork, AlertCircle, Code2, Scale, Calendar } from 'lucide-react';
import { RepoMetadata } from '../types';

interface RepoMetaCardProps {
  metadata: RepoMetadata;
}

function MetaStat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex items-center gap-1.5 text-sm text-slate-400" aria-label={`${label}: ${value}`}>
      <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      <span className="tabular-nums">{value}</span>
    </div>
  );
}

export function RepoMetaCard({ metadata }: RepoMetaCardProps) {
  const updatedDate = new Date(metadata.updatedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 animate-slide-up">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <a
            href={`https://github.com/${metadata.fullName}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-base font-semibold text-white hover:text-brand-400 transition-colors"
          >
            {metadata.fullName}
          </a>
          {metadata.description && (
            <p className="text-sm text-slate-400 mt-0.5 line-clamp-2">{metadata.description}</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        <MetaStat icon={Star} label="Stars" value={metadata.stars.toLocaleString()} />
        <MetaStat icon={GitFork} label="Forks" value={metadata.forks.toLocaleString()} />
        <MetaStat icon={AlertCircle} label="Open issues" value={metadata.openIssues} />
        {metadata.language && (
          <MetaStat icon={Code2} label="Language" value={metadata.language} />
        )}
        {metadata.license && (
          <MetaStat icon={Scale} label="License" value={metadata.license} />
        )}
        <MetaStat icon={Calendar} label="Last updated" value={updatedDate} />
      </div>

      {metadata.topics.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Repository topics">
          {metadata.topics.map((t) => (
            <span
              key={t}
              className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700"
            >
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
