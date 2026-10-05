import { FileText, Settings, Shield, Link, FolderTree, Scale } from 'lucide-react';

const CHECKS = [
  {
    icon: FileText,
    title: 'README Quality',
    weight: '30 pts',
    items: [
      'Presence and completeness',
      'Project overview',
      'Installation instructions',
      'Usage documentation',
      'Tech stack information',
      'Demo links',
    ],
  },
  {
    icon: Settings,
    title: 'Build Config',
    weight: '20 pts',
    items: [
      'package.json or equivalent',
      'Build scripts',
      'Test configuration',
      'CI/CD setup',
      '.gitignore presence',
    ],
  },
  {
    icon: Shield,
    title: 'Security',
    weight: '20 pts',
    items: [
      'No committed .env files',
      'Secret pattern detection',
      '.env.example presence',
      'Potential credential exposure',
    ],
  },
  {
    icon: Link,
    title: 'Links',
    weight: '10 pts',
    items: [
      'URL reachability',
      'Placeholder link detection',
      'Demo link verification',
      'Documentation links',
    ],
  },
  {
    icon: FolderTree,
    title: 'Repo Hygiene',
    weight: '12 pts',
    items: [
      'Repository description',
      'Topic tags',
      'CONTRIBUTING.md',
      'Source code structure',
      'Recent activity',
    ],
  },
  {
    icon: Scale,
    title: 'License',
    weight: '8 pts',
    items: [
      'LICENSE file presence',
      'SPDX identifier',
      'License type',
    ],
  },
];

export function ChecksSection() {
  return (
    <section id="checks" className="py-16 sm:py-20">
      <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4">What We Check</h2>
      <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto px-4">
        ShipCheck evaluates your repository across 6 critical categories to ensure submission readiness.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-4">
        {CHECKS.map((check) => (
          <div
            key={check.title}
            className="glass-card p-5 rounded-2xl glass-card-hover"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                <check.icon className="w-5 h-5 text-brand-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-semibold text-white">{check.title}</h3>
                <span className="text-xs text-brand-400 font-medium">{check.weight}</span>
              </div>
            </div>
            <ul className="space-y-1.5">
              {check.items.map((item) => (
                <li key={item} className="text-xs text-slate-400 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
