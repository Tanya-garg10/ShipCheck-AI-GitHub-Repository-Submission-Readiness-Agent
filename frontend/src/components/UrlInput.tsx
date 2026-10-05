import { FormEvent, useState } from 'react';
import { Github, Loader2, AlertCircle, Play, ArrowRight } from 'lucide-react';

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  error?: string | null;
  onDemo?: () => void;
}

const EXAMPLE_REPOS = [
  'https://github.com/facebook/react',
  'https://github.com/microsoft/vscode',
  'https://github.com/vercel/next.js',
];

export function UrlInput({ onSubmit, isLoading, error, onDemo }: UrlInputProps) {
  const [url, setUrl] = useState('');
  const [validationError, setValidationError] = useState('');

  function validate(value: string): boolean {
    if (!value.trim()) {
      setValidationError('Please enter a GitHub repository URL.');
      return false;
    }
    const looksLikeGitHub =
      /github\.com\/[^/]+\/[^/]+/.test(value) || /^[^/]+\/[^/]+$/.test(value.trim());
    if (!looksLikeGitHub) {
      setValidationError(
        'Please enter a valid GitHub URL — e.g. https://github.com/owner/repo'
      );
      return false;
    }
    setValidationError('');
    return true;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (validate(url)) onSubmit(url.trim());
  }

  const displayError = validationError || error;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} noValidate>
        <div className="relative flex items-center">
          <Github
            className="absolute left-4 w-5 h-5 text-slate-500 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (validationError) setValidationError('');
            }}
            placeholder="https://github.com/username/project"
            className="
              w-full pl-11 pr-40 py-4 rounded-xl
              glass-card
              text-slate-100 placeholder-slate-500 text-mono text-sm
              focus:border-slate-500 focus:ring-1 focus:ring-slate-500
              transition-all duration-200
            "
            disabled={isLoading}
            aria-label="GitHub repository URL"
            aria-describedby={displayError ? 'url-error' : undefined}
            aria-invalid={Boolean(displayError)}
            autoComplete="url"
            spellCheck="false"
          />
          <button
            type="submit"
            disabled={isLoading || !url.trim()}
            className="
              absolute right-2 flex items-center gap-2
              px-5 py-2.5 rounded-lg
              btn-primary
              disabled:opacity-50 disabled:cursor-not-allowed
              font-medium text-sm
            "
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Scanning…</span>
              </>
            ) : (
              <>
                <span>RUN SHIP CHECK</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </>
            )}
          </button>
        </div>

        {displayError && (
          <p
            id="url-error"
            role="alert"
            className="mt-3 flex items-center gap-2 text-sm text-red-400 glass-card px-4 py-2 rounded-lg"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            {displayError}
          </p>
        )}
      </form>

      {/* Example repos */}
      <div className="mt-4 flex flex-wrap gap-2" aria-label="Example repositories">
        <span className="text-xs text-slate-500 self-center">Try:</span>
        {EXAMPLE_REPOS.map((repo) => {
          const label = repo.replace('https://github.com/', '');
          return (
            <button
              key={repo}
              type="button"
              onClick={() => {
                setUrl(repo);
                setValidationError('');
              }}
              className="
                text-xs px-3 py-1.5 rounded-lg
                glass-card text-slate-400 text-mono
                hover:border-slate-500 hover:text-slate-200
                transition-all duration-200
              "
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Demo button */}
      {onDemo && (
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={onDemo}
            className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-300 transition-colors mx-auto"
          >
            <Play className="w-3 h-3" />
            Try demo with sample repository
          </button>
        </div>
      )}
    </div>
  );
}
