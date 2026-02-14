'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Report, FollowUpQuestion, DetectedProblem, GeminiAnalysisResult } from '@/lib/types/report';

export type FlowStep = 'start' | 'recording' | 'processing' | 'report' | 'confirm';

interface AppState {
  transcript: string;
  report: Report | null;
  questions: FollowUpQuestion[];
  problems: DetectedProblem[];
  confirmedReports: Report[];
  photos: string[];
  flowStep: FlowStep;
}

type Action =
  | { type: 'SET_TRANSCRIPT'; payload: string }
  | { type: 'SET_ANALYSIS_RESULT'; payload: GeminiAnalysisResult }
  | { type: 'UPDATE_REPORT'; payload: Report }
  | { type: 'SET_QUESTIONS'; payload: FollowUpQuestion[] }
  | { type: 'SET_PROBLEMS'; payload: DetectedProblem[] }
  | { type: 'ADD_PHOTO'; payload: string }
  | { type: 'CONFIRM_REPORT' }
  | { type: 'SET_FLOW_STEP'; payload: FlowStep }
  | { type: 'RESET' };

const initialState: AppState = {
  transcript: '',
  report: null,
  questions: [],
  problems: [],
  confirmedReports: [],
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
    case 'UPDATE_REPORT':
      return { ...state, report: action.payload };
    case 'SET_QUESTIONS':
      return { ...state, questions: action.payload };
    case 'SET_PROBLEMS':
      return { ...state, problems: action.payload };
    case 'ADD_PHOTO':
      return { ...state, photos: [...state.photos, action.payload] };
    case 'CONFIRM_REPORT':
      if (!state.report) return state;
      return {
        ...state,
        report: { ...state.report, status: 'bestaetigt' },
        confirmedReports: [...state.confirmedReports, { ...state.report, status: 'bestaetigt' }],
      };
    case 'SET_FLOW_STEP':
      return { ...state, flowStep: action.payload };
    case 'RESET':
      return {
        ...initialState,
        confirmedReports: state.confirmedReports,
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
