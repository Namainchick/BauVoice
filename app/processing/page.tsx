'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useReport } from '@/lib/context/ReportContext';
import { analyzeTranscript } from '@/lib/services/gemini';
import ProcessingState from '@/components/ProcessingState';

export default function ProcessingPage() {
  const router = useRouter();
  const { state, dispatch } = useReport();
  const hasStarted = useRef(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    if (!state.transcript) {
      router.push('/');
      return;
    }

    async function process() {
      try {
        const result = await analyzeTranscript(state.transcript);
        dispatch({ type: 'SET_ANALYSIS_RESULT', payload: result });
        dispatch({ type: 'SET_FLOW_STEP', payload: 'report' });
        router.push('/report');
      } catch (err) {
        console.error('Gemini analysis failed:', err);
        setError('Analyse fehlgeschlagen. Bitte versuche es erneut.');
      }
    }

    process();
  }, [state.transcript, dispatch, router]);

  if (error) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-6">
        <div
          className="w-full max-w-sm rounded-2xl p-6 text-center border"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
          }}
        >
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'var(--danger)', opacity: 0.15 }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="w-6 h-6"
              style={{ fill: 'var(--danger)' }}
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
            </svg>
          </div>
          <p
            className="text-base font-medium mb-2"
            style={{ color: 'var(--text-primary)' }}
          >
            Etwas ist schiefgelaufen
          </p>
          <p
            className="text-sm mb-6"
            style={{ color: 'var(--text-secondary)' }}
          >
            {error}
          </p>
          <button
            onClick={() => router.push('/neu')}
            className="w-full py-3 rounded-xl font-medium text-base transition-all active:scale-[0.98]"
            style={{
              backgroundColor: 'var(--accent)',
              color: '#1A1A1A',
            }}
          >
            Nochmal versuchen
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6">
      <ProcessingState />
    </div>
  );
}
