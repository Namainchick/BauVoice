'use client';

import { useState, useEffect } from 'react';

const STEPS = [
  'Transkript wird analysiert...',
  'Berichtstyp wird erkannt...',
  'Leistungen werden extrahiert...',
  'Vollständigkeit wird berechnet...',
];

export default function ProcessingState() {
  const [completedSteps, setCompletedSteps] = useState(0);

  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    STEPS.forEach((_, i) => {
      if (i < STEPS.length - 1) {
        timers.push(setTimeout(() => setCompletedSteps(i + 1), (i + 1) * 1000));
      }
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      <div className="space-y-4 w-full max-w-xs">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className="flex items-center gap-3 animate-fade-in"
            style={{ animationDelay: `${i * 300}ms` }}
          >
            {i < completedSteps ? (
              <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
                <circle cx="12" cy="12" r="10" fill="var(--accent-dim)" />
                <path d="M8 12l3 3 5-5" stroke="var(--accent)" strokeWidth="2" fill="none"
                  strokeLinecap="round" strokeLinejoin="round" className="animate-check" />
              </svg>
            ) : i === completedSteps ? (
              <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent)' }} />
              </div>
            ) : (
              <div className="w-5 h-5 flex-shrink-0 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--text-tertiary)' }} />
              </div>
            )}
            <span className="text-sm" style={{
              color: i <= completedSteps ? 'var(--text-primary)' : 'var(--text-tertiary)',
            }}>
              {step}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>
        Das dauert nur ein paar Sekunden
      </p>
    </div>
  );
}
