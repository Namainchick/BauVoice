'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useReport } from '@/lib/context/ReportContext';
import { analyzeTranscript } from '@/lib/services/gemini';
import ProcessingState from '@/components/ProcessingState';

export default function ProcessingPage() {
  const router = useRouter();
  const { state, dispatch } = useReport();
  const hasStarted = useRef(false);

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
      } catch (error) {
        console.error('Gemini analysis failed:', error);
        alert('Analyse fehlgeschlagen. Bitte versuche es erneut.');
        router.push('/');
      }
    }

    process();
  }, [state.transcript, dispatch, router]);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center p-6">
      <ProcessingState />
    </div>
  );
}
