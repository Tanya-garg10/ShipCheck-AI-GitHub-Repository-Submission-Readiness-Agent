import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { UrlInput } from './components/UrlInput';
import { LoadingState } from './components/LoadingState';
import { ResultsDashboard } from './components/ResultsDashboard';
import { analyzeRepo } from './api';
import { ReadinessReport } from './types';

type AppState = 'idle' | 'loading' | 'results' | 'error';

export default function App() {
  const [state, setState] = useState<AppState>('idle');
  const [report, setReport] = useState<ReadinessReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze(url: string) {
    setState('loading');
    setError(null);
    setReport(null);

    try {
      const response = await analyzeRepo(url, true);
      if (response.success && response.report) {
        setReport(response.report);
        setState('results');
      } else {
        setError(response.error ?? 'Analysis failed. Please try again.');
        setState('error');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Network error. Is the backend running?';
      setError(msg);
      setState('error');
    }
  }

  function handleReset() {
    setState('idle');
    setReport(null);
    setError(null);
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pb-16">
        {/* Always show hero + input when not viewing results */}
        {state !== 'results' && (
          <Hero />
        )}

        {state !== 'results' && (
          <div className="flex justify-center mb-8">
            <UrlInput
              onSubmit={handleAnalyze}
              isLoading={state === 'loading'}
              error={state === 'error' ? error : null}
            />
          </div>
        )}

        {state === 'loading' && <LoadingState />}

        {state === 'results' && report && (
          <div className="mt-6">
            <ResultsDashboard report={report} onReset={handleReset} />
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800 py-4 text-center text-xs text-slate-600">
        ShipCheck AI — Built for the{' '}
        <a
          href="https://awssbggeu.com/challenges/kiro-build-challenge"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-500 hover:underline"
        >
          Kiro Build Challenge
        </a>{' '}
        · Only analyzes public repositories
      </footer>
    </div>
  );
}
