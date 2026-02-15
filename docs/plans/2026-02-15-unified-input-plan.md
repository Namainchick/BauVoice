# Unified Input Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Merge two separate input fields into one unified text+voice input that handles both new info and question answers, with AI context injection so the LLM can distinguish between the two.

**Architecture:** Extend `mergeFollowUp()` to accept open questions and inject them into the prompt. Strip AIChat's text input, keeping only question display + quick-replies. Reorder layout so UnifiedInput sits directly below questions.

**Tech Stack:** Next.js 16, React 19, TypeScript, Google Gemini 2.0 Flash

---

### Task 1: Extend mergeFollowUp with question context

**Files:**
- Modify: `lib/services/gemini.ts:91-114` (mergeFollowUp function)
- Modify: `lib/prompts/systemPrompt.ts:101-117` (MERGE_PROMPT)

**Step 1: Update MERGE_PROMPT to include question-context placeholder**

In `lib/prompts/systemPrompt.ts`, append to MERGE_PROMPT after the existing "WICHTIG zu Nachfragen" section:

```typescript
// Add after line 116 (before the final backtick):
KONTEXT — Offene Nachfragen:
Die folgenden Nachfragen sind aktuell offen und wurden dem Handwerker angezeigt.
Prüfe ob die neue Eingabe eine oder mehrere dieser Fragen beantwortet:
- Wenn ja: Information in den Bericht einbauen, beantwortete Frage NICHT erneut stellen
- Wenn nein: Eingabe als neue Information behandeln und mergen
- Gemischte Eingaben sind möglich (teils Antwort, teils neue Info)
- Bei kurzen Antworten (z.B. "5", "Thomas") prüfe ob sie zu einer offenen Frage passen
```

Note: This is static text. The actual questions JSON will be injected in `mergeFollowUp()`.

**Step 2: Update mergeFollowUp signature and prompt assembly**

In `lib/services/gemini.ts`, change `mergeFollowUp` to accept an optional `openQuestions` parameter:

```typescript
import { GeminiAnalysisResult, Report, FollowUpQuestion } from '@/lib/types/report';

export async function mergeFollowUp(
  currentReport: Report,
  newInput: string,
  openQuestions?: FollowUpQuestion[]
): Promise<GeminiAnalysisResult> {
  const model = getModel();

  const questionsContext = openQuestions && openQuestions.length > 0
    ? `\n\nAktuell offene Nachfragen:\n${JSON.stringify(openQuestions.map(q => ({ id: q.id, frage: q.frage, typ: q.typ })), null, 2)}`
    : '\n\nAktuell offene Nachfragen: Keine';

  const prompt = `${SYSTEM_PROMPT}

${MERGE_PROMPT}
${questionsContext}

Bestehender Bericht:
${JSON.stringify(currentReport, null, 2)}

Neue Eingabe des Handwerkers:
"${newInput}"

Merge die neue Information und antworte als JSON.`;
  // ... rest unchanged
}
```

**Step 3: Commit**

```bash
git add lib/services/gemini.ts lib/prompts/systemPrompt.ts
git commit -m "feat: inject open questions into merge prompt for context"
```

---

### Task 2: Strip AIChat text input

**Files:**
- Modify: `components/AIChat.tsx` (remove text input, keep question display + quick-replies)

**Step 1: Remove text input state and handlers**

Remove `textInput` state, `handleTextSubmit`, the text input JSX, and the send button. Keep `handleQuickReply`, question bubbles, quick-reply buttons, and the merge-locked indicator.

The component becomes:

```typescript
'use client';

import { useReport } from '@/lib/context/ReportContext';
import { FollowUpQuestion } from '@/lib/types/report';

interface AIChatProps {
  onAnswer: (answer: string) => void;
  isMergeLocked: boolean;
}

export default function AIChat({ onAnswer, isMergeLocked }: AIChatProps) {
  const { state } = useReport();

  const handleQuickReply = (question: FollowUpQuestion, reply: string) => {
    if (isMergeLocked) return;
    const contextualAnswer = `Antwort auf Frage: "${question.frage}" → ${reply}`;
    onAnswer(contextualAnswer);
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
                <button key={i} onClick={() => handleQuickReply(q, reply)} disabled={isMergeLocked}
                  className="px-3 py-1.5 rounded-full text-xs font-medium border transition-colors disabled:opacity-50"
                  style={{ borderColor: 'var(--accent)', color: '#059669' }}>
                  {reply}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}

      {isMergeLocked && (
        <p className="text-xs text-center animate-pulse" style={{ color: 'var(--text-tertiary)' }}>
          Bericht wird aktualisiert...
        </p>
      )}
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add components/AIChat.tsx
git commit -m "refactor: strip AIChat text input, keep question display + quick-replies"
```

---

### Task 3: Rewire page layout and merge handler

**Files:**
- Modify: `app/neu/page.tsx:137-162` (handleMergeInput) and `app/neu/page.tsx:383-448` (report phase JSX)

**Step 1: Pass openQuestions to mergeFollowUp**

In `handleMergeInput`, pass `state.questions` as the third argument:

```typescript
const result = await mergeFollowUp(state.report, input, state.questions);
```

**Step 2: Rearrange report phase layout + dynamic placeholder**

Change the report phase JSX order to:

```
ReportView
AIChat (questions + quick-replies only)
UnifiedInput (directly after questions, dynamic placeholder)
ProblemAction
Confirm section
```

For UnifiedInput, compute the placeholder based on whether questions are open:

```typescript
const inputPlaceholder = state.questions.length > 0
  ? 'Antwort oder neue Info eingeben...'
  : 'Noch etwas ergänzen...';
```

Pass it: `<UnifiedInput placeholder={inputPlaceholder} ... />`

**Step 3: Commit**

```bash
git add app/neu/page.tsx
git commit -m "feat: unified input with dynamic placeholder + question context in merge"
```

---

### Task 4: Verify build

**Step 1: Run build**

```bash
npm run build
```

Expected: Clean build, no TypeScript errors.

**Step 2: Commit if any fixes needed**
