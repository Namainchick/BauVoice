'use client';

import { useState } from 'react';

interface KeywordTag {
  label: string;
  beispiel: string;
}

const KEYWORDS: KeywordTag[] = [
  { label: 'Projekt', beispiel: 'z.B. "Baustelle Müller, Hauptstraße 12"' },
  { label: 'Arbeitszeiten', beispiel: 'z.B. "Von 7 bis 16 Uhr, halbe Stunde Pause"' },
  { label: 'Team', beispiel: 'z.B. "Ich war mit Kevin und Markus vor Ort"' },
  { label: 'Leistungen', beispiel: 'z.B. "35m² Estrich verlegt, Dachlatten montiert"' },
  { label: 'Material', beispiel: 'z.B. "2 Rollen Dampfsperrfolie, 50 Dachlatten"' },
  { label: 'Geräte', beispiel: 'z.B. "Akkuschrauber und Bohrhammer benutzt"' },
  { label: 'Probleme', beispiel: 'z.B. "Riss an der Südwand, Lieferung kam nicht"' },
];

export default function SmartPrompt() {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        Nenne dein Projekt, Arbeitszeiten, erledigte Arbeiten, verbrauchtes Material und wer dabei war.
      </p>

      <div className="flex flex-wrap gap-2">
        {KEYWORDS.map((kw) => (
          <button
            key={kw.label}
            onClick={() => setActiveTag(activeTag === kw.label ? null : kw.label)}
            className="px-3 py-1.5 rounded-full text-xs font-medium transition-all border"
            style={{
              backgroundColor: activeTag === kw.label ? 'var(--accent)' : 'transparent',
              borderColor: activeTag === kw.label ? 'var(--accent)' : 'var(--border-medium)',
              color: activeTag === kw.label ? '#1A1A1A' : 'var(--text-secondary)',
            }}
          >
            {kw.label}
          </button>
        ))}
      </div>

      {activeTag && (
        <div
          className="rounded-xl p-3 text-xs animate-fade-in"
          style={{ backgroundColor: 'var(--accent-dim)', color: '#059669' }}
        >
          {KEYWORDS.find((kw) => kw.label === activeTag)?.beispiel}
        </div>
      )}
    </div>
  );
}
