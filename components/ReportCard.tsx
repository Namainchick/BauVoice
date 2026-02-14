'use client';

import { SavedReport } from '@/lib/utils/storage';
import { REPORT_TYPE_LABELS } from '@/lib/types/report';

interface ReportCardProps {
  entry: SavedReport;
  onClick: () => void;
  index: number;
}

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  entwurf: { bg: 'rgba(245, 158, 11, 0.1)', text: '#D97706', label: 'Entwurf' },
  vollstaendig: { bg: 'rgba(59, 130, 246, 0.1)', text: '#2563EB', label: 'Vollständig' },
  bestaetigt: { bg: 'rgba(16, 185, 129, 0.1)', text: '#059669', label: 'Bestätigt' },
};

function completenessColor(pct: number): string {
  if (pct < 30) return '#ff6b6b';
  if (pct < 60) return '#FFB84D';
  if (pct < 80) return '#FBBF24';
  return '#059669';
}

export default function ReportCard({ entry, onClick, index }: ReportCardProps) {
  const { report } = entry;
  const status = STATUS_STYLES[report.status] || STATUS_STYLES.entwurf;
  const dateStr = new Date(entry.savedAt).toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl p-4 border transition-all active:scale-[0.98] stagger-${Math.min(index + 1, 5)}`}
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span
            className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2"
            style={{ backgroundColor: 'var(--accent-dim)', color: '#059669' }}
          >
            {REPORT_TYPE_LABELS[report.berichtstyp]}
          </span>
          <p className="font-medium text-sm truncate" style={{ color: 'var(--text-primary)' }}>
            {report.allgemeine_informationen.projekt || 'Ohne Projektname'}
          </p>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
            {dateStr}
          </p>
        </div>
        <span
          className="text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap"
          style={{ backgroundColor: status.bg, color: status.text }}
        >
          {status.label}
        </span>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="flex-1 h-1.5 rounded-full" style={{ backgroundColor: 'var(--border-subtle)' }}>
          <div
            className="h-1.5 rounded-full transition-all duration-500"
            style={{
              width: `${report.vollstaendigkeit}%`,
              backgroundColor: completenessColor(report.vollstaendigkeit),
            }}
          />
        </div>
        <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
          {report.vollstaendigkeit}%
        </span>
      </div>
    </button>
  );
}
