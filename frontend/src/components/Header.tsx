import { Github } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b border-slate-800 glass-card sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
            <span className="text-white font-bold text-sm">SC</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight">ShipCheck AI</h1>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a
            href="#"
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Scan
          </a>
          <a
            href="#"
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Findings
          </a>
          <a
            href="#"
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Evidence
          </a>
          <a
            href="#"
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Fix Plan
          </a>
          <a
            href="#"
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            History
          </a>
          <div className="w-px h-4 bg-slate-700" />
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800/50"
            aria-label="View on GitHub"
          >
            <Github className="w-4 h-4" />
            <span>GitHub</span>
          </a>
        </nav>
        {/* Mobile menu icon could be added here */}
      </div>
    </header>
  );
}
