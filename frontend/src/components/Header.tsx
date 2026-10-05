import { Github } from 'lucide-react';

interface HeaderProps {
  showNav?: boolean;
}

export function Header({ showNav = false }: HeaderProps) {
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
          {showNav ? (
            <>
              <a
                href="#score"
                className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                Score
              </a>
              <a
                href="#findings"
                className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                Findings
              </a>
              <a
                href="#recommendations"
                className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                Recommendations
              </a>
              <a
                href="#summary"
                className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                Summary
              </a>
            </>
          ) : null}
          <div className="w-px h-4 bg-slate-700" />
          <a
            href="https://github.com/kiro-build-challenge/ShipCheck-AI"
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
