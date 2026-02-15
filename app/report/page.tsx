'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useReport } from '@/lib/context/ReportContext';
import { SavedReport } from '@/lib/utils/storage';
import ReportView from '@/components/ReportView';

export default function ReportPage() {
  const router = useRouter();
  const { state, dispatch } = useReport();

  useEffect(() => {
    if (!state.report) router.push('/');
  }, [state.report, router]);

  if (!state.report) return null;

  return (
    <div className="flex flex-col min-h-screen p-6 animate-fade-in max-w-5xl mx-auto w-full">
      <div className="flex items-center justify-between mb-6 pt-4">
        <button
          onClick={() => router.push('/')}
          className="text-sm transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
        >
          &larr; Zurück
        </button>
        <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
          Bau<span style={{ color: '#059669' }}>Voice</span>
        </h1>
        <div className="w-12" />
      </div>

      <ReportView />

      <div className="mt-6 pb-8 flex flex-col gap-3">
        <button
          onClick={() => {
            // Re-dispatch as edit so /neu picks it up
            const entry: SavedReport = {
              id: state.currentReportId || '',
              report: state.report!,
              questions: state.questions,
              problems: state.problems,
              savedAt: new Date().toISOString(),
            };
            dispatch({ type: 'EDIT_SAVED_REPORT', payload: entry });
            router.push('/neu');
          }}
          className="w-full py-4 rounded-xl font-medium text-base transition-all active:scale-[0.98]"
          style={{ backgroundColor: 'var(--accent)', color: '#1A1A1A' }}
        >
          Weiter bearbeiten
        </button>
        <button
          onClick={() => router.push('/')}
          className="w-full py-4 rounded-xl font-medium text-base border transition-all active:scale-[0.98]"
          style={{ borderColor: 'var(--border-medium)', color: 'var(--text-secondary)' }}
        >
          Zurück zur Übersicht
        </button>
      </div>
    </div>
  );
}
