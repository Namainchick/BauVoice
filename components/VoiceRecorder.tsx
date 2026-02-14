'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createSpeechRecognition, isSpeechRecognitionSupported } from '@/lib/services/speechRecognition';
import { useReport } from '@/lib/context/ReportContext';

interface VoiceRecorderProps {
  onStop: (transcript: string) => void;
  startInTextMode?: boolean;
}

export default function VoiceRecorder({ onStop, startInTextMode = false }: VoiceRecorderProps) {
  const { dispatch } = useReport();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [fallbackMode, setFallbackMode] = useState(false);
  const [fallbackText, setFallbackText] = useState('');
  const [seconds, setSeconds] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const startedRef = useRef(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const supported = typeof window !== 'undefined' && isSpeechRecognitionSupported();

  useEffect(() => {
    if (!supported || startInTextMode) setFallbackMode(true);
  }, [supported, startInTextMode]);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  const formatTime = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const startRecording = useCallback(() => {
    const recognition = createSpeechRecognition({
      onResult: (text, isFinal) => {
        if (isFinal) { setTranscript(text); setInterimText(''); }
        else { setInterimText(text); }
      },
      onEnd: () => setIsRecording(false),
      onError: (error) => {
        console.error('Speech recognition error:', error);
        if (error === 'not-allowed') setFallbackMode(true);
        setIsRecording(false);
      },
    });
    if (recognition) {
      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
      setSeconds(0);
    } else {
      setFallbackMode(true);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
    setIsRecording(false);
    const finalText = transcript || interimText;
    if (finalText.trim()) {
      dispatch({ type: 'SET_TRANSCRIPT', payload: finalText.trim() });
      onStop(finalText.trim());
    }
  }, [transcript, interimText, dispatch, onStop]);

  const handleFallbackSubmit = () => {
    if (fallbackText.trim()) {
      dispatch({ type: 'SET_TRANSCRIPT', payload: fallbackText.trim() });
      onStop(fallbackText.trim());
    }
  };

  useEffect(() => {
    if (!fallbackMode && !startedRef.current) {
      startedRef.current = true;
      startRecording();
    }
    return () => { if (recognitionRef.current) recognitionRef.current.stop(); };
  }, [fallbackMode, startRecording]);

  if (fallbackMode) {
    return (
      <div className="space-y-4">
        <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
          Spracherkennung nicht verfügbar. Beschreibe deinen Arbeitstag als Text:
        </p>
        <textarea
          value={fallbackText}
          onChange={(e) => setFallbackText(e.target.value)}
          placeholder="Heute war ich mit Kevin auf der Baustelle Müller..."
          className="w-full h-48 p-4 rounded-xl text-sm resize-none border focus:outline-none"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
          autoFocus
        />
        <button
          onClick={handleFallbackSubmit}
          disabled={!fallbackText.trim()}
          className="w-full py-4 rounded-xl font-medium text-base disabled:opacity-50 transition-all active:scale-[0.98]"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}
        >
          Bericht analysieren
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isRecording ? 'animate-pulse' : ''}`}
          style={{ backgroundColor: isRecording ? 'var(--danger)' : 'var(--text-tertiary)' }} />
        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {isRecording ? `Aufnahme läuft — ${formatTime(seconds)}` : 'Aufnahme gestoppt'}
        </span>
      </div>

      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${isRecording ? 'animate-pulse' : 'animate-pulse-glow'}`}
        style={{ backgroundColor: isRecording ? 'var(--danger)' : 'var(--accent)' }}
        aria-label={isRecording ? 'Aufnahme beenden' : 'Aufnahme starten'}
      >
        {isRecording ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-10 h-10">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-10 h-10" style={{ fill: 'var(--bg-primary)' }}>
            <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4Z" />
            <path d="M6 11a1 1 0 0 0-2 0 8 8 0 0 0 7 7.93V21H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.07A8 8 0 0 0 20 11a1 1 0 1 0-2 0 6 6 0 0 1-12 0Z" />
          </svg>
        )}
      </button>
      <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
        {isRecording ? 'Zum Beenden tippen' : 'Aufnahme starten'}
      </span>

      <div className="w-full min-h-[120px] rounded-xl p-4 text-sm border"
        style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
        {(transcript || interimText) ? (
          <>
            <span style={{ color: 'var(--text-primary)' }}>{transcript}</span>
            {interimText && !transcript && (
              <span style={{ color: 'var(--text-tertiary)' }}>{interimText}</span>
            )}
          </>
        ) : (
          <span className="italic" style={{ color: 'var(--text-tertiary)' }}>Warte auf Spracheingabe...</span>
        )}
      </div>

      {(transcript || interimText) && (
        <button
          onClick={stopRecording}
          className="w-full py-4 rounded-xl font-medium text-base transition-all active:scale-[0.98]"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--bg-primary)' }}
        >
          Bericht analysieren
        </button>
      )}
    </div>
  );
}
