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
    if (questionId) {
      setAnsweredQuestions((prev) => new Set(prev).add(questionId));
    }

    try {
      const result = await mergeFollowUp(state.report, answer);
      dispatch({ type: 'SET_ANALYSIS_RESULT', payload: result });
    } catch (error) {
      console.error('Merge failed:', error);
    } finally {
      setIsLoading(false);
      setTextInput('');
    }
  };

  const unansweredQuestions = state.questions.filter((q) => !answeredQuestions.has(q.id));

  if (unansweredQuestions.length === 0 && !isLoading) return null;

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">KI-Nachfragen</h3>

      {unansweredQuestions.map((question: FollowUpQuestion) => (
        <div key={question.id} className="bg-green-50 rounded-xl p-4 space-y-3">
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-bold">KI</span>
            </div>
            <p className="text-sm text-gray-800 pt-1">{question.frage}</p>
          </div>

          {question.quick_replies && question.quick_replies.length > 0 && (
            <div className="flex flex-wrap gap-2 pl-11">
              {question.quick_replies.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => handleAnswer(reply, question.id)}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-white border border-green-300 text-green-700 rounded-full text-sm hover:bg-green-100 transition-colors disabled:opacity-50"
                >
                  {reply}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="flex gap-2">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAnswer(textInput)}
          placeholder="Antwort eingeben..."
          className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          disabled={isLoading}
        />
        <button
          onClick={() => handleAnswer(textInput)}
          disabled={isLoading || !textInput.trim()}
          className="px-4 py-3 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
        >
          {isLoading ? '...' : 'Senden'}
        </button>
      </div>

      {isLoading && (
        <p className="text-sm text-gray-400 text-center animate-pulse">Bericht wird aktualisiert...</p>
      )}
    </div>
  );
}
