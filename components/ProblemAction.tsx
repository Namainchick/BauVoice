'use client';

import { useState } from 'react';
import { useReport } from '@/lib/context/ReportContext';
import { DetectedProblem } from '@/lib/types/report';
import PhotoPrompt from '@/components/PhotoPrompt';

const PROBLEM_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  mangel: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' },
  sicherheit: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' },
  lieferverzug: { bg: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-800' },
  leistungsaenderung: { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' },
  wetterunterbrechung: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' },
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

  const handleAction = (actionTyp: string) => {
    if (actionTyp === 'chef_benachrichtigen') {
      setToastMessage('Nachricht an Chef gesendet!');
      setTimeout(() => setToastMessage(null), 3000);
    }
    if (actionTyp === 'separater_bericht') {
      setToastMessage('Separater Bericht wird angelegt...');
      setTimeout(() => setToastMessage(null), 3000);
    }
    if (actionTyp === 'bedenkenanzeige') {
      setToastMessage('Bedenkenanzeige nach VOB/B §4 wird vorbereitet...');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  if (state.problems.length === 0) return null;

  return (
    <div className="space-y-3 mt-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">Erkannte Probleme</h3>

      {state.problems.map((problem: DetectedProblem) => {
        const colors = PROBLEM_COLORS[problem.typ] || PROBLEM_COLORS.mangel;
        return (
          <div key={problem.id} className={`${colors.bg} ${colors.border} border rounded-xl p-4 space-y-3`}>
            <div className="flex items-start gap-2">
              <span className="text-lg">⚠️</span>
              <div>
                <p className={`text-xs font-medium ${colors.text} uppercase`}>
                  {PROBLEM_LABELS[problem.typ] || problem.typ}
                </p>
                <p className="text-sm text-gray-800 mt-1">{problem.beschreibung}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {problem.vorgeschlagene_aktionen.map((aktion, i) => {
                if (aktion.typ === 'foto') {
                  return <PhotoPrompt key={i} />;
                }
                return (
                  <button
                    key={i}
                    onClick={() => handleAction(aktion.typ)}
                    className="flex items-center gap-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    {aktion.typ === 'chef_benachrichtigen' && '💬 '}
                    {aktion.typ === 'separater_bericht' && '📋 '}
                    {aktion.typ === 'bedenkenanzeige' && '⚠️ '}
                    {aktion.label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full text-sm shadow-lg animate-slide-up z-50">
          {toastMessage}
        </div>
      )}
    </div>
  );
}
