'use client';

import { useState } from 'react';
import { useReport } from '@/lib/context/ReportContext';
import { mergeFollowUp } from '@/lib/services/gemini';
import { FollowUpQuestion } from '@/lib/types/report';

export default function AIChat() {
  const { state, dispatch } = useReport();
  const [isLoading, setIsLoading] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set());

  const handleAnswer = async (answer: string, questionId?: string) => {
    if (!state.report || !answer.trim()) return;
    setIsLoading(true);
    if (questionId) setAnsweredQuestions((prev) => new Set(prev).add(questionId));
    try {
      const result = await mergeFollowUp(state.report, answer);
      dispatch({ type: 'SET_ANALYSIS_RESULT', payload: result });
    } catch (error) { console.error('Merge failed:', error); }
    finally { setIsLoading(false); setTextInput(''); }
  };

  const unanswered = state.questions.filter((q) => !answeredQuestions.has(q.id));
  if (unanswered.length === 0 && !isLoading) return null;

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
        KI-Nachfragen
      </h3>

      {unanswered.map((q: FollowUpQuestion) => (
        <div key={q.id} className="rounded-xl p-4 space-y-3 border"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
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
                <button key={i} onClick={() => handleAnswer(reply, q.id)} disabled={isLoading}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors disabled:opacity-50"
                  style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                  {reply}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="flex gap-2">
        <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAnswer(textInput)}
          placeholder="Antwort eingeben..."
          className="flex-1 px-4 py-3 rounded-xl text-sm border focus:outline-none"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
          disabled={isLoading} />
        <button onClick={() => handleAnswer(textInput)} disabled={isLoading || !textInput.trim()}
          className="px-4 py-3 rounded-xl text-sm font-medium disabled:opacity-50 transition-all active:scale-95"
          style={{ backgroundColor: 'var(--accent)', color: '#1A1A1A' }}>
          {isLoading ? '...' : 'Senden'}
        </button>
      </div>

      {isLoading && (
        <p className="text-xs text-center animate-pulse" style={{ color: 'var(--text-tertiary)' }}>
          Bericht wird aktualisiert...
        </p>
      )}
    </div>
  );
}
