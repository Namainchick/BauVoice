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
    if (!state.report) {
      router.push('/');
    }
  }, [state.report, router]);

  if (!state.report) return null;

  return (
    <div className="flex flex-col min-h-screen p-6">
      <div className="text-center mb-6 pt-4">
        <h1 className="text-2xl font-bold text-gray-900">
          Bau<span className="text-green-500">Voice</span>
        </h1>
      </div>

      <ReportView />

      <AIChat />

      <ProblemAction />

      <FollowUpInput />

      <div className="mt-6 pb-8">
        <button
          onClick={() => {
            dispatch({ type: 'SET_FLOW_STEP', payload: 'confirm' });
            router.push('/confirm');
          }}
          className="w-full py-4 bg-green-500 text-white rounded-xl font-medium text-lg hover:bg-green-600 active:bg-green-700 transition-colors"
        >
          Bericht überprüfen & bestätigen
        </button>
      </div>
    </div>
  );
}
