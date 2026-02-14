'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { createSpeechRecognition, isSpeechRecognitionSupported } from '@/lib/services/speechRecognition';
import { useReport } from '@/lib/context/ReportContext';

interface VoiceRecorderProps {
  onStop: (transcript: string) => void;
}

export default function VoiceRecorder({ onStop }: VoiceRecorderProps) {
  const { dispatch } = useReport();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [fallbackMode, setFallbackMode] = useState(false);
  const [fallbackText, setFallbackText] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const startedRef = useRef(false);

  const supported = typeof window !== 'undefined' && isSpeechRecognitionSupported();

  useEffect(() => {
    if (!supported) {
      setFallbackMode(true);
    }
  }, [supported]);

  const startRecording = useCallback(() => {
    const recognition = createSpeechRecognition({
      onResult: (text, isFinal) => {
        if (isFinal) {
          setTranscript(text);
          setInterimText('');
        } else {
          setInterimText(text);
        }
      },
      onEnd: () => {
        setIsRecording(false);
      },
      onError: (error) => {
        console.error('Speech recognition error:', error);
        if (error === 'not-allowed') {
          setFallbackMode(true);
        }
        setIsRecording(false);
      },
    });

    if (recognition) {
      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
    } else {
      setFallbackMode(true);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
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
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [fallbackMode, startRecording]);

  if (fallbackMode) {
    return (
      <div className="space-y-4">
        <p className="text-gray-600 text-center">
          Spracherkennung nicht verfügbar. Beschreibe deinen Arbeitstag als Text:
        </p>
        <textarea
          value={fallbackText}
          onChange={(e) => setFallbackText(e.target.value)}
          placeholder="Heute war ich mit Kevin auf der Baustelle Müller. Wir haben von 7 bis 16 Uhr die Dampfsperre verlegt..."
          className="w-full h-48 p-4 border border-gray-300 rounded-xl text-base resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          autoFocus
        />
        <button
          onClick={handleFallbackSubmit}
          disabled={!fallbackText.trim()}
          className="w-full py-4 bg-green-500 text-white rounded-xl font-medium text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 active:bg-green-700 transition-colors"
        >
          Bericht analysieren
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-2">
        <div className={`w-3 h-3 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`} />
        <span className="text-gray-600 text-sm">
          {isRecording ? 'Aufnahme läuft...' : 'Aufnahme gestoppt'}
        </span>
      </div>

      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 ${
          isRecording
            ? 'bg-red-500 hover:bg-red-600 animate-pulse'
            : 'bg-green-500 hover:bg-green-600'
        }`}
        aria-label={isRecording ? 'Aufnahme beenden' : 'Aufnahme starten'}
      >
        {isRecording ? (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-10 h-10">
            <rect x="6" y="6" width="12" height="12" rx="2" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-10 h-10">
            <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4Z" />
            <path d="M6 11a1 1 0 0 0-2 0 8 8 0 0 0 7 7.93V21H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.07A8 8 0 0 0 20 11a1 1 0 1 0-2 0 6 6 0 0 1-12 0Z" />
          </svg>
        )}
      </button>
      <span className="text-gray-500 text-sm">
        {isRecording ? 'Zum Beenden tippen' : 'Aufnahme starten'}
      </span>

      <div className="w-full min-h-[120px] bg-gray-50 rounded-xl p-4 text-base">
        {(transcript || interimText) ? (
          <>
            <span className="text-gray-900">{transcript}</span>
            {interimText && !transcript && (
              <span className="text-gray-400">{interimText}</span>
            )}
          </>
        ) : (
          <span className="text-gray-400 italic">Warte auf Spracheingabe...</span>
        )}
      </div>

      {(transcript || interimText) && (
        <button
          onClick={stopRecording}
          className="w-full py-4 bg-green-500 text-white rounded-xl font-medium text-lg hover:bg-green-600 active:bg-green-700 transition-colors"
        >
          Bericht analysieren
        </button>
      )}
    </div>
  );
}
