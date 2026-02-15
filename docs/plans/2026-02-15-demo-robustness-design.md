# Demo Robustness Fixes — Design Document

**Date:** 2026-02-15
**Goal:** Make the BauVoice demo reliable — fix 6 issues that can cause crashes, data loss, or make the demo look broken.

---

## Context

BauVoice is a Next.js app that uses Google Gemini 2.0 Flash to convert voice/text input into structured construction reports. The app has 3 demo reports (Bautagesbericht, Regiebericht, Abnahmeprotokoll) and a "Demo Bericht erstellen" flow.

### Problems identified

1. All report sections except "Allgemeine Informationen" are collapsed — no wow-effect after AI analysis
2. Follow-up question answers lack context — AI doesn't know which question is being answered
3. Gemini can return `null` instead of `[]` for arrays — causes crashes on `.map()`
4. Report type-specific fields (Mängel, Stunden-Details, etc.) are never rendered — 2 of 3 demo reports look empty
5. No undo after merge — if AI misinterprets an answer, data is lost
6. Two input components (AIChat + UnifiedInput) can trigger parallel merges — race condition causes data loss

---

## Fix 1: Sections defaultOpen

**File:** `components/ReportView.tsx`

Set `defaultOpen={true}` on: Mitarbeiter, Leistungen, Materialien. These are the core data sections that demonstrate the AI's extraction capability.

Keep collapsed: Arbeitszeiten, Geräte, Besondere Vorkommnisse, Bilder, Notizen — secondary data.

---

## Fix 2: Question context in merge answers

**File:** `components/AIChat.tsx`

When the user answers a follow-up question (quick-reply or text input), prepend the question text:

```
Antwort auf Frage: "Welches Material wurde für den Durchbruch verbraucht?" → Mörtel + Putz
```

This gives Gemini explicit context about which question is being answered, preventing misattribution of short/ambiguous answers like "5" or "Thomas".

The UnifiedInput ("Noch etwas ergänzen...") continues to send raw text without question context, since it's not answering a specific question.

---

## Fix 3: JSON sanitization after parse

**File:** `lib/services/gemini.ts`

Add a `sanitizeResult()` function called after `JSON.parse()` in both `analyzeTranscript()` and `mergeFollowUp()`. It defaults:

- All arrays (`leistungen`, `materialien`, `geraete`, `mitarbeiter`, `bilder`, `questions`, `problems`) to `[]` if null/undefined
- `besondere_vorkommnisse` to `""` if null/undefined
- `vollstaendigkeit` to `0` if not a number
- `status` to `'entwurf'` if missing
- `allgemeine_informationen` sub-fields to sensible defaults

This prevents crashes from unexpected Gemini output without changing any business logic.

---

## Fix 4: Type-specific ReportView sections

**File:** `components/ReportView.tsx`

Add conditional sections based on `report.berichtstyp`. Five types covered:

### Regiebericht
- **Auftraggeber** — simple key-value display
- **Stunden-Details** — table with columns: Mitarbeiter, Stunden, Tätigkeit
- **Zuschläge** — text if present

### Abnahmeprotokoll
- **Mängel** — list with severity badge (leicht/mittel/schwer) and deadline
- **Ergebnis** — badge (abgenommen / abgenommen mit Mängeln / nicht abgenommen)
- **Vorbehalte** — text if present

### Baustellenbegehung
- **Sicherheit** — text
- **Fortschritt** — text
- **Festgestellte Mängel** — bullet list

### Besprechungsprotokoll
- **Teilnehmer** — list with name + role
- **Tagesordnung** — numbered list
- **Beschlüsse** — bullet list
- **Nächste Schritte** — bullet list if present

### Checkliste
- **Kategorie** — text
- **Prüfpunkte** — list with status badge (ok=green, mangel=red, nicht_geprueft=gray) + comment

Type narrowing via `report.berichtstyp === 'regiebericht'` makes the type-specific fields safely accessible.

Sections use the existing `ReportSection` component with `defaultOpen={true}` for primary type-specific sections.

---

## Fix 5: Undo after merge (1 step back)

**File:** `app/neu/page.tsx`

A `useRef<{ report, questions, problems } | null>` stores the previous state before each merge call. After a successful merge, a toast appears at the bottom with an "Rückgängig" button (visible for 5 seconds).

Clicking "Rückgängig" dispatches `SET_ANALYSIS_RESULT` with the saved previous state. The ref is cleared after undo to prevent double-undo.

On a new merge, the ref is overwritten with the current state (only 1 step back).

No localStorage needed — the ref lives only for the current session.

---

## Fix 6: Merge lock (single global lock)

**File:** `app/neu/page.tsx` + `components/AIChat.tsx`

The existing `followUpLoading` state in NeuPage becomes the central merge lock. It is passed to AIChat as a prop (`isMergeLocked`).

### Flow:
1. User triggers merge (via AIChat quick-reply, AIChat text, or UnifiedInput)
2. `followUpLoading = true` immediately
3. Both AIChat buttons/input AND UnifiedInput are disabled
4. Merge response returns → `followUpLoading = false`
5. Both inputs re-enabled

### AIChat changes:
- Remove local `isLoading` state
- Accept `isMergeLocked` and `onAnswer` props instead of calling `mergeFollowUp` directly
- NeuPage handles all merge calls centrally

This ensures only one merge can run at a time, preventing race conditions.

---

## Files affected

| File | Changes |
|------|---------|
| `components/ReportView.tsx` | defaultOpen on 3 sections + type-specific sections for 5 report types |
| `components/AIChat.tsx` | Question context in answers + accept props instead of local merge logic |
| `lib/services/gemini.ts` | sanitizeResult() after JSON.parse |
| `app/neu/page.tsx` | Central merge lock + undo ref + undo toast UI |
