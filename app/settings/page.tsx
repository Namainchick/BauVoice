'use client';

import { useState } from 'react';
import { useReport } from '@/lib/context/ReportContext';
import { useViewMode } from '@/lib/context/ViewModeContext';
import { clearAllReports, loadReports, saveReport, markDemoLoaded } from '@/lib/utils/storage';
import { DEMO_REPORTS } from '@/lib/data/demoReports';

export default function SettingsPage() {
  const { dispatch } = useReport();
  const { viewMode, setViewMode } = useViewMode();
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
    <div className="flex flex-col min-h-screen p-6 animate-fade-in max-w-2xl mx-auto w-full">
      <div className="pt-6 mb-8">
        <h1 className="text-2xl font-bold">
          Einstellungen
        </h1>
      </div>

      <div className="space-y-4">
        <div className="rounded-xl p-4 border"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                Ansicht
              </h3>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                {viewMode === 'force-mobile' ? 'Mobile Ansicht erzwungen' : viewMode === 'force-desktop' ? 'Desktop Ansicht erzwungen' : 'Automatisch (nach Bildschirmgröße)'}
              </p>
            </div>
            <button
              onClick={() => setViewMode(viewMode === 'force-mobile' ? 'auto' : 'force-mobile')}
              className="px-4 py-2 rounded-lg text-xs font-medium transition-all active:scale-95"
              style={{
                backgroundColor: viewMode === 'force-mobile' ? 'var(--accent)' : 'transparent',
                color: viewMode === 'force-mobile' ? '#1A1A1A' : 'var(--text-secondary)',
                border: viewMode === 'force-mobile' ? 'none' : '1px solid var(--border-medium)',
              }}
            >
              {viewMode === 'force-mobile' ? 'Desktop Ansicht' : 'Mobile Ansicht'}
            </button>
          </div>
        </div>

        <div className="rounded-xl p-4 border"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
          <h3 className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
            Demo zurücksetzen
          </h3>
          <p className="text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
            Setzt alle Berichte zurück und lädt die 3 Beispiel-Berichte neu.
          </p>
          <button onClick={handleReset}
            className="px-4 py-2 rounded-lg text-xs font-medium transition-all active:scale-95"
            style={{ backgroundColor: 'var(--accent)', color: '#1A1A1A' }}>
            Demo zurücksetzen
          </button>
        </div>

        <div className="rounded-xl p-4 border"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
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
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
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
          style={{ backgroundColor: 'var(--accent)', color: '#1A1A1A' }}>
          {toast}
        </div>
      )}
    </div>
  );
}
