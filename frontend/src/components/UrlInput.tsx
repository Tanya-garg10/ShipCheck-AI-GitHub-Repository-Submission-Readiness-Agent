import { FormEvent, useState } from 'react';
import { Github, Search, Loader2, AlertCircle } from 'lucide-react';

interface UrlInputProps {
  onSubmit: (url: string) => void;
  isLoading: boolean;
  error?: string | null;
}

const EXAMPLE_REPOS = [
  'https://github.com/facebook/react',
  'https://github.com/microsoft/vscode',
  'https://github.com/vercel/next.js',
];

export function UrlInput({ onSubmit, isLoading, error }: UrlInputProps) {
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
            className="absolute left-4 w-5 h-5 text-slate-400 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="url"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (validationError) setValidationError('');
            }}
            placeholder="https://github.com/owner/repository"
            className="
              w-full pl-11 pr-32 py-3.5 rounded-xl
              bg-slate-900 border border-slate-700
              text-slate-100 placeholder-slate-500
              focus:border-brand-500 focus:ring-1 focus:ring-brand-500
              transition-colors text-sm
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
              px-4 py-2 rounded-lg
              bg-brand-500 hover:bg-brand-600
              disabled:opacity-50 disabled:cursor-not-allowed
              text-white font-medium text-sm
              transition-colors
            "
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                <span>Analyzing…</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" aria-hidden="true" />
                <span>Analyze</span>
              </>
            )}
          </button>
        </div>

        {displayError && (
          <p
            id="url-error"
            role="alert"
            className="mt-2 flex items-center gap-2 text-sm text-red-400"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            {displayError}
          </p>
        )}
      </form>

      {/* Example repos */}
      <div className="mt-3 flex flex-wrap gap-2" aria-label="Example repositories">
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
                text-xs px-2.5 py-1 rounded-full
                border border-slate-700 text-slate-400
                hover:border-brand-500 hover:text-brand-400
                transition-colors
              "
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
