'use client';

import { useReport } from '@/lib/context/ReportContext';
import { useViewMode } from '@/lib/context/ViewModeContext';
import { REPORT_TYPE_LABELS } from '@/lib/types/report';
import ReportSection from '@/components/ReportSection';

function completenessColor(pct: number): string {
  if (pct < 30) return 'var(--danger)';
  if (pct < 60) return 'var(--warning)';
  if (pct < 80) return '#FBBF24';
  return '#059669';
}

export default function ReportView() {
  const { state } = useReport();
  const { isDesktop } = useViewMode();
  const { report } = state;
  if (!report) return null;

  const info = report.allgemeine_informationen;

  return (
    <div className="space-y-3 animate-fade-in">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
          style={{ backgroundColor: 'var(--accent-dim)', color: '#059669' }}>
          {REPORT_TYPE_LABELS[report.berichtstyp]}
        </span>
        <span className="text-sm font-medium" style={{ color: completenessColor(report.vollstaendigkeit) }}>
          {report.vollstaendigkeit}%
        </span>
      </div>

      <div className="w-full h-1.5 rounded-full" style={{ backgroundColor: 'var(--border-subtle)' }}>
        <div className="h-1.5 rounded-full transition-all duration-700 animate-count-up"
          style={{ width: `${report.vollstaendigkeit}%`, backgroundColor: completenessColor(report.vollstaendigkeit) }} />
      </div>

      <div className={isDesktop ? "grid grid-cols-2 gap-3 mt-4" : "space-y-2 mt-4"}>
        <ReportSection title="Allgemeine Informationen" defaultOpen>
          <div className="space-y-2 text-sm">
            {[
              ['Projekt', info.projekt],
              ['Adresse', info.adresse],
              ['Datum', info.datum],
              ['Erstellt von', info.erstellt_von],
              ['Wetter', info.wetter],
              ['Temperatur', info.temperatur],
            ].filter(([, v]) => v).map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{val}</span>
              </div>
            ))}
          </div>
        </ReportSection>

        <ReportSection title="Mitarbeiter" isEmpty={report.mitarbeiter.length === 0}>
          <ul className="space-y-1">
            {report.mitarbeiter.map((m, i) => (
              <li key={i} className="text-sm flex items-center gap-2">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                  style={{ backgroundColor: 'var(--accent-dim)', color: '#059669' }}>
                  {m.charAt(0).toUpperCase()}
                </span>
                <span style={{ color: 'var(--text-primary)' }}>{m}</span>
              </li>
            ))}
          </ul>
        </ReportSection>

        <ReportSection title="Arbeitszeiten"
          isEmpty={!report.arbeitszeiten?.von && !report.arbeitszeiten?.bis}>
          {report.arbeitszeiten && (
            <div className="space-y-2 text-sm">
              {[
                ['Von', report.arbeitszeiten.von],
                ['Bis', report.arbeitszeiten.bis],
                ['Pause', report.arbeitszeiten.pause],
                ['Gesamt', report.arbeitszeiten.gesamt],
              ].filter(([, v]) => v).map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
                  <span style={{ color: 'var(--text-primary)' }}>{val}</span>
                </div>
              ))}
            </div>
          )}
        </ReportSection>

        <ReportSection title="Leistungen" isEmpty={report.leistungen.length === 0}>
          <ul className="space-y-3">
            {report.leistungen.map((l, i) => (
              <li key={i} className="text-sm pb-2 last:pb-0" style={{ borderBottom: i < report.leistungen.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{l.beschreibung}</p>
                {(l.menge || l.dauer) && (
                  <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {l.menge && `${l.menge} ${l.einheit || ''}`}
                    {l.menge && l.dauer && ' · '}
                    {l.dauer && `Dauer: ${l.dauer}`}
                  </p>
                )}
              </li>
            ))}
          </ul>
        </ReportSection>

        <ReportSection title="Materialien" isEmpty={report.materialien.length === 0}>
          <ul className="space-y-2">
            {report.materialien.map((m, i) => (
              <li key={i} className="text-sm flex justify-between">
                <span style={{ color: 'var(--text-primary)' }}>{m.bezeichnung}</span>
                {m.menge && <span style={{ color: 'var(--text-secondary)' }}>{m.menge} {m.einheit || ''}</span>}
              </li>
            ))}
          </ul>
        </ReportSection>

        <ReportSection title="Geräte" isEmpty={report.geraete.length === 0}>
          <ul className="space-y-2">
            {report.geraete.map((g, i) => (
              <li key={i} className="text-sm flex justify-between">
                <span style={{ color: 'var(--text-primary)' }}>{g.bezeichnung}</span>
                {g.einsatzdauer && <span style={{ color: 'var(--text-secondary)' }}>{g.einsatzdauer}</span>}
              </li>
            ))}
          </ul>
        </ReportSection>

        <ReportSection title="Besondere Vorkommnisse" isEmpty={!report.besondere_vorkommnisse}>
          <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{report.besondere_vorkommnisse}</p>
        </ReportSection>

        <ReportSection title="Bilder" isEmpty={report.bilder.length === 0 && state.photos.length === 0}>
          <div className="grid grid-cols-3 gap-2">
            {state.photos.map((photo, i) => (
              <img key={i} src={photo} alt={`Foto ${i + 1}`} className="w-full h-24 object-cover rounded-lg" />
            ))}
          </div>
        </ReportSection>

        {report.notizen && (
          <ReportSection title="Notizen">
            <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{report.notizen}</p>
          </ReportSection>
        )}
      </div>
    </div>
  );
}
