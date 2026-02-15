'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useReport } from '@/lib/context/ReportContext';
import { generateReportId, loadReports } from '@/lib/utils/storage';
import { DEMO_TRANSCRIPT } from '@/lib/data/demoReports';
import { analyzeTranscript, mergeFollowUp } from '@/lib/services/gemini';
import { createSpeechRecognition, isSpeechRecognitionSupported } from '@/lib/services/speechRecognition';
import SmartPrompt from '@/components/SmartPrompt';
import ProcessingState from '@/components/ProcessingState';
import ReportView from '@/components/ReportView';
import AIChat from '@/components/AIChat';
import ProblemAction from '@/components/ProblemAction';
import UnifiedInput from '@/components/UnifiedInput';
import { REPORT_TYPE_LABELS } from '@/lib/types/report';
import { getReportStats, formatDate } from '@/lib/utils/reportHelpers';

type Phase = 'idle' | 'recording' | 'processing' | 'report' | 'confirmed';

export default function NeuPage() {
  const router = useRouter();
  const { state, dispatch } = useReport();

  const [phase, setPhase] = useState<Phase>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimText, setInterimText] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [followUpLoading, setFollowUpLoading] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const supported = typeof window !== 'undefined' && isSpeechRecognitionSupported();

  // Timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRecording]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  // Start recording
  const startRecording = useCallback(() => {
    dispatch({ type: 'SET_CURRENT_REPORT_ID', payload: generateReportId() });
    const recognition = createSpeechRecognition({
      onResult: (text, isFinal) => {
        if (isFinal) { setTranscript(text); setInterimText(''); }
        else { setInterimText(text); }
      },
      onEnd: () => setIsRecording(false),
      onError: (err) => {
        console.error('Speech recognition error:', err);
        setIsRecording(false);
      },
    });
    if (recognition) {
      recognitionRef.current = recognition;
      recognition.start();
      setIsRecording(true);
      setSeconds(0);
      setPhase('recording');
    }
  }, [dispatch]);

  // Stop recording → analyze
  const stopAndAnalyze = useCallback(async (text: string) => {
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
    setIsRecording(false);
    if (!text.trim()) return;

    dispatch({ type: 'SET_TRANSCRIPT', payload: text.trim() });
    setPhase('processing');

    try {
      const result = await analyzeTranscript(text.trim());
      dispatch({ type: 'SET_ANALYSIS_RESULT', payload: result });
      setPhase('report');
    } catch (err) {
      console.error('Gemini analysis failed:', err);
      setError('Analyse fehlgeschlagen. Bitte versuche es erneut.');
    }
  }, [dispatch]);

  // Demo report
  const handleDemo = useCallback(async () => {
    dispatch({ type: 'SET_CURRENT_REPORT_ID', payload: generateReportId() });
    dispatch({ type: 'SET_TRANSCRIPT', payload: DEMO_TRANSCRIPT });
    setTranscript(DEMO_TRANSCRIPT);
    setPhase('processing');

    try {
      const result = await analyzeTranscript(DEMO_TRANSCRIPT);
      dispatch({ type: 'SET_ANALYSIS_RESULT', payload: result });
      setPhase('report');
    } catch (err) {
      console.error('Gemini analysis failed:', err);
      setError('Analyse fehlgeschlagen. Bitte versuche es erneut.');
    }
  }, [dispatch]);

  // Follow-up
  const handleFollowUp = useCallback(async (input: string) => {
    if (!state.report || !input.trim()) return;
    setFollowUpLoading(true);
    try {
      const result = await mergeFollowUp(state.report, input);
      dispatch({ type: 'MERGE_FOLLOW_UP_RESULT', payload: { result } });
    } catch (err) {
      console.error('Follow-up merge failed:', err);
    } finally {
      setFollowUpLoading(false);
    }
  }, [state.report, dispatch]);

  // Confirm
  const handleConfirm = useCallback(() => {
    dispatch({ type: 'CONFIRM_REPORT' });
    dispatch({ type: 'LOAD_SAVED_REPORTS', payload: loadReports() });
    setPhase('confirmed');
  }, [dispatch]);

  // Reset for new report
  const handleNewReport = useCallback(() => {
    dispatch({ type: 'RESET' });
    setPhase('idle');
    setTranscript('');
    setInterimText('');
    setSeconds(0);
    setError(null);
  }, [dispatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => { recognitionRef.current?.stop(); };
  }, []);

  // ─── PHASE: IDLE ───
  if (phase === 'idle') {
    return (
      <div className="flex flex-col min-h-screen p-6 animate-fade-in">
        <div className="pt-6 mb-6">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Neuer <span style={{ color: '#059669' }}>Bericht</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            Denk an diese Punkte:
          </p>
        </div>

        <SmartPrompt />

        <div className="flex-1" />

        <div className="flex flex-col items-center gap-4 py-8">
          <button
            onClick={startRecording}
            disabled={!supported}
            className="w-20 h-20 rounded-full flex items-center justify-center transition-all active:scale-95 animate-pulse-glow"
            style={{ backgroundColor: 'var(--accent)' }}
            aria-label="Aufnahme starten"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-10 h-10" style={{ fill: '#1A1A1A' }}>
              <path d="M12 1a4 4 0 0 0-4 4v7a4 4 0 0 0 8 0V5a4 4 0 0 0-4-4Z" />
              <path d="M6 11a1 1 0 0 0-2 0 8 8 0 0 0 7 7.93V21H8a1 1 0 1 0 0 2h8a1 1 0 1 0 0-2h-3v-2.07A8 8 0 0 0 20 11a1 1 0 1 0-2 0 6 6 0 0 1-12 0Z" />
            </svg>
          </button>
          <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Tippe zum Aufnehmen
          </span>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-subtle)' }} />
          <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>oder</span>
          <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border-subtle)' }} />
        </div>

        <div className="flex flex-col gap-3 pb-4">
          <UnifiedInput
            onSubmit={(text) => {
              dispatch({ type: 'SET_CURRENT_REPORT_ID', payload: generateReportId() });
              stopAndAnalyze(text);
            }}
            placeholder="Oder hier Text eingeben..."
          />
          <button
            onClick={handleDemo}
            className="w-full py-3 rounded-xl text-sm font-medium border transition-all active:scale-[0.98]"
            style={{
              borderColor: 'var(--border-medium)',
              color: 'var(--text-secondary)',
              backgroundColor: 'transparent',
            }}
          >
            Demo Bericht erstellen
          </button>
        </div>
      </div>
    );
  }

  // ─── PHASE: RECORDING ───
  if (phase === 'recording') {
    const currentText = transcript || interimText;
    return (
      <div className="flex flex-col min-h-screen p-6 animate-fade-in">
        <div className="pt-6 mb-6 text-center">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            Bau<span style={{ color: '#059669' }}>Voice</span>
          </h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
            Sprich einfach drauf los
          </p>
        </div>

        <div className="flex flex-col items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: 'var(--danger)' }} />
            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              Aufnahme läuft — {formatTime(seconds)}
            </span>
          </div>

          <button
            onClick={() => stopAndAnalyze(currentText)}
            className="w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 animate-pulse"
            style={{ backgroundColor: 'var(--danger)' }}
            aria-label="Aufnahme beenden"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" className="w-10 h-10">
              <rect x="6" y="6" width="12" height="12" rx="2" />
            </svg>
          </button>
          <span className="text-sm" style={{ color: 'var(--text-tertiary)' }}>
            Zum Beenden tippen
          </span>

          <div className="w-full min-h-[120px] rounded-xl p-4 text-sm border"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
            {currentText ? (
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
        </div>
      </div>
    );
  }

  // ─── PHASE: PROCESSING ───
  if (phase === 'processing') {
    if (error) {
      return (
        <div className="flex flex-col min-h-screen items-center justify-center p-6">
          <div className="w-full max-w-sm rounded-2xl p-6 text-center border"
            style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6" style={{ fill: 'var(--danger)' }}>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
              </svg>
            </div>
            <p className="text-base font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Etwas ist schiefgelaufen
            </p>
            <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>{error}</p>
            <button onClick={handleNewReport}
              className="w-full py-3 rounded-xl font-medium text-base transition-all active:scale-[0.98]"
              style={{ backgroundColor: 'var(--accent)', color: '#1A1A1A' }}>
              Nochmal versuchen
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex flex-col min-h-screen items-center justify-center p-6">
        <ProcessingState />
      </div>
    );
  }

  // ─── PHASE: CONFIRMED ───
  if (phase === 'confirmed' && state.report) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 p-6 py-12 min-h-screen">
        <div className="w-20 h-20 rounded-full flex items-center justify-center animate-zoom-in"
          style={{ backgroundColor: 'var(--accent)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-10 h-10" style={{ fill: '#1A1A1A' }}>
            <path fillRule="evenodd" d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Bericht bestätigt!</h2>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            {REPORT_TYPE_LABELS[state.report.berichtstyp]} — {state.report.allgemeine_informationen.projekt}
          </p>
        </div>
        <div className="w-full max-w-sm flex flex-col gap-3">
          <button onClick={handleNewReport}
            className="w-full py-4 rounded-xl font-medium text-base transition-all active:scale-[0.98]"
            style={{ backgroundColor: 'var(--accent)', color: '#1A1A1A' }}>
            Neuen Bericht erstellen
          </button>
          <button onClick={() => { dispatch({ type: 'RESET' }); router.push('/'); }}
            className="w-full py-3 rounded-xl text-sm font-medium border transition-all active:scale-[0.98]"
            style={{ borderColor: 'var(--border-medium)', color: 'var(--text-secondary)' }}>
            Zurück zur Übersicht
          </button>
        </div>
      </div>
    );
  }

  // ─── PHASE: REPORT ───
  if (phase === 'report' && state.report) {
    const report = state.report;

    return (
      <div className="flex flex-col min-h-screen p-6 animate-fade-in">
        <div className="pt-4 mb-6">
          <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
            Bau<span style={{ color: '#059669' }}>Voice</span>
          </h1>
        </div>

        <ReportView />
        <AIChat />
        <ProblemAction />

        {/* Always-visible follow-up input */}
        <div className="mt-6">
          <UnifiedInput
            onSubmit={handleFollowUp}
            placeholder="Noch etwas ergänzen..."
            isLoading={followUpLoading}
          />
        </div>

        {/* Confirm section */}
        <div className="mt-6 rounded-xl p-5 space-y-3 border"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
              style={{ backgroundColor: 'var(--accent-dim)', color: '#059669' }}>
              {REPORT_TYPE_LABELS[report.berichtstyp]}
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            {report.allgemeine_informationen.projekt} — {formatDate(report.allgemeine_informationen.datum)}
          </p>
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'var(--border-subtle)' }}>
              <div className="h-1.5 rounded-full" style={{ width: `${report.vollstaendigkeit}%`, backgroundColor: 'var(--accent)' }} />
            </div>
            <span className="text-sm font-medium" style={{ color: '#059669' }}>{report.vollstaendigkeit}%</span>
          </div>
        </div>

        <div className="mt-4 pb-8">
          <button onClick={handleConfirm}
            className="w-full py-4 rounded-xl font-medium text-base transition-all active:scale-[0.98] shadow-lg"
            style={{ backgroundColor: 'var(--accent)', color: '#1A1A1A' }}>
            Bericht bestätigen & speichern
          </button>
        </div>
      </div>
    );
  }

  // Fallback — shouldn't reach here
  return null;
}
