'use client';

import { useState, useRef, useEffect } from 'react';
import { createSpeechRecognition, isSpeechRecognitionSupported } from '@/lib/services/speechRecognition';

interface UnifiedInputProps {
  onSubmit: (text: string) => void;
  placeholder?: string;
  isLoading?: boolean;
}

export default function UnifiedInput({ onSubmit, placeholder = 'Noch etwas ergänzen...', isLoading = false }: UnifiedInputProps) {
  const [text, setText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const supported = typeof window !== 'undefined' && isSpeechRecognitionSupported();

  useEffect(() => {
    return () => { recognitionRef.current?.stop(); };
  }, []);

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setIsRecording(false);
      return;
    }
    const recognition = createSpeechRecognition({
      onResult: (transcript) => setText(transcript),
      onEnd: () => setIsRecording(false),
      onError: () => setIsRecording(false),
    });
    if (recognition) {
      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    }
  };

  const handleSubmit = () => {
    if (!text.trim() || isLoading) return;
    onSubmit(text.trim());
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex items-center gap-2 rounded-xl border p-2"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: isRecording ? 'var(--danger)' : 'var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
      }}>
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={isRecording ? 'Sprich jetzt...' : placeholder}
        disabled={isLoading}
        className="flex-1 bg-transparent text-sm outline-none px-2"
        style={{ color: 'var(--text-primary)' }}
      />
      {supported && (
        <button
          onClick={toggleRecording}
          disabled={isLoading}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
          style={{
            backgroundColor: isRecording ? 'var(--danger)' : 'var(--accent-dim)',
          }}
          aria-label={isRecording ? 'Aufnahme stoppen' : 'Sprechen'}
        >
          {isRecording ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-4 h-4">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" style={{ fill: '#059669' }}>
              <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4Z" />
              <path d="M6 11a1 1 0 0 0-2 0 8 8 0 0 0 7 7.93V21H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.07A8 8 0 0 0 20 11a1 1 0 1 0-2 0 6 6 0 0 1-12 0Z" />
            </svg>
          )}
        </button>
      )}
      <button
        onClick={handleSubmit}
        disabled={!text.trim() || isLoading}
        className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-30"
        style={{ backgroundColor: 'var(--accent)' }}
        aria-label="Senden"
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-4 h-4" style={{ fill: '#1A1A1A' }}>
            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
          </svg>
        )}
      </button>
    </div>
  );
}
