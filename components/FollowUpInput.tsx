'use client';

import { useState, useRef } from 'react';
import { useReport } from '@/lib/context/ReportContext';
import { mergeFollowUp } from '@/lib/services/gemini';
import { createSpeechRecognition, isSpeechRecognitionSupported } from '@/lib/services/speechRecognition';

export default function FollowUpInput() {
  const { state, dispatch } = useReport();
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const handleSubmit = async (input: string) => {
    if (!state.report || !input.trim()) return;
    setIsLoading(true);
    try {
      const result = await mergeFollowUp(state.report, input);
      dispatch({ type: 'SET_ANALYSIS_RESULT', payload: result });
      setText(''); setIsOpen(false);
    } catch (error) { console.error('Follow-up merge failed:', error); }
    finally { setIsLoading(false); }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop(); recognitionRef.current = null; setIsRecording(false);
      return;
    }
    const recognition = createSpeechRecognition({
      onResult: (transcript) => setText(transcript),
      onEnd: () => setIsRecording(false),
      onError: () => setIsRecording(false),
    });
    if (recognition) { recognitionRef.current = recognition; recognition.start(); setIsRecording(true); }
  };

  if (!isOpen) {
    return (
      <div className="mt-6">
        <button onClick={() => setIsOpen(true)}
          className="w-full py-3 border-2 border-dashed rounded-xl text-sm font-medium transition-colors"
          style={{ borderColor: 'var(--border-medium)', color: 'var(--text-tertiary)' }}>
          + Noch etwas ergänzen?
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3 rounded-xl p-4 border"
      style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Was möchtest du ergänzen?</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)}
        placeholder="Ach ja, vergessen — wir haben auch noch..."
        className="w-full h-24 p-3 rounded-xl text-sm resize-none border focus:outline-none"
        style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }} />
      <div className="flex gap-2">
        {typeof window !== 'undefined' && isSpeechRecognitionSupported() && (
          <button onClick={toggleRecording}
            className="px-4 py-2 rounded-xl text-xs font-medium transition-colors"
            style={{
              backgroundColor: isRecording ? 'var(--danger)' : 'var(--bg-surface-hover)',
              color: isRecording ? 'white' : 'var(--text-secondary)',
            }}>
            {isRecording ? 'Stop' : 'Sprechen'}
          </button>
        )}
        <button onClick={() => handleSubmit(text)} disabled={isLoading || !text.trim()}
          className="flex-1 py-2 rounded-xl text-sm font-medium disabled:opacity-50 transition-all active:scale-95"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}>
          {isLoading ? 'Wird aktualisiert...' : 'Ergänzen'}
        </button>
        <button onClick={() => { setIsOpen(false); setText(''); }}
          className="px-4 py-2 text-xs transition-colors" style={{ color: 'var(--text-tertiary)' }}>
          Abbrechen
        </button>
      </div>
    </div>
  );
}
