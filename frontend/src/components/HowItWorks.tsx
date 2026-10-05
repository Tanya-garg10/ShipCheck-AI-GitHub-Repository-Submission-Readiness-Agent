import { Github, Search, Wrench } from 'lucide-react';

const STEPS = [
  {
    number: '01',
    icon: Github,
    title: 'Paste',
    description: 'Enter your public GitHub repository URL.',
  },
  {
    number: '02',
    icon: Search,
    title: 'Inspect',
    description: 'ShipCheck analyzes repository metadata, documentation, configuration, links, and security patterns.',
  },
  {
    number: '03',
    icon: Wrench,
    title: 'Fix',
    description: 'Get prioritized findings and an actionable improvement checklist before submission.',
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-20">
      <h2 className="text-2xl sm:text-3xl font-bold text-white text-center mb-12">How It Works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
        {STEPS.map((step) => (
          <div
            key={step.number}
            className="glass-card p-6 rounded-2xl glass-card-hover text-center"
          >
            <div className="text-4xl font-bold text-brand-400/30 mb-4">{step.number}</div>
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500/20 to-purple-500/20 flex items-center justify-center mb-4 mx-auto">
              <step.icon className="w-6 h-6 text-brand-400" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
            <p className="text-sm text-slate-400">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
