'use client';

import { useReport } from '@/lib/context/ReportContext';
import { REPORT_TYPE_LABELS } from '@/lib/types/report';
import ReportSection from '@/components/ReportSection';

export default function ReportView() {
  const { state } = useReport();
  const { report } = state;

  if (!report) return null;

  const info = report.allgemeine_informationen;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="bg-green-100 text-green-800 text-sm font-medium px-3 py-1 rounded-full">
          {REPORT_TYPE_LABELS[report.berichtstyp]}
        </span>
        <span className="text-sm text-gray-500">{report.vollstaendigkeit}% vollständig</span>
      </div>

      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-green-500 h-2 rounded-full transition-all duration-500"
          style={{ width: `${report.vollstaendigkeit}%` }}
        />
      </div>

      <div className="space-y-2 mt-4">
        <ReportSection title="Allgemeine Informationen" defaultOpen>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Projekt</span>
              <span className="font-medium">{info.projekt || '—'}</span>
            </div>
            {info.adresse && (
              <div className="flex justify-between">
                <span className="text-gray-500">Adresse</span>
                <span>{info.adresse}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-500">Datum</span>
              <span>{info.datum}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Erstellt von</span>
              <span>{info.erstellt_von}</span>
            </div>
            {info.wetter && (
              <div className="flex justify-between">
                <span className="text-gray-500">Wetter</span>
                <span>{info.wetter}</span>
              </div>
            )}
            {info.temperatur && (
              <div className="flex justify-between">
                <span className="text-gray-500">Temperatur</span>
                <span>{info.temperatur}</span>
              </div>
            )}
          </div>
        </ReportSection>

        <ReportSection title="Mitarbeiter" isEmpty={report.mitarbeiter.length === 0}>
          <ul className="space-y-1">
            {report.mitarbeiter.map((m, i) => (
              <li key={i} className="text-sm flex items-center gap-2">
                <span className="w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-xs font-medium">
                  {m.charAt(0).toUpperCase()}
                </span>
                {m}
              </li>
            ))}
          </ul>
        </ReportSection>

        <ReportSection
          title="Arbeitszeiten"
          isEmpty={!report.arbeitszeiten?.von && !report.arbeitszeiten?.bis}
        >
          {report.arbeitszeiten && (
            <div className="space-y-2 text-sm">
              {report.arbeitszeiten.von && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Von</span>
                  <span>{report.arbeitszeiten.von}</span>
                </div>
              )}
              {report.arbeitszeiten.bis && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Bis</span>
                  <span>{report.arbeitszeiten.bis}</span>
                </div>
              )}
              {report.arbeitszeiten.pause && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Pause</span>
                  <span>{report.arbeitszeiten.pause}</span>
                </div>
              )}
              {report.arbeitszeiten.gesamt && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Gesamt</span>
                  <span className="font-medium">{report.arbeitszeiten.gesamt}</span>
                </div>
              )}
            </div>
          )}
        </ReportSection>

        <ReportSection title="Leistungen" isEmpty={report.leistungen.length === 0}>
          <ul className="space-y-3">
            {report.leistungen.map((l, i) => (
              <li key={i} className="text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                <p className="font-medium">{l.beschreibung}</p>
                {(l.menge || l.dauer) && (
                  <p className="text-gray-500 mt-0.5">
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
                <span>{m.bezeichnung}</span>
                {m.menge && (
                  <span className="text-gray-500">{m.menge} {m.einheit || ''}</span>
                )}
              </li>
            ))}
          </ul>
        </ReportSection>

        <ReportSection title="Geräte" isEmpty={report.geraete.length === 0}>
          <ul className="space-y-2">
            {report.geraete.map((g, i) => (
              <li key={i} className="text-sm flex justify-between">
                <span>{g.bezeichnung}</span>
                {g.einsatzdauer && <span className="text-gray-500">{g.einsatzdauer}</span>}
              </li>
            ))}
          </ul>
        </ReportSection>

        <ReportSection
          title="Besondere Vorkommnisse"
          isEmpty={!report.besondere_vorkommnisse}
        >
          <p className="text-sm">{report.besondere_vorkommnisse}</p>
        </ReportSection>

        <ReportSection title="Bilder" isEmpty={report.bilder.length === 0 && state.photos.length === 0}>
          <div className="grid grid-cols-3 gap-2">
            {state.photos.map((photo, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={i}
                src={photo}
                alt={`Foto ${i + 1}`}
                className="w-full h-24 object-cover rounded-lg"
              />
            ))}
          </div>
        </ReportSection>

        {report.notizen && (
          <ReportSection title="Notizen">
            <p className="text-sm">{report.notizen}</p>
          </ReportSection>
        )}
      </div>
    </div>
  );
}
