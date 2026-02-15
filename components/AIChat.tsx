'use client';

import { useReport } from '@/lib/context/ReportContext';
import { FollowUpQuestion } from '@/lib/types/report';

interface AIChatProps {
  onAnswer: (answer: string) => void;
  isMergeLocked: boolean;
}

export default function AIChat({ onAnswer, isMergeLocked }: AIChatProps) {
  const { state } = useReport();

  const handleQuickReply = (question: FollowUpQuestion, reply: string) => {
    if (isMergeLocked) return;
    const contextualAnswer = `Antwort auf Frage: "${question.frage}" → ${reply}`;
    onAnswer(contextualAnswer);
  };

  if (state.questions.length === 0 && !isMergeLocked) return null;

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
        KI-Nachfragen
      </h3>

      {state.questions.map((q: FollowUpQuestion) => (
        <div key={q.id} className="rounded-xl p-4 space-y-3 border"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--accent)' }}>
              <span className="text-xs font-bold" style={{ color: '#1A1A1A' }}>KI</span>
            </div>
            <p className="text-sm pt-1" style={{ color: 'var(--text-primary)' }}>{q.frage}</p>
          </div>
          {q.quick_replies && q.quick_replies.length > 0 && (
            <div className="flex flex-wrap gap-2 pl-11">
              {q.quick_replies.map((reply, i) => (
                <button key={i} onClick={() => handleQuickReply(q, reply)} disabled={isMergeLocked}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors disabled:opacity-50"
                  style={{ borderColor: 'var(--accent)', color: '#059669' }}>
                  {reply}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {isMergeLocked && (
        <p className="text-xs text-center animate-pulse" style={{ color: 'var(--text-tertiary)' }}>
          Bericht wird aktualisiert...
        </p>
      )}
    </div>
  );
}
