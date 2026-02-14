'use client';

import { useRouter } from 'next/navigation';
import { useReport } from '@/lib/context/ReportContext';
import SmartPrompt from '@/components/SmartPrompt';

export default function StartPage() {
  const router = useRouter();
  const { dispatch } = useReport();

  const handleStartRecording = () => {
    dispatch({ type: 'SET_FLOW_STEP', payload: 'recording' });
    router.push('/recording');
  };

  return (
    <div className="flex flex-col min-h-screen p-6">
      <div className="text-center mb-8 pt-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bau<span className="text-green-500">Voice</span>
        </h1>
        <p className="text-gray-500 mt-2">KI-Sprachassistent für Baustellenberichte</p>
      </div>

      <SmartPrompt />

      <div className="flex-1" />

      <div className="flex flex-col items-center gap-4 pb-8">
        <button
          onClick={handleStartRecording}
          className="w-20 h-20 rounded-full bg-green-500 hover:bg-green-600 active:bg-green-700 text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all active:scale-95"
          aria-label="Aufnahme starten"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10">
            <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4Z" />
            <path d="M6 11a1 1 0 0 0-2 0 8 8 0 0 0 7 7.93V21H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.07A8 8 0 0 0 20 11a1 1 0 1 0-2 0 6 6 0 0 1-12 0Z" />
          </svg>
        </button>
        <span className="text-gray-500 text-sm">Aufnahme starten</span>
      </div>
    </div>
  );
}
