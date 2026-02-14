import { Report, FollowUpQuestion, DetectedProblem } from '@/lib/types/report';

const STORAGE_KEY = 'bauvoice_reports';
const DEMO_LOADED_KEY = 'bauvoice_demo_loaded';

export interface SavedReport {
  id: string;
  report: Report;
  questions: FollowUpQuestion[];
  problems: DetectedProblem[];
  savedAt: string;
}

export function generateReportId(): string {
  return `report_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export function loadReports(): SavedReport[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveReport(entry: SavedReport): void {
  const reports = loadReports();
  const idx = reports.findIndex((r) => r.id === entry.id);
  if (idx >= 0) {
    reports[idx] = entry;
  } else {
    reports.unshift(entry);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function deleteReport(id: string): void {
  const reports = loadReports().filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

export function clearAllReports(): void {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(DEMO_LOADED_KEY);
}

export function isDemoLoaded(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(DEMO_LOADED_KEY) === 'true';
}

export function markDemoLoaded(): void {
  localStorage.setItem(DEMO_LOADED_KEY, 'true');
}
