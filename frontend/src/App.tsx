import { useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { UrlInput } from './components/UrlInput';
import { LoadingState } from './components/LoadingState';
import { ResultsDashboard } from './components/ResultsDashboard';
import { ErrorState } from './components/ErrorState';
import { HowItWorks } from './components/HowItWorks';
import { ChecksSection } from './components/ChecksSection';
import { WhyShipCheck } from './components/WhyShipCheck';
import { SamplePreview } from './components/SamplePreview';
import { analyzeRepo } from './api';
import { createDemoReport } from './utils/demoFixture';
import { ReadinessReport } from './types';

type AppState = 'idle' | 'loading' | 'results' | 'error';

export default function App() {
  const [state, setState] = useState<AppState>('idle');
  const [report, setReport] = useState<ReadinessReport | null>(null);
  const [previousReport, setPreviousReport] = useState<ReadinessReport | null>(null);
  const [currentRepoUrl, setCurrentRepoUrl] = useState<string | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAnalyze(url: string) {
    setState('loading');
    setError(null);
    setCurrentRepoUrl(url);
    setIsDemo(false);

    try {
      const response = await analyzeRepo(url, true);
      if (response.success && response.report) {
        // Store previous report if it's the same repo
        if (report && currentRepoUrl === url) {
          setPreviousReport(report);
        }
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
    setPreviousReport(null);
    setCurrentRepoUrl(null);
    setIsDemo(false);
    setError(null);
  }

  function handleDemo() {
    setState('loading');
    setError(null);
    setIsDemo(true);

    // Simulate loading delay for demo
    setTimeout(() => {
      const demoReport = createDemoReport();
      setReport(demoReport);
      setCurrentRepoUrl(demoReport.repoUrl);
      setState('results');
    }, 2000);
  }

  function handleRescan() {
    if (isDemo) {
      // For demo mode, simulate improvement
      if (!report) return;
      setState('loading');
      setTimeout(() => {
        const improvedReport = createDemoReport();
        improvedReport.score.total = 91;
        improvedReport.score.grade = 'A';
        improvedReport.score.breakdown.readme = 27;
        improvedReport.score.breakdown.security = 19;
        improvedReport.score.breakdown.links = 9;
        improvedReport.findings = improvedReport.findings.filter(
          f => f.id !== 'readme_missing_setup' && f.id !== 'security_committed_env'
        );
        setPreviousReport(report);
        setReport(improvedReport);
        setState('results');
      }, 2000);
    } else if (currentRepoUrl) {
      handleAnalyze(currentRepoUrl);
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative z-10 overflow-hidden">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 pb-16">
        {/* Landing page sections - shown when not analyzing */}
        {state === 'idle' && (
          <>
            <Hero />

            <SamplePreview />

            <div className="flex justify-center mb-12 px-4">
              <UrlInput
                onSubmit={handleAnalyze}
                isLoading={false}
                error={null}
                onDemo={handleDemo}
              />
            </div>

            <HowItWorks />
            <ChecksSection />
            <WhyShipCheck />
          </>
        )}

        {/* Show input during error state */}
        {state === 'error' && (
          <>
            <Hero />
            {error && <ErrorState error={error} onRetry={() => setState('idle')} />}
            <div className="flex justify-center mt-8">
              <UrlInput
                onSubmit={handleAnalyze}
                isLoading={false}
                error={null}
                onDemo={handleDemo}
              />
            </div>
          </>
        )}

        {state === 'loading' && <LoadingState />}

        {state === 'results' && report && (
          <div className="mt-6">
            <ResultsDashboard
              report={report}
              previousReport={previousReport || undefined}
              onReset={handleReset}
              onRescan={handleRescan}
              isDemo={isDemo}
            />
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800/50 glass-card py-4 text-center text-xs text-slate-500">
        ShipCheck AI — Built for the{' '}
        <a
          href="https://awssbggeu.com/challenges/kiro-build-challenge"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-400 hover:underline"
        >
          Kiro Build Challenge
        </a>{' '}
        · Only analyzes public repositories
      </footer>
    </div>
  );
}
