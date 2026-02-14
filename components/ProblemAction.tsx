'use client';

import { useState } from 'react';
import { useReport } from '@/lib/context/ReportContext';
import { DetectedProblem } from '@/lib/types/report';
import PhotoPrompt from '@/components/PhotoPrompt';

const PROBLEM_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  mangel: { bg: 'rgba(255,107,107,0.1)', border: 'rgba(255,107,107,0.3)', text: '#ff6b6b' },
  sicherheit: { bg: 'rgba(255,107,107,0.1)', border: 'rgba(255,107,107,0.3)', text: '#ff6b6b' },
  lieferverzug: { bg: 'rgba(255,184,77,0.1)', border: 'rgba(255,184,77,0.3)', text: '#FFB84D' },
  leistungsaenderung: { bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.3)', text: '#FBBF24' },
  wetterunterbrechung: { bg: 'rgba(96,165,250,0.1)', border: 'rgba(96,165,250,0.3)', text: '#60A5FA' },
};

const PROBLEM_LABELS: Record<string, string> = {
  mangel: 'Mangel erkannt',
  sicherheit: 'Sicherheitsbedenken',
  lieferverzug: 'Lieferverzug',
  leistungsaenderung: 'Leistungsänderung',
  wetterunterbrechung: 'Wetterunterbrechung',
};

export default function ProblemAction() {
  const { state } = useReport();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleAction = (typ: string) => {
    const msgs: Record<string, string> = {
      chef_benachrichtigen: 'Nachricht an Chef gesendet!',
      separater_bericht: 'Separater Bericht wird angelegt...',
      bedenkenanzeige: 'Bedenkenanzeige nach VOB/B §4 wird vorbereitet...',
    };
    setToastMessage(msgs[typ] || 'Aktion ausgeführt');
    setTimeout(() => setToastMessage(null), 3000);
  };

  if (state.problems.length === 0) return null;

  return (
    <div className="space-y-3 mt-6">
      <h3 className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
        Erkannte Probleme
      </h3>

      {state.problems.map((problem: DetectedProblem) => {
        const colors = PROBLEM_COLORS[problem.typ] || PROBLEM_COLORS.mangel;
        return (
          <div key={problem.id} className="rounded-xl p-4 space-y-3 border"
            style={{ backgroundColor: colors.bg, borderColor: colors.border }}>
            <div className="flex items-start gap-2">
              <span className="text-base">!</span>
              <div>
                <p className="text-xs font-semibold uppercase" style={{ color: colors.text }}>
                  {PROBLEM_LABELS[problem.typ] || problem.typ}
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-primary)' }}>
                  {problem.beschreibung}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {problem.vorgeschlagene_aktionen.map((aktion, i) => {
                if (aktion.typ === 'foto') return <PhotoPrompt key={i} />;
                return (
                  <button key={i} onClick={() => handleAction(aktion.typ)}
                    className="px-3 py-2 rounded-lg text-xs font-medium border transition-colors"
                    style={{ borderColor: 'var(--border-medium)', color: 'var(--text-primary)', backgroundColor: 'var(--bg-surface)' }}>
                    {aktion.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {toastMessage && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-sm shadow-lg animate-slide-up z-50"
          style={{ backgroundColor: 'var(--accent)', color: '#1A1A1A' }}>
          {toastMessage}
        </div>
      )}
    </div>
  );
}
