# Demo Robustness Fixes — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Fix 6 issues that can crash, lose data, or make the BauVoice demo look broken.

**Architecture:** All changes are in 4 files. JSON sanitization in the service layer prevents crashes. AIChat is refactored to accept props instead of managing its own merge logic — NeuPage becomes the single merge orchestrator. Type-specific ReportView sections are added conditionally based on `berichtstyp`. Undo uses a ref to store the previous state before each merge.

**Tech Stack:** Next.js 16, React 19, TypeScript, Google Gemini API, Tailwind CSS

**Design Doc:** `docs/plans/2026-02-15-demo-robustness-design.md`

---

### Task 1: JSON sanitization after Gemini parse

**Files:**
- Modify: `lib/services/gemini.ts`

**Step 1: Add sanitizeResult function and apply it**

Add `sanitizeResult()` after both `JSON.parse()` calls. This prevents crashes when Gemini returns `null` instead of `[]`.

Replace the full file content of `lib/services/gemini.ts` with:

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPT, MERGE_PROMPT } from '@/lib/prompts/systemPrompt';
import { GeminiAnalysisResult, Report } from '@/lib/types/report';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

function getModel() {
  return genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });
}

function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  return cleaned.trim();
}

function sanitizeResult(raw: any): GeminiAnalysisResult {
  const report = raw.report ?? {};

  report.berichtstyp = report.berichtstyp ?? 'bautagesbericht';
  report.allgemeine_informationen = report.allgemeine_informationen ?? {};
  report.allgemeine_informationen.projekt = report.allgemeine_informationen.projekt ?? '';
  report.allgemeine_informationen.datum = report.allgemeine_informationen.datum ?? new Date().toISOString().split('T')[0];
  report.allgemeine_informationen.erstellt_von = report.allgemeine_informationen.erstellt_von ?? 'Nicht angegeben';
  report.mitarbeiter = Array.isArray(report.mitarbeiter) ? report.mitarbeiter : [];
  report.leistungen = Array.isArray(report.leistungen) ? report.leistungen : [];
  report.materialien = Array.isArray(report.materialien) ? report.materialien : [];
  report.geraete = Array.isArray(report.geraete) ? report.geraete : [];
  report.bilder = Array.isArray(report.bilder) ? report.bilder : [];
  report.besondere_vorkommnisse = report.besondere_vorkommnisse ?? '';
  report.status = report.status ?? 'entwurf';
  report.vollstaendigkeit = typeof report.vollstaendigkeit === 'number' ? report.vollstaendigkeit : 0;

  return {
    report: report as Report,
    questions: Array.isArray(raw.questions) ? raw.questions : [],
    problems: Array.isArray(raw.problems) ? raw.problems : [],
  };
}

export async function analyzeTranscript(transcript: string): Promise<GeminiAnalysisResult> {
  const model = getModel();
  const today = new Date().toISOString().split('T')[0];

  const prompt = `${SYSTEM_PROMPT}

Das heutige Datum ist: ${today}

Transkript des Handwerkers:
"${transcript}"

Analysiere das Transkript und erstelle den strukturierten Bericht als JSON.`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  const cleaned = cleanJsonResponse(responseText);
  const parsed = JSON.parse(cleaned);
  return sanitizeResult(parsed);
}

export async function mergeFollowUp(
  currentReport: Report,
  newInput: string
): Promise<GeminiAnalysisResult> {
  const model = getModel();

  const prompt = `${SYSTEM_PROMPT}

${MERGE_PROMPT}

Bestehender Bericht:
${JSON.stringify(currentReport, null, 2)}

Neue Eingabe des Handwerkers:
"${newInput}"

Merge die neue Information und antworte als JSON.`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  const cleaned = cleanJsonResponse(responseText);
  const parsed = JSON.parse(cleaned);
  return sanitizeResult(parsed);
}
```

**Step 2: Verify**

Run: `npx next build` — should compile without errors.
Then: `npm run dev` — navigate to app, click "Demo Bericht erstellen", confirm report loads without crash.

**Step 3: Commit**

```bash
git add lib/services/gemini.ts
git commit -m "fix: sanitize Gemini JSON response to prevent null crashes"
```

---

### Task 2: Default-open report sections

**Files:**
- Modify: `components/ReportView.tsx:59,92,109` (three ReportSection lines)

**Step 1: Add defaultOpen to key sections**

In `components/ReportView.tsx`, add `defaultOpen` to three sections:

Line 59 — Mitarbeiter:
```
OLD: <ReportSection title="Mitarbeiter" isEmpty={report.mitarbeiter.length === 0}>
NEW: <ReportSection title="Mitarbeiter" isEmpty={report.mitarbeiter.length === 0} defaultOpen>
```

Line 92 — Leistungen:
```
OLD: <ReportSection title="Leistungen" isEmpty={report.leistungen.length === 0}>
NEW: <ReportSection title="Leistungen" isEmpty={report.leistungen.length === 0} defaultOpen>
```

Line 109 — Materialien:
```
OLD: <ReportSection title="Materialien" isEmpty={report.materialien.length === 0}>
NEW: <ReportSection title="Materialien" isEmpty={report.materialien.length === 0} defaultOpen>
```

**Step 2: Verify**

Run: `npm run dev` — navigate to a saved Bautagesbericht. Mitarbeiter, Leistungen, Materialien should now be expanded by default.

**Step 3: Commit**

```bash
git add components/ReportView.tsx
git commit -m "fix: default-open key report sections for better demo visibility"
```

---

### Task 3: Centralize merge logic + merge lock + question context

This task refactors AIChat to be a controlled component and centralizes all merge logic in NeuPage. It also adds question context to answers.

**Files:**
- Modify: `components/AIChat.tsx` (full rewrite)
- Modify: `app/neu/page.tsx` (merge orchestration)

**Step 1: Rewrite AIChat as controlled component**

Replace the full content of `components/AIChat.tsx` with:

```typescript
'use client';

import { useState } from 'react';
import { useReport } from '@/lib/context/ReportContext';
import { FollowUpQuestion } from '@/lib/types/report';

interface AIChatProps {
  onAnswer: (answer: string) => void;
  isMergeLocked: boolean;
}

export default function AIChat({ onAnswer, isMergeLocked }: AIChatProps) {
  const { state } = useReport();
  const [textInput, setTextInput] = useState('');

  const handleAnswer = (question: FollowUpQuestion, answer: string) => {
    if (!answer.trim() || isMergeLocked) return;
    const contextualAnswer = `Antwort auf Frage: "${question.frage}" → ${answer}`;
    onAnswer(contextualAnswer);
    setTextInput('');
  };

  const handleFreeText = () => {
    if (!textInput.trim() || isMergeLocked) return;
    // Free text without specific question context — send to first question if exists
    if (state.questions.length > 0) {
      const contextualAnswer = `Antwort auf Frage: "${state.questions[0].frage}" → ${textInput}`;
      onAnswer(contextualAnswer);
    } else {
      onAnswer(textInput);
    }
    setTextInput('');
  };

  if (state.questions.length === 0 && !isMergeLocked) return null;

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-xs font-medium uppercase tracking-wide" style={{ color: 'var(--text-tertiary)' }}>
        KI-Nachfragen
      </h3>

      {state.questions.map((q: FollowUpQuestion) => (
        <div key={q.id} className="rounded-xl p-4 space-y-3 border"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', boxShadow: 'var(--shadow-card)' }}>
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: 'var(--accent)' }}>
              <span className="text-xs font-bold" style={{ color: '#1A1A1A' }}>KI</span>
            </div>
            <p className="text-sm pt-1" style={{ color: 'var(--text-primary)' }}>{q.frage}</p>
          </div>
          {q.quick_replies && q.quick_replies.length > 0 && (
            <div className="flex flex-wrap gap-2 pl-11">
              {q.quick_replies.map((reply, i) => (
                <button key={i} onClick={() => handleAnswer(q, reply)} disabled={isMergeLocked}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors disabled:opacity-50"
                  style={{ borderColor: 'var(--accent)', color: '#059669' }}>
                  {reply}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      <div className="flex gap-2">
        <input type="text" value={textInput} onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleFreeText()}
          placeholder="Antwort eingeben..."
          className="flex-1 px-4 py-3 rounded-xl text-sm border focus:outline-none"
          style={{ backgroundColor: 'var(--bg-surface)', borderColor: 'var(--border-subtle)', color: 'var(--text-primary)' }}
          disabled={isMergeLocked} />
        <button onClick={handleFreeText} disabled={isMergeLocked || !textInput.trim()}
          className="px-4 py-3 rounded-xl text-sm font-medium disabled:opacity-50 transition-all active:scale-95"
          style={{ backgroundColor: 'var(--accent)', color: '#1A1A1A' }}>
          {isMergeLocked ? '...' : 'Senden'}
        </button>
      </div>

      {isMergeLocked && (
        <p className="text-xs text-center animate-pulse" style={{ color: 'var(--text-tertiary)' }}>
          Bericht wird aktualisiert...
        </p>
      )}
    </div>
  );
}
```

**Step 2: Update NeuPage to orchestrate merges centrally**

In `app/neu/page.tsx`, make these changes:

2a. Add a centralized `handleMergeAnswer` function that AIChat calls via prop. Find the existing `handleFollowUp` callback (around line 134) and replace it:

```
OLD:
  // Follow-up
  const handleFollowUp = useCallback(async (input: string) => {
    if (!state.report || !input.trim()) return;
    setFollowUpLoading(true);
    try {
      const result = await mergeFollowUp(state.report, input);
      dispatch({ type: 'MERGE_FOLLOW_UP_RESULT', payload: { result } });
    } catch (err) {
      console.error('Follow-up merge failed:', err);
    } finally {
      setFollowUpLoading(false);
    }
  }, [state.report, dispatch]);

NEW:
  // Centralized merge handler — used by both AIChat and UnifiedInput
  const handleMergeInput = useCallback(async (input: string) => {
    if (!state.report || !input.trim() || followUpLoading) return;
    setFollowUpLoading(true);
    try {
      const result = await mergeFollowUp(state.report, input);
      dispatch({ type: 'MERGE_FOLLOW_UP_RESULT', payload: { result } });
    } catch (err) {
      console.error('Follow-up merge failed:', err);
    } finally {
      setFollowUpLoading(false);
    }
  }, [state.report, followUpLoading, dispatch]);
```

2b. Update the AIChat usage in the report phase JSX (around line 367):

```
OLD: <AIChat />
NEW: <AIChat onAnswer={handleMergeInput} isMergeLocked={followUpLoading} />
```

2c. Update the UnifiedInput onSubmit in the report phase (around line 372-376):

```
OLD:
        <div className="mt-6">
          <UnifiedInput
            onSubmit={handleFollowUp}
            placeholder="Noch etwas ergänzen..."
            isLoading={followUpLoading}
          />
        </div>

NEW:
        <div className="mt-6">
          <UnifiedInput
            onSubmit={handleMergeInput}
            placeholder="Noch etwas ergänzen..."
            isLoading={followUpLoading}
          />
        </div>
```

**Step 3: Verify**

Run: `npm run dev`
1. Click "Demo Bericht erstellen" — wait for report
2. If questions appear, click a quick-reply — verify both inputs are disabled during loading
3. Try typing in UnifiedInput while AIChat processes — should be disabled
4. Check browser console: the merge call should include `Antwort auf Frage: "..." → ...`

**Step 4: Commit**

```bash
git add components/AIChat.tsx app/neu/page.tsx
git commit -m "feat: centralize merge logic with lock + add question context to answers"
```

---

### Task 4: Type-specific ReportView sections

**Files:**
- Modify: `components/ReportView.tsx` (add sections after the base sections)

**Step 1: Add type-specific sections**

In `components/ReportView.tsx`, add the following block just before the closing `</div>` of the grid/space container (after the Notizen section, around line 147, before `</div>`):

```typescript
        {/* ─── Type-specific sections ─── */}

        {report.berichtstyp === 'regiebericht' && (() => {
          const r = report as import('@/lib/types/report').Regiebericht;
          return (<>
            <ReportSection title="Auftraggeber" isEmpty={!r.auftraggeber} defaultOpen>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{r.auftraggeber}</p>
            </ReportSection>

            <ReportSection title="Stunden-Details" isEmpty={!r.stunden_details?.length} defaultOpen>
              <div className="space-y-2">
                {r.stunden_details?.map((s, i) => (
                  <div key={i} className="text-sm flex justify-between items-start pb-2 last:pb-0"
                    style={{ borderBottom: i < (r.stunden_details?.length ?? 0) - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <div>
                      <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{s.mitarbeiter}</p>
                      <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{s.taetigkeit}</p>
                    </div>
                    <span className="text-sm font-medium flex-shrink-0 ml-3" style={{ color: '#059669' }}>{s.stunden}h</span>
                  </div>
                ))}
              </div>
            </ReportSection>

            {r.zuschlaege && (
              <ReportSection title="Zuschläge" defaultOpen>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{r.zuschlaege}</p>
              </ReportSection>
            )}
          </>);
        })()}

        {report.berichtstyp === 'abnahmeprotokoll' && (() => {
          const r = report as import('@/lib/types/report').Abnahmeprotokoll;
          const ergebnisLabels: Record<string, { label: string; color: string; bg: string }> = {
            abgenommen: { label: 'Abgenommen', color: '#059669', bg: 'rgba(5,150,105,0.1)' },
            abgenommen_mit_maengeln: { label: 'Abgenommen mit Mängeln', color: '#D97706', bg: 'rgba(217,119,6,0.1)' },
            nicht_abgenommen: { label: 'Nicht abgenommen', color: '#DC2626', bg: 'rgba(220,38,38,0.1)' },
          };
          const ergebnis = ergebnisLabels[r.ergebnis] || null;
          return (<>
            {ergebnis && (
              <ReportSection title="Ergebnis" defaultOpen>
                <span className="inline-block text-sm font-semibold px-3 py-1.5 rounded-full"
                  style={{ backgroundColor: ergebnis.bg, color: ergebnis.color }}>
                  {ergebnis.label}
                </span>
              </ReportSection>
            )}

            <ReportSection title="Mängel" isEmpty={!r.maengel?.length} defaultOpen>
              <ul className="space-y-3">
                {r.maengel?.map((m, i) => {
                  const severityColors: Record<string, { color: string; bg: string }> = {
                    leicht: { color: '#D97706', bg: 'rgba(217,119,6,0.1)' },
                    mittel: { color: '#EA580C', bg: 'rgba(234,88,12,0.1)' },
                    schwer: { color: '#DC2626', bg: 'rgba(220,38,38,0.1)' },
                  };
                  const sev = severityColors[m.schweregrad] || severityColors.mittel;
                  return (
                    <li key={i} className="text-sm pb-2 last:pb-0" style={{ borderBottom: i < (r.maengel?.length ?? 0) - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{m.beschreibung}</p>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: sev.bg, color: sev.color }}>
                          {m.schweregrad}
                        </span>
                      </div>
                      {m.frist && <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>Frist: {m.frist}</p>}
                    </li>
                  );
                })}
              </ul>
            </ReportSection>

            {r.vorbehalte && (
              <ReportSection title="Vorbehalte" defaultOpen>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{r.vorbehalte}</p>
              </ReportSection>
            )}
          </>);
        })()}

        {report.berichtstyp === 'baustellenbegehung' && (() => {
          const r = report as import('@/lib/types/report').Baustellenbegehung;
          return (<>
            <ReportSection title="Sicherheit" isEmpty={!r.sicherheit} defaultOpen>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{r.sicherheit}</p>
            </ReportSection>

            <ReportSection title="Fortschritt" isEmpty={!r.fortschritt} defaultOpen>
              <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{r.fortschritt}</p>
            </ReportSection>

            <ReportSection title="Festgestellte Mängel" isEmpty={!r.festgestellte_maengel?.length} defaultOpen>
              <ul className="space-y-1">
                {r.festgestellte_maengel?.map((m, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <span style={{ color: 'var(--danger)' }}>•</span>
                    <span style={{ color: 'var(--text-primary)' }}>{m}</span>
                  </li>
                ))}
              </ul>
            </ReportSection>
          </>);
        })()}

        {report.berichtstyp === 'besprechungsprotokoll' && (() => {
          const r = report as import('@/lib/types/report').Besprechungsprotokoll;
          return (<>
            <ReportSection title="Teilnehmer" isEmpty={!r.teilnehmer?.length} defaultOpen>
              <ul className="space-y-1">
                {r.teilnehmer?.map((t, i) => (
                  <li key={i} className="text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium"
                      style={{ backgroundColor: 'var(--accent-dim)', color: '#059669' }}>
                      {t.name.charAt(0).toUpperCase()}
                    </span>
                    <span style={{ color: 'var(--text-primary)' }}>{t.name}</span>
                    {t.rolle && <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>({t.rolle})</span>}
                  </li>
                ))}
              </ul>
            </ReportSection>

            <ReportSection title="Tagesordnung" isEmpty={!r.tagesordnung?.length} defaultOpen>
              <ol className="space-y-1 list-decimal list-inside">
                {r.tagesordnung?.map((t, i) => (
                  <li key={i} className="text-sm" style={{ color: 'var(--text-primary)' }}>{t}</li>
                ))}
              </ol>
            </ReportSection>

            <ReportSection title="Beschlüsse" isEmpty={!r.beschluesse?.length} defaultOpen>
              <ul className="space-y-1">
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
                <ul className="space-y-1">
                  {r.naechste_schritte.map((s, i) => (
                    <li key={i} className="text-sm flex items-start gap-2">
                      <span style={{ color: 'var(--text-secondary)' }}>→</span>
                      <span style={{ color: 'var(--text-primary)' }}>{s}</span>
                    </li>
                  ))}
                </ul>
              </ReportSection>
            )}
          </>);
        })()}

        {report.berichtstyp === 'checkliste' && (() => {
          const r = report as import('@/lib/types/report').Checkliste;
          const statusStyles: Record<string, { label: string; color: string; bg: string }> = {
            ok: { label: 'OK', color: '#059669', bg: 'rgba(5,150,105,0.1)' },
            mangel: { label: 'Mangel', color: '#DC2626', bg: 'rgba(220,38,38,0.1)' },
            nicht_geprueft: { label: 'Nicht geprüft', color: '#6B7280', bg: 'rgba(107,114,128,0.1)' },
          };
          return (<>
            {r.kategorie && (
              <ReportSection title="Kategorie" defaultOpen>
                <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{r.kategorie}</p>
              </ReportSection>
            )}

            <ReportSection title="Prüfpunkte" isEmpty={!r.pruefpunkte?.length} defaultOpen>
              <ul className="space-y-3">
                {r.pruefpunkte?.map((p, i) => {
                  const st = statusStyles[p.status] || statusStyles.nicht_geprueft;
                  return (
                    <li key={i} className="text-sm pb-2 last:pb-0" style={{ borderBottom: i < (r.pruefpunkte?.length ?? 0) - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                      <div className="flex items-start justify-between gap-2">
                        <p style={{ color: 'var(--text-primary)' }}>{p.punkt}</p>
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                      </div>
                      {p.kommentar && <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{p.kommentar}</p>}
                    </li>
                  );
                })}
              </ul>
            </ReportSection>
          </>);
        })()}
```

**Step 2: Verify**

Run: `npm run dev`
1. Go to dashboard → click on "Umbau Gewerbe — Becker GmbH" (Regiebericht) → should now show "Auftraggeber" and "Stunden-Details" sections
2. Click on "Badsanierung — Familie Meier" (Abnahmeprotokoll) → should now show "Ergebnis" badge, "Mängel" with severity, and "Vorbehalte"
3. Run `npx next build` to verify no TypeScript errors

**Step 3: Commit**

```bash
git add components/ReportView.tsx
git commit -m "feat: add type-specific sections for Regiebericht, Abnahmeprotokoll, Begehung, Protokoll, Checkliste"
```

---

### Task 5: Undo after merge

**Files:**
- Modify: `app/neu/page.tsx`

**Step 1: Add undo ref and toast state**

In `app/neu/page.tsx`, add these state/ref declarations after the existing state declarations (around line 33):

```typescript
  const previousStateRef = useRef<{ report: Report; questions: FollowUpQuestion[]; problems: DetectedProblem[] } | null>(null);
  const [showUndo, setShowUndo] = useState(false);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);
```

Add the needed imports at the top (add `Report, FollowUpQuestion, DetectedProblem` to the report.ts import):

```
OLD: import { REPORT_TYPE_LABELS } from '@/lib/types/report';
NEW: import { REPORT_TYPE_LABELS, Report, FollowUpQuestion, DetectedProblem } from '@/lib/types/report';
```

**Step 2: Save previous state before merge and show toast**

Update the centralized `handleMergeInput` (from Task 3) to save state before merging and show undo toast:

```typescript
  const handleMergeInput = useCallback(async (input: string) => {
    if (!state.report || !input.trim() || followUpLoading) return;

    // Save current state for undo
    previousStateRef.current = {
      report: state.report,
      questions: state.questions,
      problems: state.problems,
    };

    setFollowUpLoading(true);
    try {
      const result = await mergeFollowUp(state.report, input);
      dispatch({ type: 'MERGE_FOLLOW_UP_RESULT', payload: { result } });

      // Show undo toast
      setShowUndo(true);
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
      undoTimerRef.current = setTimeout(() => setShowUndo(false), 5000);
    } catch (err) {
      console.error('Follow-up merge failed:', err);
      previousStateRef.current = null;
    } finally {
      setFollowUpLoading(false);
    }
  }, [state.report, state.questions, state.problems, followUpLoading, dispatch]);
```

**Step 3: Add undo handler**

Add this callback after `handleMergeInput`:

```typescript
  const handleUndo = useCallback(() => {
    if (!previousStateRef.current) return;
    dispatch({ type: 'SET_ANALYSIS_RESULT', payload: previousStateRef.current });
    previousStateRef.current = null;
    setShowUndo(false);
    if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
  }, [dispatch]);
```

**Step 4: Add undo toast UI**

In the report phase JSX, add the undo toast just before the closing `</div>` of the report phase (after the confirm button section, before the final `</div>`):

```typescript
        {showUndo && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-5 py-3 rounded-full shadow-lg z-50 animate-slide-up"
            style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-card)' }}>
            <span className="text-sm" style={{ color: 'var(--text-primary)' }}>Bericht aktualisiert</span>
            <button
              onClick={handleUndo}
              className="text-sm font-semibold px-3 py-1 rounded-full transition-all active:scale-95"
              style={{ color: '#059669', backgroundColor: 'var(--accent-dim)' }}>
              Rückgängig
            </button>
          </div>
        )}
```

**Step 5: Clean up timer on unmount**

Update the existing cleanup useEffect (around line 165):

```
OLD:
  useEffect(() => {
    return () => { recognitionRef.current?.stop(); };
  }, []);

NEW:
  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      if (undoTimerRef.current) clearTimeout(undoTimerRef.current);
    };
  }, []);
```

**Step 6: Verify**

Run: `npm run dev`
1. Create or load a report with questions
2. Answer a question (quick-reply or text)
3. After merge completes, an "Rückgängig" toast should appear at the bottom
4. Click "Rückgängig" — report should revert to the state before the merge
5. Toast should auto-hide after 5 seconds if not clicked

**Step 7: Commit**

```bash
git add app/neu/page.tsx
git commit -m "feat: add undo toast after merge to revert accidental changes"
```

---

## Task Order & Dependencies

```
Task 1 (JSON sanitization)     — no dependencies
Task 2 (defaultOpen)           — no dependencies
Task 3 (merge lock + context)  — no dependencies
Task 4 (type-specific views)   — after Task 2 (same file)
Task 5 (undo)                  — after Task 3 (builds on centralized merge)
```

Tasks 1, 2, 3 can be done in parallel. Task 4 after 2. Task 5 after 3.
