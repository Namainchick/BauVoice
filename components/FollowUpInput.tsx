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
      setText('');
      setIsOpen(false);
    } catch (error) {
      console.error('Follow-up merge failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setIsRecording(false);
      return;
    }

    const recognition = createSpeechRecognition({
      onResult: (transcript) => {
        setText(transcript);
      },
      onEnd: () => setIsRecording(false),
      onError: () => setIsRecording(false),
    });

    if (recognition) {
      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    }
  };

  if (!isOpen) {
    return (
      <div className="mt-6">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 text-sm font-medium hover:border-green-400 hover:text-green-600 transition-colors"
        >
          + Noch etwas ergänzen?
        </button>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-3 bg-gray-50 rounded-xl p-4">
      <p className="text-sm text-gray-600">Was möchtest du ergänzen?</p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Ach ja, vergessen – wir haben auch noch..."
        className="w-full h-24 p-3 border border-gray-300 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
      />

      <div className="flex gap-2">
        {typeof window !== 'undefined' && isSpeechRecognitionSupported() && (
          <button
            onClick={toggleRecording}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              isRecording
                ? 'bg-red-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {isRecording ? '⏹ Stop' : '🎤 Sprechen'}
          </button>
        )}
        <button
          onClick={() => handleSubmit(text)}
          disabled={isLoading || !text.trim()}
          className="flex-1 py-2 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600 disabled:opacity-50 transition-colors"
        >
          {isLoading ? 'Wird aktualisiert...' : 'Ergänzen'}
        </button>
        <button
          onClick={() => { setIsOpen(false); setText(''); }}
          className="px-4 py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors"
        >
          Abbrechen
        </button>
      </div>
    </div>
  );
}
