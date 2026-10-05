import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-400" />
      </div>

      <h2 className="text-lg font-semibold text-white mb-2 text-center">We couldn't access this repository</h2>

      <div className="glass-card rounded-xl p-4 mb-6 w-full">
        <p className="text-sm text-slate-400 text-center">{error}</p>
      </div>

      <div className="text-sm text-slate-500 mb-6 text-center">
        <p className="mb-2">Possible reasons:</p>
        <ul className="space-y-1">
          <li>• Repository is private</li>
          <li>• Repository does not exist</li>
          <li>• GitHub rate limit reached</li>
          <li>• Network error</li>
        </ul>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 rounded-lg glass-card text-sm text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try again
        </button>
      )}
    </div>
  );
}
