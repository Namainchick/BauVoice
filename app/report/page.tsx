'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useReport } from '@/lib/context/ReportContext';
import ReportView from '@/components/ReportView';
import AIChat from '@/components/AIChat';
import ProblemAction from '@/components/ProblemAction';
import FollowUpInput from '@/components/FollowUpInput';

export default function ReportPage() {
  const router = useRouter();
  const { state, dispatch } = useReport();

  useEffect(() => {
    if (!state.report) router.push('/');
  }, [state.report, router]);

  if (!state.report) return null;

  const isViewOnly = state.report.status === 'bestaetigt';

  return (
    <div className="flex flex-col min-h-screen p-6 animate-slide-right">
      <div className="flex items-center justify-between mb-6 pt-4">
        <button
          onClick={() => router.push('/')}
          className="text-sm transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
        >
          &larr; Zurück
        </button>
        <h1 className="text-lg font-bold">
          Bau<span style={{ color: 'var(--accent)' }}>Voice</span>
        </h1>
        <div className="w-12" />
      </div>

      <ReportView />

      {!isViewOnly && <AIChat />}
      {!isViewOnly && <ProblemAction />}
      {!isViewOnly && <FollowUpInput />}

      {!isViewOnly && (
        <div className="mt-6 pb-8">
          <button
            onClick={() => {
              dispatch({ type: 'SET_FLOW_STEP', payload: 'confirm' });
              router.push('/confirm');
            }}
            className="w-full py-4 rounded-xl font-medium text-base transition-all active:scale-[0.98]"
            style={{ backgroundColor: 'var(--accent)', color: '#1A1A1A' }}
          >
            Bericht überprüfen & bestätigen
          </button>
        </div>
      )}

      {isViewOnly && (
        <div className="mt-6 pb-8">
          <button
            onClick={() => router.push('/')}
            className="w-full py-4 rounded-xl font-medium text-base border transition-all active:scale-[0.98]"
            style={{ borderColor: 'var(--border-medium)', color: 'var(--text-secondary)' }}
          >
            Zurück zur Übersicht
          </button>
        </div>
      )}
    </div>
  );
}
