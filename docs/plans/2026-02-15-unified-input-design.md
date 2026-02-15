# Design: Unified Input — Ein Eingabefeld für alles

**Datum:** 2026-02-15
**Status:** Approved

## Problem

Zwei Eingabefelder in der Report-Phase:
1. AIChat-Textfeld (nur Text, "Antwort eingeben...")
2. UnifiedInput (Text + Voice, "Noch etwas ergänzen...")

Wenn ein User eine Frage über UnifiedInput beantwortet, erkennt die KI nicht, dass eine Frage beantwortet wurde — die Frage bleibt stehen. Verwirrende UX mit zwei Eingabemöglichkeiten.

## Lösung

### 1. MERGE_PROMPT Erweiterung

`mergeFollowUp()` bekommt offene Fragen als Parameter. Der Prompt wird erweitert:

```
Aktuell offene Nachfragen an den Handwerker:
${JSON.stringify(openQuestions)}

Prüfe ob die neue Eingabe eine oder mehrere dieser Fragen beantwortet.
- Wenn ja: Informationen einbauen, beantwortete Frage NICHT erneut stellen.
- Wenn nein: Als neue Information behandeln und mergen.
- Gemischte Eingaben sind möglich (teils Antwort, teils neue Info).
```

### 2. AIChat Umbau

- **Entfernt:** Textfeld, Senden-Button, `handleTextSubmit`, `textInput` State
- **Behalten:** Fragen-Bubbles mit KI-Icon + Quick-Reply-Buttons
- Reines Display-Component für offene Fragen

### 3. Layout Report-Phase

```
ReportView
AIChat (nur Fragen + Quick-Replies)
UnifiedInput (Text + Voice — einziges Eingabefeld)
ProblemAction
Confirm-Section
```

### 4. Kontextsensitiver Placeholder

- Fragen offen → "Antwort oder neue Info eingeben..."
- Keine Fragen → "Noch etwas ergänzen..."

### 5. Datenfluss

```
Quick-Reply klick → "Antwort auf Frage: '...' → reply" → handleMergeInput
UnifiedInput submit → raw text → handleMergeInput
handleMergeInput → mergeFollowUp(report, input, questions) → KI entscheidet
```

## Entscheidungen

- Quick-Reply-Buttons bleiben erhalten (schnelle Antworten)
- Prompt-only Ansatz (KI erkennt Kontext selbst, kein UI-Picking)
- UnifiedInput positioniert direkt unter den Fragen
