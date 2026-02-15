'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Report, FollowUpQuestion, DetectedProblem, GeminiAnalysisResult } from '@/lib/types/report';
import { SavedReport, loadReports, saveReport, isDemoLoaded, markDemoLoaded, generateReportId } from '@/lib/utils/storage';
import { DEMO_REPORTS } from '@/lib/data/demoReports';

export type FlowStep = 'start' | 'recording' | 'processing' | 'report' | 'confirm';

export interface AppState {
  transcript: string;
  report: Report | null;
  questions: FollowUpQuestion[];
  problems: DetectedProblem[];
  savedReports: SavedReport[];
  currentReportId: string | null;
  photos: string[];
  flowStep: FlowStep;
}

type Action =
  | { type: 'SET_TRANSCRIPT'; payload: string }
  | { type: 'SET_ANALYSIS_RESULT'; payload: GeminiAnalysisResult }
  | { type: 'MERGE_FOLLOW_UP_RESULT'; payload: { answeredQuestionId?: string; result: GeminiAnalysisResult } }
  | { type: 'UPDATE_REPORT'; payload: Report }
  | { type: 'SET_QUESTIONS'; payload: FollowUpQuestion[] }
  | { type: 'SET_PROBLEMS'; payload: DetectedProblem[] }
  | { type: 'ADD_PHOTO'; payload: string }
  | { type: 'CONFIRM_REPORT' }
  | { type: 'SET_FLOW_STEP'; payload: FlowStep }
  | { type: 'LOAD_SAVED_REPORTS'; payload: SavedReport[] }
  | { type: 'SET_CURRENT_REPORT_ID'; payload: string }
  | { type: 'VIEW_SAVED_REPORT'; payload: SavedReport }
  | { type: 'RESET' };

const initialState: AppState = {
  transcript: '',
  report: null,
  questions: [],
  problems: [],
  savedReports: [],
  currentReportId: null,
  photos: [],
  flowStep: 'start',
};

function reportReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_TRANSCRIPT':
      return { ...state, transcript: action.payload };
    case 'SET_ANALYSIS_RESULT':
      return {
        ...state,
        report: action.payload.report,
        questions: action.payload.questions,
        problems: action.payload.problems,
      };
    case 'MERGE_FOLLOW_UP_RESULT': {
      const { answeredQuestionId, result } = action.payload;
      // Remove the answered question, keep all other unanswered ones
      const remaining = state.questions.filter((q) => q.id !== answeredQuestionId);
      // Add only genuinely new questions from Gemini (avoid duplicates by frage text)
      const existingTexts = new Set(remaining.map((q) => q.frage));
      const newQuestions = result.questions.filter((q) => !existingTexts.has(q.frage));
      return {
        ...state,
        report: result.report,
        questions: [...remaining, ...newQuestions],
        problems: result.problems,
      };
    }
    case 'UPDATE_REPORT':
      return { ...state, report: action.payload };
    case 'SET_QUESTIONS':
      return { ...state, questions: action.payload };
    case 'SET_PROBLEMS':
      return { ...state, problems: action.payload };
    case 'ADD_PHOTO':
      return { ...state, photos: [...state.photos, action.payload] };
    case 'CONFIRM_REPORT': {
      if (!state.report) return state;
      const confirmed = { ...state.report, status: 'bestaetigt' as const };
      const entry: SavedReport = {
        id: state.currentReportId || generateReportId(),
        report: confirmed,
        questions: [],
        problems: [],
        savedAt: new Date().toISOString(),
      };
      saveReport(entry);
      const updatedReports = loadReports();
      return {
        ...state,
        report: confirmed,
        savedReports: updatedReports,
      };
    }
    case 'SET_FLOW_STEP':
      return { ...state, flowStep: action.payload };
    case 'LOAD_SAVED_REPORTS':
      return { ...state, savedReports: action.payload };
    case 'SET_CURRENT_REPORT_ID':
      return { ...state, currentReportId: action.payload };
    case 'VIEW_SAVED_REPORT':
      return {
        ...state,
        report: action.payload.report,
        questions: action.payload.questions,
        problems: action.payload.problems,
        currentReportId: action.payload.id,
      };
    case 'RESET':
      return {
        ...initialState,
        savedReports: state.savedReports,
      };
    default:
      return state;
  }
}

const ReportContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
} | null>(null);

export function ReportProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reportReducer, initialState);

  useEffect(() => {
    if (!isDemoLoaded()) {
      for (const demo of DEMO_REPORTS) {
        saveReport(demo);
      }
      markDemoLoaded();
    }
    dispatch({ type: 'LOAD_SAVED_REPORTS', payload: loadReports() });
  }, []);

  return (
    <ReportContext.Provider value={{ state, dispatch }}>
      {children}
    </ReportContext.Provider>
  );
}

export function useReport() {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReport must be used within a ReportProvider');
  }
  return context;
}
