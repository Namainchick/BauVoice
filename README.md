# BauVoice

KI-Sprachassistent der Baustellenberichte aus Sprache und Text erstellt. Handwerker sprechen oder tippen einfach drauf los — BauVoice wandelt das in strukturierte Berichte um.

## Features

- **Spracheingabe** — Web Speech API (`de-DE`), Echtzeit-Transkription
- **Texterfassung** — Alternativ per Tastatur
- **KI-Analyse** — Google Gemini 2.0 Flash erkennt automatisch den Berichtstyp und extrahiert strukturierte Daten
- **Nachfragen** — Die KI stellt gezielte Rückfragen mit Quick-Reply-Buttons bei fehlenden oder unklaren Infos
- **Merge** — Neue Infos und Antworten werden intelligent in den bestehenden Bericht gemergt (Korrekturen ersetzen statt duplizieren)
- **Undo** — Merge-Ergebnis kann 5 Sekunden lang rückgängig gemacht werden
- **9 Berichtstypen** — Bautagesbericht, Abnahmeprotokoll, Baustellenbegehung, Regiebericht, Einsatzbericht, Bedenkenanzeige, Berichtsheft, Besprechungsprotokoll, Checkliste
- **Offline-Speicherung** — Berichte werden im localStorage persistiert
- **Demo-Modus** — Vorgefertigter Demo-Bericht zum Ausprobieren

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Sprache:** TypeScript
- **Styling:** Tailwind CSS 4 mit CSS-Custom-Properties (Design Tokens)
- **KI:** Google Gemini 2.0 Flash (`@google/generative-ai`)
- **Sprache:** Web Speech API (Browser-nativ)
- **Speicher:** localStorage

## Voraussetzungen

- Node.js 20+
- Ein [Google AI Studio](https://aistudio.google.com/) API-Key

## Installation

```bash
git clone <repo-url>
cd BauVoice
npm install
```

`.env.local` anlegen:

```
NEXT_PUBLIC_GEMINI_API_KEY=dein_api_key_hier
```

Starten:

```bash
npm run dev
```

Die App läuft auf `http://localhost:3000`.

## Nutzung

1. **Dashboard** (`/`) — Übersicht aller gespeicherten Berichte mit Suche und Statusfilter
2. **Neuer Bericht** (`/neu`) — Mikrofon-Button drücken und sprechen, oder Text eingeben. Alternativ "Demo Bericht erstellen" klicken
3. **KI-Analyse** — Die KI analysiert die Eingabe, erkennt den Berichtstyp und extrahiert strukturierte Daten
4. **Nachfragen beantworten** — Quick-Reply-Buttons klicken oder im Eingabefeld antworten/ergänzen (Text + Sprache)
5. **Bestätigen** — "Bericht bestätigen & speichern" klickt den Bericht fest

## Projektstruktur

```
BauVoice/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root Layout (Providers, Fonts)
│   ├── page.tsx                  # Dashboard
│   ├── neu/page.tsx              # Neuer Bericht (Hauptseite)
│   ├── report/page.tsx           # Bericht ansehen
│   ├── settings/page.tsx         # Einstellungen
│   └── globals.css               # Design Tokens + Tailwind
├── components/
│   ├── AIChat.tsx                # KI-Nachfragen + Quick-Replies
│   ├── ReportView.tsx            # Berichtsanzeige (typ-spezifisch)
│   ├── UnifiedInput.tsx          # Text + Voice Eingabe
│   ├── ReportCard.tsx            # Berichtskarte (Dashboard)
│   ├── ReportSection.tsx         # Aufklappbare Sektion
│   ├── ProcessingState.tsx       # Ladeanimation
│   ├── SmartPrompt.tsx           # Eingabe-Tipps
│   ├── ProblemAction.tsx         # Problemerkennung
│   ├── AppShell.tsx              # Layout-Container
│   ├── Sidebar.tsx               # Desktop-Sidebar
│   └── BottomNav.tsx             # Mobile Navigation
├── lib/
│   ├── services/
│   │   ├── gemini.ts             # Gemini API (Analyse + Merge)
│   │   └── speechRecognition.ts  # Web Speech API Wrapper
│   ├── prompts/
│   │   └── systemPrompt.ts       # System-Prompt + Merge-Prompt
│   ├── types/
│   │   └── report.ts             # TypeScript Interfaces (9 Berichtstypen)
│   ├── context/
│   │   └── ReportContext.tsx      # React Context + useReducer
│   ├── data/
│   │   └── demoReports.ts        # Demo-Berichte
│   └── utils/
│       ├── storage.ts            # localStorage Operationen
│       └── reportHelpers.ts      # Hilfsfunktionen
└── scripts/
    └── test-ai.ts                # KI-Output Tests (npx tsx scripts/test-ai.ts)
```

## KI-Architektur

Der KI-Flow besteht aus zwei Phasen:

**1. Erstanalyse** (`analyzeTranscript`) — Transkript rein, strukturierter Bericht + Nachfragen + erkannte Probleme raus.

**2. Merge** (`mergeFollowUp`) — Bestehender Bericht + neue Eingabe + offene Fragen rein. Die KI entscheidet selbst ob die Eingabe eine Frage beantwortet oder neue Info hinzufügt. Korrekturen ersetzen alte Werte, neue Infos werden ergänzt.

Beide Funktionen liefern dasselbe JSON-Format zurück:

```json
{
  "report": { "berichtstyp": "...", "allgemeine_informationen": {}, "leistungen": [], ... },
  "questions": [{ "id": "q1", "frage": "...", "typ": "fehlend", "quick_replies": ["..."] }],
  "problems": [{ "id": "p1", "typ": "mangel", "beschreibung": "...", "vorgeschlagene_aktionen": [] }]
}
```

## Tests

KI-Output Tests gegen die live Gemini API:

```bash
npx tsx scripts/test-ai.ts
```

Testet 5 Szenarien: Basis-Flow, Merge-Korrektheit, Edge Cases, Fragen-Kontext, Strukturelle Robustheit.

## Scripts

| Command | Beschreibung |
|---|---|
| `npm run dev` | Entwicklungsserver starten |
| `npm run build` | Produktions-Build |
| `npm run start` | Produktionsserver starten |
| `npm run lint` | ESLint ausführen |
| `npx tsx scripts/test-ai.ts` | KI-Output Tests |

## Lizenz

Privates Projekt.
