import { ReadinessScore } from '../types';

interface CategoryCardsProps {
  score: ReadinessScore;
}

const CATEGORY_LABELS: Record<string, string> = {
  readme: 'README',
  build_config: 'CONFIGURATION',
  security: 'SECURITY',
  links: 'LINKS',
  repo_hygiene: 'REPO HEALTH',
  license: 'TESTING',
};

const CATEGORY_MAX: Record<string, number> = {
  readme: 30,
  build_config: 20,
  security: 20,
  links: 10,
  repo_hygiene: 12,
  license: 8,
};

export function CategoryCards({ score }: CategoryCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {Object.entries(score.breakdown).map(([cat, val]) => {
        const max = CATEGORY_MAX[cat] ?? 20;
        const percentage = Math.round((val / max) * 100);
        const color =
          percentage >= 80 ? 'text-emerald-400 border-emerald-500/30' :
          percentage >= 60 ? 'text-blue-400 border-blue-500/30' :
          percentage >= 40 ? 'text-yellow-400 border-yellow-500/30' :
          'text-red-400 border-red-500/30';

        return (
          <div
            key={cat}
            className={`glass-card p-3 rounded-lg border ${color}`}
          >
            <div className="text-label text-slate-500 mb-2">
              {CATEGORY_LABELS[cat] ?? cat}
            </div>
            <div className={`text-2xl font-bold ${color.split(' ')[0]}`}>
              {percentage}
            </div>
          </div>
        );
      })}
    </div>
  );
}
