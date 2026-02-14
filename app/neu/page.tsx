'use client';

import { useRouter } from 'next/navigation';
import { useReport } from '@/lib/context/ReportContext';
import { generateReportId } from '@/lib/utils/storage';
import { DEMO_TRANSCRIPT } from '@/lib/data/demoReports';
import SmartPrompt from '@/components/SmartPrompt';

export default function NeuPage() {
  const router = useRouter();
  const { dispatch } = useReport();

  const handleStartRecording = () => {
    dispatch({ type: 'SET_CURRENT_REPORT_ID', payload: generateReportId() });
    dispatch({ type: 'SET_FLOW_STEP', payload: 'recording' });
    router.push('/recording');
  };

  const handleDemoReport = () => {
    dispatch({ type: 'SET_CURRENT_REPORT_ID', payload: generateReportId() });
    dispatch({ type: 'SET_TRANSCRIPT', payload: DEMO_TRANSCRIPT });
    dispatch({ type: 'SET_FLOW_STEP', payload: 'processing' });
    router.push('/processing');
  };

  return (
    <div className="flex flex-col min-h-screen p-6 animate-fade-in">
      <div className="pt-6 mb-6">
        <h1 className="text-2xl font-bold">
          Neuer <span style={{ color: 'var(--accent)' }}>Bericht</span>
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
          Denk an diese Punkte:
        </p>
      </div>

      <SmartPrompt />

      <div className="flex-1" />

      <div className="flex flex-col items-center gap-4 py-8">
        <button
          onClick={handleStartRecording}
          className="w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-95 animate-pulse-glow"
          style={{ backgroundColor: 'var(--accent)' }}
          aria-label="Aufnahme starten"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-10 h-10" style={{ fill: 'var(--bg-primary)' }}>
            <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4Z" />
            <path d="M6 11a1 1 0 0 0-2 0 8 8 0 0 0 7 7.93V21H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.07A8 8 0 0 0 20 11a1 1 0 1 0-2 0 6 6 0 0 1-12 0Z" />
          </svg>
        </button>
        <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
          Tippe zum Aufnehmen
        </span>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-subtle)' }} />
        <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>oder</span>
        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-subtle)' }} />
      </div>

      <div className="flex flex-col gap-2 pb-4">
        <button
          onClick={handleDemoReport}
          className="w-full py-3 rounded-xl text-sm font-medium border transition-all active:scale-[0.98]"
          style={{
            borderColor: 'var(--accent)',
            color: 'var(--accent)',
            backgroundColor: 'transparent',
          }}
        >
          Demo Bericht erstellen
        </button>
        <button
          onClick={() => {
            dispatch({ type: 'SET_CURRENT_REPORT_ID', payload: generateReportId() });
            dispatch({ type: 'SET_FLOW_STEP', payload: 'recording' });
            router.push('/recording?fallback=true');
          }}
          className="w-full py-2 text-xs transition-colors"
          style={{ color: 'var(--text-tertiary)' }}
        >
          Text eingeben statt sprechen
        </button>
      </div>
    </div>
  );
}
