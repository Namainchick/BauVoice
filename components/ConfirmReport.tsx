'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useReport } from '@/lib/context/ReportContext';
import { REPORT_TYPE_LABELS } from '@/lib/types/report';
import { getReportStats, formatDate } from '@/lib/utils/reportHelpers';
import { loadReports } from '@/lib/utils/storage';

export default function ConfirmReport() {
  const router = useRouter();
  const { state, dispatch } = useReport();
  const [isConfirmed, setIsConfirmed] = useState(false);

  if (!state.report) return null;

  const report = state.report;
  const stats = getReportStats(report);

  const handleConfirm = () => {
    dispatch({ type: 'CONFIRM_REPORT' });
    dispatch({ type: 'LOAD_SAVED_REPORTS', payload: loadReports() });
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
        <div className="w-20 h-20 rounded-full flex items-center justify-center animate-zoom-in"
          style={{ backgroundColor: 'var(--accent)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-10 h-10" style={{ fill: '#1A1A1A' }}>
            <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Bericht bestätigt!</h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {REPORT_TYPE_LABELS[report.berichtstyp]} — {report.allgemeine_informationen.projekt}
          </p>
        </div>
        <button onClick={handleNewReport}
          className="w-full py-4 rounded-xl font-medium text-base transition-all active:scale-[0.98]"
          style={{ backgroundColor: 'var(--accent)', color: '#1A1A1A' }}>
          Zurück zur Übersicht
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl p-5 space-y-3 border"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ backgroundColor: 'var(--accent-dim)', color: '#059669' }}>
            {REPORT_TYPE_LABELS[report.berichtstyp]}
          </span>
        </div>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {report.allgemeine_informationen.projekt} — {formatDate(report.allgemeine_informationen.datum)}
        </p>
        <p className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{stats}</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'var(--border-subtle)' }}>
            <div className="h-1.5 rounded-full" style={{ width: `${report.vollstaendigkeit}%`, backgroundColor: 'var(--accent)' }} />
          </div>
          <span className="text-sm font-medium" style={{ color: '#059669' }}>{report.vollstaendigkeit}%</span>
        </div>
      </div>

      <button onClick={() => router.push('/report')}
        className="w-full py-3 rounded-xl text-sm font-medium border transition-all active:scale-[0.98]"
        style={{ borderColor: 'var(--border-medium)', color: 'var(--text-secondary)' }}>
        Zurück zum Bearbeiten
      </button>

      <button onClick={handleConfirm}
        className="w-full py-4 rounded-xl font-medium text-base transition-all active:scale-[0.98] shadow-lg"
        style={{ backgroundColor: 'var(--accent)', color: '#1A1A1A' }}>
        Bericht bestätigen & speichern
      </button>
    </div>
  );
}
