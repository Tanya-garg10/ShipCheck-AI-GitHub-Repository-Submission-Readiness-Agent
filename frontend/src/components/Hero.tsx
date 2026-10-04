import { CheckCircle2, Shield, Link, FileText, Package, Star } from 'lucide-react';

const FEATURES = [
  { icon: FileText, label: 'README analysis' },
  { icon: Package,  label: 'Build config' },
  { icon: Shield,   label: 'Security scan' },
  { icon: Link,     label: 'Link validation' },
  { icon: Star,     label: 'Repo hygiene' },
  { icon: CheckCircle2, label: 'License check' },
];

export function Hero() {
  return (
    <div className="text-center py-10">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-xs text-brand-400 mb-4">
        <span className="w-1.5 h-1.5 rounded-full bg-brand-400 animate-pulse" aria-hidden="true" />
        Built for the Kiro Build Challenge
      </div>

      <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-3">
        Is your repo{' '}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-blue-400">
          submission-ready?
        </span>
      </h1>
      <p className="text-base text-slate-400 max-w-lg mx-auto mb-8">
        ShipCheck AI scans public GitHub repositories for documentation gaps, security risks,
        and hygiene issues — then gives you an evidence-based readiness score.
      </p>

      <div
        className="flex flex-wrap justify-center gap-3"
        aria-label="Checks performed"
      >
        {FEATURES.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-1.5 text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full"
          >
            <Icon className="w-3.5 h-3.5 text-brand-400" aria-hidden="true" />
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
