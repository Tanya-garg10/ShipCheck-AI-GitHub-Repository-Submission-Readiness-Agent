interface HeroProps {
  onDemo?: () => void;
}

export function Hero({ onDemo }: HeroProps) {
  return (
    <div className="text-center py-12 sm:py-16 relative">
      {/* Status indicator */}
      <div className="inline-flex items-center gap-2 text-label text-slate-400 mb-8">
        <span className="status-dot online" aria-hidden="true" />
        REPOSITORY INSPECTION SYSTEM ONLINE
      </div>

      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-4 leading-tight max-w-4xl mx-auto">
        SHIPCHECK AI
      </h1>
      <p className="text-xl sm:text-2xl text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed px-4">
        Your final reviewer before you hit Submit.
      </p>
      <p className="text-sm text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed px-4">
        Inspect your repository. Find what reviewers will notice. Fix it before they do.
      </p>

      {/* Demo CTA Button */}
      {onDemo && (
        <div className="mb-8 px-4">
          <button
            onClick={onDemo}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 text-purple-300 hover:border-purple-400 hover:text-purple-200 transition-all duration-200 text-sm font-medium"
          >
            <span>🎯</span>
            <span>Try Demo Analysis</span>
          </button>
        </div>
      )}

      {/* Capability labels */}
      <div className="flex flex-wrap justify-center gap-3 text-label text-slate-500 mb-8 px-4">
        <span className="px-3 py-1.5 rounded-lg glass-card">README</span>
        <span className="px-3 py-1.5 rounded-lg glass-card">CONFIG</span>
        <span className="px-3 py-1.5 rounded-lg glass-card">SECURITY</span>
        <span className="px-3 py-1.5 rounded-lg glass-card">LINKS</span>
        <span className="px-3 py-1.5 rounded-lg glass-card">TESTING</span>
        <span className="px-3 py-1.5 rounded-lg glass-card">REPO HEALTH</span>
      </div>
    </div>
  );
}
