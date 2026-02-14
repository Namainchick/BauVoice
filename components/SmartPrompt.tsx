'use client';

import { useState } from 'react';

interface KeywordTag {
  label: string;
  beispiel: string;
}

const KEYWORDS: KeywordTag[] = [
  { label: 'Wetter', beispiel: 'z.B. "Sonnig, 15 Grad, leichter Wind"' },
  { label: 'Team', beispiel: 'z.B. "Ich war mit Kevin und Markus vor Ort"' },
  { label: 'Leistungen', beispiel: 'z.B. "Wir haben 35m² Estrich verlegt"' },
  { label: 'Material', beispiel: 'z.B. "2 Rollen Dampfsperrfolie verbraucht"' },
  { label: 'Geräte', beispiel: 'z.B. "Haben den Bagger 4 Stunden genutzt"' },
  { label: 'Zeiten', beispiel: 'z.B. "Von 7 bis 16 Uhr, halbe Stunde Pause"' },
  { label: 'Probleme', beispiel: 'z.B. "An der Südwand ist ein Riss aufgefallen"' },
];

export default function SmartPrompt() {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
        Erzähl einfach von deinem Tag — was habt ihr gemacht, wer war dabei, welches Material?
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
              color: activeTag === kw.label ? 'var(--bg-primary)' : 'var(--text-secondary)',
            }}
          >
            {kw.label}
          </button>
        ))}
      </div>

      {activeTag && (
        <div
          className="rounded-xl p-3 text-xs animate-fade-in"
          style={{ backgroundColor: 'var(--accent-dim)', color: 'var(--accent)' }}
        >
          {KEYWORDS.find((kw) => kw.label === activeTag)?.beispiel}
        </div>
      )}
    </div>
  );
}
