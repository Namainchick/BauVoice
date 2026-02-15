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

        <ReportSection title="Mitarbeiter" defaultOpen isEmpty={report.mitarbeiter.length === 0}>
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

        <ReportSection title="Leistungen" defaultOpen isEmpty={report.leistungen.length === 0}>
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

        <ReportSection title="Materialien" defaultOpen isEmpty={report.materialien.length === 0}>
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

        {/* Regiebericht sections */}
        {report.berichtstyp === 'regiebericht' && (() => {
          const r = report as import('@/lib/types/report').Regiebericht;
          return (
            <>
              <ReportSection title="Auftraggeber" defaultOpen isEmpty={!r.auftraggeber}>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{r.auftraggeber}</p>
              </ReportSection>

              <ReportSection title="Stunden-Details" defaultOpen isEmpty={!r.stunden_details?.length}>
                <ul className="space-y-3">
                  {r.stunden_details?.map((s, i) => (
                    <li key={i} className="text-sm pb-3 last:pb-0" style={{ borderBottom: i < (r.stunden_details?.length ?? 0) - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{s.mitarbeiter}</p>
                      <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>{s.taetigkeit}</p>
                      <p className="mt-0.5 text-xs font-medium" style={{ color: 'var(--accent)' }}>{s.stunden}h</p>
                    </li>
                  ))}
                </ul>
              </ReportSection>

              {r.zuschlaege && (
                <ReportSection title="Zuschläge" defaultOpen>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{r.zuschlaege}</p>
                </ReportSection>
              )}
            </>
          );
        })()}

        {/* Abnahmeprotokoll sections */}
        {report.berichtstyp === 'abnahmeprotokoll' && (() => {
          const r = report as import('@/lib/types/report').Abnahmeprotokoll;
          const ergebnisConfig: Record<string, { label: string; color: string; bg: string }> = {
            abgenommen: { label: 'Abgenommen', color: '#059669', bg: 'var(--accent-dim)' },
            abgenommen_mit_maengeln: { label: 'Abgenommen mit Mängeln', color: '#D97706', bg: '#FEF3C7' },
            nicht_abgenommen: { label: 'Nicht abgenommen', color: '#DC2626', bg: '#FEE2E2' },
          };
          const schwereConfig: Record<string, { label: string; color: string; bg: string }> = {
            leicht: { label: 'Leicht', color: '#D97706', bg: '#FEF3C7' },
            mittel: { label: 'Mittel', color: '#EA580C', bg: '#FFEDD5' },
            schwer: { label: 'Schwer', color: '#DC2626', bg: '#FEE2E2' },
          };
          return (
            <>
              <ReportSection title="Ergebnis" defaultOpen isEmpty={!r.ergebnis}>
                {r.ergebnis && ergebnisConfig[r.ergebnis] && (
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                    style={{ backgroundColor: ergebnisConfig[r.ergebnis].bg, color: ergebnisConfig[r.ergebnis].color }}>
                    {ergebnisConfig[r.ergebnis].label}
                  </span>
                )}
              </ReportSection>

              <ReportSection title="Mängel" defaultOpen isEmpty={!r.maengel?.length}>
                <ul className="space-y-3">
                  {r.maengel?.map((m, i) => (
                    <li key={i} className="text-sm pb-3 last:pb-0" style={{ borderBottom: i < (r.maengel?.length ?? 0) - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <div className="flex items-center gap-2">
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{m.beschreibung}</p>
                        {schwereConfig[m.schweregrad] && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                            style={{ backgroundColor: schwereConfig[m.schweregrad].bg, color: schwereConfig[m.schweregrad].color }}>
                            {schwereConfig[m.schweregrad].label}
                          </span>
                        )}
                      </div>
                      {m.frist && (
                        <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>Frist: {m.frist}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </ReportSection>

              {r.vorbehalte && (
                <ReportSection title="Vorbehalte" defaultOpen>
                  <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{r.vorbehalte}</p>
                </ReportSection>
              )}
            </>
          );
        })()}

        {/* Baustellenbegehung sections */}
        {report.berichtstyp === 'baustellenbegehung' && (() => {
          const r = report as import('@/lib/types/report').Baustellenbegehung;
          return (
            <>
              <ReportSection title="Sicherheit" defaultOpen isEmpty={!r.sicherheit}>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{r.sicherheit}</p>
              </ReportSection>

              <ReportSection title="Fortschritt" defaultOpen isEmpty={!r.fortschritt}>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{r.fortschritt}</p>
              </ReportSection>

              <ReportSection title="Festgestellte Mängel" defaultOpen isEmpty={!r.festgestellte_maengel?.length}>
                <ul className="space-y-1.5">
                  {r.festgestellte_maengel?.map((m, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span style={{ color: 'var(--text-tertiary)' }}>•</span>
                      <span style={{ color: 'var(--text-primary)' }}>{m}</span>
                    </li>
                  ))}
                </ul>
              </ReportSection>
            </>
          );
        })()}

        {/* Besprechungsprotokoll sections */}
        {report.berichtstyp === 'besprechungsprotokoll' && (() => {
          const r = report as import('@/lib/types/report').Besprechungsprotokoll;
          return (
            <>
              <ReportSection title="Teilnehmer" defaultOpen isEmpty={!r.teilnehmer?.length}>
                <ul className="space-y-1">
                  {r.teilnehmer?.map((t, i) => (
                    <li key={i} className="text-sm flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                        style={{ backgroundColor: 'var(--accent-dim)', color: '#059669' }}>
                        {t.name.charAt(0).toUpperCase()}
                      </span>
                      <span style={{ color: 'var(--text-primary)' }}>{t.name}</span>
                      {t.rolle && (
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>({t.rolle})</span>
                      )}
                    </li>
                  ))}
                </ul>
              </ReportSection>

              <ReportSection title="Tagesordnung" defaultOpen isEmpty={!r.tagesordnung?.length}>
                <ol className="space-y-1.5">
                  {r.tagesordnung?.map((item, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span className="font-medium" style={{ color: 'var(--text-secondary)' }}>{i + 1}.</span>
                      <span style={{ color: 'var(--text-primary)' }}>{item}</span>
                    </li>
                  ))}
                </ol>
              </ReportSection>

              <ReportSection title="Beschlüsse" defaultOpen isEmpty={!r.beschluesse?.length}>
                <ul className="space-y-1.5">
                  {r.beschluesse?.map((b, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span style={{ color: '#059669' }}>•</span>
                      <span style={{ color: 'var(--text-primary)' }}>{b}</span>
                    </li>
                  ))}
                </ul>
              </ReportSection>

              {r.naechste_schritte && r.naechste_schritte.length > 0 && (
                <ReportSection title="Nächste Schritte" defaultOpen>
                  <ul className="space-y-1.5">
                    {r.naechste_schritte.map((s, i) => (
                      <li key={i} className="text-sm flex items-start gap-2">
                        <span style={{ color: 'var(--accent)' }}>→</span>
                        <span style={{ color: 'var(--text-primary)' }}>{s}</span>
                      </li>
                    ))}
                  </ul>
                </ReportSection>
              )}
            </>
          );
        })()}

        {/* Checkliste sections */}
        {report.berichtstyp === 'checkliste' && (() => {
          const r = report as import('@/lib/types/report').Checkliste;
          const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
            ok: { label: 'OK', color: '#059669', bg: 'var(--accent-dim)' },
            mangel: { label: 'Mangel', color: '#DC2626', bg: '#FEE2E2' },
            nicht_geprueft: { label: 'Nicht geprüft', color: '#6B7280', bg: '#F3F4F6' },
          };
          return (
            <>
              <ReportSection title="Kategorie" defaultOpen isEmpty={!r.kategorie}>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{r.kategorie}</p>
              </ReportSection>

              <ReportSection title="Prüfpunkte" defaultOpen isEmpty={!r.pruefpunkte?.length}>
                <ul className="space-y-3">
                  {r.pruefpunkte?.map((p, i) => (
                    <li key={i} className="text-sm pb-3 last:pb-0" style={{ borderBottom: i < (r.pruefpunkte?.length ?? 0) - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <div className="flex items-center gap-2">
                        <p style={{ color: 'var(--text-primary)' }}>{p.punkt}</p>
                        {statusConfig[p.status] && (
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap"
                            style={{ backgroundColor: statusConfig[p.status].bg, color: statusConfig[p.status].color }}>
                            {statusConfig[p.status].label}
                          </span>
                        )}
                      </div>
                      {p.kommentar && (
                        <p className="mt-0.5 text-xs" style={{ color: 'var(--text-secondary)' }}>{p.kommentar}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </ReportSection>
            </>
          );
        })()}
      </div>
    </div>
  );
}
