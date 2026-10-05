import { CheckCircle, Clock, Target, ShieldCheck } from 'lucide-react';

const BENEFITS = [
  {
    icon: CheckCircle,
    title: 'Automated Review',
    description: 'Turn manual checklist into one automated workflow that catches submission gaps before judges do.',
  },
  {
    icon: Clock,
    title: 'Save Time',
    description: 'No more last-minute manual checks. Get a comprehensive analysis in seconds.',
  },
  {
    icon: Target,
    title: 'Prioritized Fixes',
    description: 'AI-powered recommendations tell you exactly what to fix first for maximum impact.',
  },
  {
    icon: ShieldCheck,
    title: 'Evidence-Based',
    description: 'Every finding includes concrete evidence so you know exactly what needs attention.',
  },
];

export function WhyShipCheck() {
  return (
    <section id="why" className="py-16 sm:py-20">
      <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-4">Why ShipCheck?</h2>
      <p className="text-slate-400 text-center mb-12 max-w-2xl mx-auto px-4">
        Most hackathon builders focus on making the product work. The repository is often the last thing they check.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto px-4">
        {BENEFITS.map((benefit) => (
          <div
            key={benefit.title}
            className="glass-card p-6 rounded-2xl glass-card-hover"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/20 to-purple-500/20 flex items-center justify-center flex-shrink-0">
                <benefit.icon className="w-6 h-6 text-brand-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">{benefit.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{benefit.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
