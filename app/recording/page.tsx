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
    <div className="flex flex-col min-h-screen p-6 animate-slide-right">
      <div className="text-center mb-8 pt-8">
        <h1 className="text-2xl font-bold">
          Bau<span style={{ color: 'var(--accent)' }}>Voice</span>
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
          Sprich einfach drauf los
        </p>
      </div>

      <VoiceRecorder onStop={handleStop} />

      <div className="mt-auto pt-4 pb-8">
        <button
          onClick={() => router.push('/neu')}
          className="text-sm transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
        >
          &larr; Zurück
        </button>
      </div>
    </div>
  );
}
