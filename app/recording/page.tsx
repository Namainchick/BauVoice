'use client';

import { useRouter } from 'next/navigation';
import { useReport } from '@/lib/context/ReportContext';
import VoiceRecorder from '@/components/VoiceRecorder';

export default function RecordingPage() {
  const router = useRouter();
  const { dispatch } = useReport();

  const handleStop = () => {
    dispatch({ type: 'SET_FLOW_STEP', payload: 'processing' });
    router.push('/processing');
  };

  return (
    <div className="flex flex-col min-h-screen p-6">
      <div className="text-center mb-8 pt-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Bau<span className="text-green-500">Voice</span>
        </h1>
        <p className="text-gray-500 mt-1">Sprich einfach drauf los</p>
      </div>

      <VoiceRecorder onStop={handleStop} />

      <div className="mt-auto pt-4 pb-8">
        <button
          onClick={() => router.push('/')}
          className="text-gray-500 text-sm hover:text-gray-700 transition-colors"
        >
          &larr; Zurück
        </button>
      </div>
    </div>
  );
}
