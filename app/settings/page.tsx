'use client';

import { useState } from 'react';
import { useReport } from '@/lib/context/ReportContext';
import { clearAllReports, loadReports, saveReport, markDemoLoaded } from '@/lib/utils/storage';
import { DEMO_REPORTS } from '@/lib/data/demoReports';

export default function SettingsPage() {
  const { dispatch } = useReport();
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleReset = () => {
    clearAllReports();
    for (const demo of DEMO_REPORTS) saveReport(demo);
    markDemoLoaded();
    dispatch({ type: 'LOAD_SAVED_REPORTS', payload: loadReports() });
    dispatch({ type: 'RESET' });
    showToast('Demo-Daten zurückgesetzt!');
  };

  const handleClearAll = () => {
    clearAllReports();
    dispatch({ type: 'LOAD_SAVED_REPORTS', payload: [] });
    dispatch({ type: 'RESET' });
    showToast('Alle Berichte gelöscht!');
  };

  return (
    <div className="flex flex-col min-h-screen p-6 animate-fade-in">
      <div className="pt-6 mb-8">
        <h1 className="text-2xl font-bold">
          Einstellungen
        </h1>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl p-4 border"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
          <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Demo zurücksetzen
          </h3>
          <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
            Setzt alle Berichte zurück und lädt die 3 Beispiel-Berichte neu.
          </p>
          <button onClick={handleReset}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-all active:scale-95"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}>
            Demo zurücksetzen
          </button>
        </div>

        <div className="rounded-xl p-4 border"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
          <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Alle Berichte löschen
          </h3>
          <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
            Löscht alle gespeicherten Berichte unwiderruflich.
          </p>
          <button onClick={handleClearAll}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-all active:scale-95"
            style={{ backgroundColor: 'var(--danger)', color: 'white' }}>
            Alle löschen
          </button>
        </div>

        <div className="rounded-xl p-4 border"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
          <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Über BauVoice
          </h3>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
            KI-Sprachassistent für Baustellenberichte.
            Inspiriert von plancrafts Vision: "Das einzige Software-Skill, das du brauchst, ist deine Stimme."
          </p>
          <p className="text-xs mt-2" style={{ color: 'var(--text-tertiary)' }}>
            Built with Next.js, Gemini AI & Tailwind CSS
          </p>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-sm shadow-lg animate-slide-up z-50"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}>
          {toast}
        </div>
      )}
    </div>
  );
}
