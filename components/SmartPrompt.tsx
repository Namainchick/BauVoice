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
  { label: 'Arbeitszeiten', beispiel: 'z.B. "Von 7 bis 16 Uhr, eine halbe Stunde Pause"' },
  { label: 'Probleme', beispiel: 'z.B. "An der Südwand ist ein Riss aufgefallen"' },
  { label: 'Fotos', beispiel: 'z.B. "Ich hab Fotos vom Fortschritt gemacht"' },
];

export default function SmartPrompt() {
  const [activeTag, setActiveTag] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <p className="text-gray-600 text-lg leading-relaxed">
        Erzähl einfach von deinem Tag – was habt ihr gemacht, wer war dabei, welches Material wurde verbraucht?
      </p>

      <div className="flex flex-wrap gap-2">
        {KEYWORDS.map((kw) => (
          <button
            key={kw.label}
            onClick={() => setActiveTag(activeTag === kw.label ? null : kw.label)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              activeTag === kw.label
                ? 'bg-green-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {kw.label}
          </button>
        ))}
      </div>

      {activeTag && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800 animate-fade-in">
          {KEYWORDS.find((kw) => kw.label === activeTag)?.beispiel}
        </div>
      )}
    </div>
  );
}
