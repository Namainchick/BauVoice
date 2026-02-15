'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useReport } from '@/lib/context/ReportContext';
import ReportCard from '@/components/ReportCard';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Guten Morgen';
  if (h < 18) return 'Guten Tag';
  return 'Guten Abend';
}

export default function DashboardPage() {
  const router = useRouter();
  const { state, dispatch } = useReport();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    if (!search.trim()) return state.savedReports;
    const q = search.toLowerCase();
    return state.savedReports.filter(
      (r) =>
        r.report.allgemeine_informationen.projekt.toLowerCase().includes(q) ||
        r.report.berichtstyp.toLowerCase().includes(q)
    );
  }, [state.savedReports, search]);

  const thisWeek = state.savedReports.filter((r) => {
    const diff = Date.now() - new Date(r.savedAt).getTime();
    return diff < 7 * 86400000;
  }).length;

  const confirmedCount = state.savedReports.filter(r => r.report.status === 'bestaetigt').length;

  const handleViewReport = (entry: typeof state.savedReports[0]) => {
    dispatch({ type: 'VIEW_SAVED_REPORT', payload: entry });
    dispatch({ type: 'SET_FLOW_STEP', payload: 'report' });
    router.push('/report');
  };

  return (
    <div className="flex flex-col min-h-screen p-6 animate-fade-in">
      <div className="pt-6 mb-6">
        <h1 className="text-2xl font-bold">
          Bau<span style={{ color: '#059669' }}>Voice</span>
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
          {getGreeting()} — {thisWeek} {thisWeek === 1 ? 'Bericht' : 'Berichte'} diese Woche
        </p>
      </div>

      <div
        className="rounded-xl p-3 mb-4 text-xs text-center"
        style={{ backgroundColor: 'var(--accent-dim)', color: '#059669' }}
      >
        Demo-Modus — Erstelle deinen eigenen Bericht oder teste mit Beispieldaten
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl p-4 border text-center" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{state.savedReports.length}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Berichte gesamt</p>
        </div>
        <div className="rounded-xl p-4 border text-center" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
          <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{thisWeek}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Diese Woche</p>
        </div>
        <div className="rounded-xl p-4 border text-center" style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
          <p className="text-2xl font-bold" style={{ color: '#059669' }}>{confirmedCount}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Bestätigt</p>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Berichte suchen..."
          className="w-full px-4 py-3 rounded-xl text-sm border focus:outline-none"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-primary)',
          }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 py-12">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" className="w-8 h-8" style={{ color: 'var(--text-tertiary)' }}>
              <path d="M12 4v16m-8-8h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <p style={{ color: 'var(--text-secondary)' }}>
            {search ? 'Keine Berichte gefunden' : 'Noch keine Berichte'}
          </p>
          <button
            onClick={() => router.push('/neu')}
            className="px-6 py-2.5 rounded-full text-sm font-medium transition-all active:scale-95"
            style={{ backgroundColor: 'var(--accent)', color: '#1A1A1A' }}
          >
            Ersten Bericht erstellen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((entry, i) => (
            <ReportCard
              key={entry.id}
              entry={entry}
              index={i}
              onClick={() => handleViewReport(entry)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
