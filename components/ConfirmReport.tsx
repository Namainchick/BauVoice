'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useReport } from '@/lib/context/ReportContext';
import { REPORT_TYPE_LABELS } from '@/lib/types/report';
import { getReportStats, formatDate } from '@/lib/utils/reportHelpers';

export default function ConfirmReport() {
  const router = useRouter();
  const { state, dispatch } = useReport();
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (!state.report) return null;

  const report = state.report;
  const stats = getReportStats(report);
  const photoCount = state.photos.length;

  const handleConfirm = () => {
    dispatch({ type: 'CONFIRM_REPORT' });
    setIsConfirmed(true);
  };

  const handleNewReport = () => {
    dispatch({ type: 'RESET' });
    dispatch({ type: 'SET_FLOW_STEP', payload: 'start' });
    router.push('/');
  };

  if (isConfirmed) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-12">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center animate-zoom-in">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-10 h-10">
            <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
          </svg>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-900">Bericht bestätigt!</h2>
          <p className="text-gray-500 mt-2">
            {REPORT_TYPE_LABELS[report.berichtstyp]} – {report.allgemeine_informationen.projekt}
          </p>
        </div>

        <button
          onClick={handleNewReport}
          className="w-full py-4 bg-green-500 text-white rounded-xl font-medium text-lg hover:bg-green-600 active:bg-green-700 transition-colors"
        >
          Neuen Bericht erstellen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-green-50 border border-green-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-green-600 text-lg">✅</span>
          <span className="font-bold text-gray-900">
            {REPORT_TYPE_LABELS[report.berichtstyp]}
          </span>
        </div>

        <p className="text-sm text-gray-700">
          {report.allgemeine_informationen.projekt} – {formatDate(report.allgemeine_informationen.datum)}
        </p>

        <p className="text-sm text-gray-500">
          {stats}
          {photoCount > 0 && ` · ${photoCount} Fotos`}
        </p>

        <div className="flex items-center gap-3">
          <div className="flex-1 bg-green-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${report.vollstaendigkeit}%` }}
            />
          </div>
          <span className="text-sm font-medium text-green-700">{report.vollstaendigkeit}%</span>
        </div>
      </div>

      <button
        onClick={() => router.push('/report')}
        className="w-full py-3 border border-gray-300 rounded-xl text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
      >
        ✏️ Zurück zum Bearbeiten
      </button>

      <button
        onClick={handleConfirm}
        className="w-full py-4 bg-green-500 text-white rounded-xl font-medium text-lg hover:bg-green-600 active:bg-green-700 transition-colors shadow-lg"
      >
        ✅ Bericht bestätigen & speichern
      </button>
    </div>
  );
}
