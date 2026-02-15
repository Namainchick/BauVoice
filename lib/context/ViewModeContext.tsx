'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

type ViewMode = 'auto' | 'force-desktop' | 'force-mobile';

interface ViewModeState {
  viewMode: ViewMode;
  isDesktop: boolean;
  setViewMode: (mode: ViewMode) => void;
}

const ViewModeContext = createContext<ViewModeState | null>(null);

const STORAGE_KEY = 'bauvoice-view-mode';
const BREAKPOINT = '(min-width: 768px)';

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewModeState] = useState<ViewMode>('auto');
  const [matchesDesktop, setMatchesDesktop] = useState(false);

  // Load saved preference
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as ViewMode | null;
    if (saved && ['auto', 'force-desktop', 'force-mobile'].includes(saved)) {
      setViewModeState(saved);
    }
  }, []);

  // Listen to viewport changes
  useEffect(() => {
    const mql = window.matchMedia(BREAKPOINT);
    setMatchesDesktop(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatchesDesktop(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    localStorage.setItem(STORAGE_KEY, mode);
  }, []);

  const isDesktop =
    viewMode === 'force-desktop' ? true :
    viewMode === 'force-mobile' ? false :
    matchesDesktop;

  return (
    <ViewModeContext.Provider value={{ viewMode, isDesktop, setViewMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);
  if (!context) {
    throw new Error('useViewMode must be used within a ViewModeProvider');
  }
  return context;
}
