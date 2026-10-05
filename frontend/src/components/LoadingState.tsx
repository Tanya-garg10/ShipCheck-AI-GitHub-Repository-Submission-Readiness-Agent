import { CheckCircle, Circle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';

const STEPS = [
  { label: 'Repository connected', evidence: '1 signal' },
  { label: 'Repository structure mapped', evidence: '47 files' },
  { label: 'README inspected', evidence: '12 signals' },
  { label: 'Configuration files detected', evidence: '8 files' },
  { label: 'Security patterns scanned', evidence: '3 patterns' },
  { label: 'Link validation', evidence: '17 links' },
  { label: 'Testing readiness evaluating', evidence: '...' },
  { label: 'Final readiness calculation', evidence: '...' },
];

export function LoadingState() {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }, 800);
    return () => clearInterval(interval);
  }, []);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-US', { hour12: false });
  };

  return (
    <div
      className="flex flex-col items-center gap-6 py-16 px-4 animate-fade-in"
      role="status"
      aria-label="Analysing repository"
      aria-live="polite"
    >
      <div className="text-center max-w-md">
        <h2 className="text-lg font-semibold text-white">Repository Flight Recorder</h2>
        <p className="text-sm text-slate-400 mt-1">
          Running pre-flight inspection across 6 categories
        </p>
      </div>

      <div className="w-full max-w-md glass-card rounded-xl p-4 scan-line">
        <div className="space-y-2">
          {STEPS.map((step, i) => {
            const isCompleted = i < currentStep;
            const isCurrent = i === currentStep;

            return (
              <div
                key={i}
                className="flex items-center gap-3 text-sm py-2 px-3 rounded-lg"
                style={{
                  background: isCurrent ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                }}
              >
                {isCompleted ? (
                  <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-400" aria-hidden="true" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 flex-shrink-0 text-slate-400 animate-spin" aria-hidden="true" />
                ) : (
                  <Circle className="w-4 h-4 flex-shrink-0 text-slate-700" aria-hidden="true" />
                )}
                <div className="flex-1 flex items-center justify-between">
                  <span className={
                    isCompleted ? 'text-slate-300' :
                    isCurrent ? 'text-slate-200' :
                    'text-slate-600'
                  }>
                    {step.label}
                  </span>
                  <span className="text-xs text-mono text-slate-500">
                    {isCompleted ? getCurrentTime() : ''}
                  </span>
                </div>
                <span className="text-xs text-mono text-slate-500 w-20 text-right">
                  {isCompleted ? step.evidence : ''}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
