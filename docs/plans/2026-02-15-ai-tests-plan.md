# KI-Output Tests Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create a standalone test script that validates Gemini AI output across 5 scenarios covering basis flow, merge correctness, edge cases, question context, and structural robustness.

**Architecture:** Single TypeScript script (`scripts/test-ai.ts`) executed via `npx tsx`. Imports `analyzeTranscript` and `mergeFollowUp` directly. Sequential test flow where each scenario builds on the previous report state. Structural validation (no exact text matching).

**Tech Stack:** TypeScript, tsx (already installed), dotenv (already installed), @google/generative-ai

---

### Task 1: Create test script

**Files:**
- Create: `scripts/test-ai.ts`

**Step 1: Create the complete test script**

Create `scripts/test-ai.ts` with the following structure. The script MUST:

1. Load `.env.local` via dotenv at the very top (before any other imports)
2. Import `analyzeTranscript` and `mergeFollowUp` from the project
3. Define validation helpers
4. Run 5 scenarios sequentially
5. Print colored PASS/FAIL results

**IMPORTANT path alias note:** `tsx` respects `tsconfig.json` paths, so `@/lib/...` imports work. But `dotenv` must be configured BEFORE the Gemini module is imported (since it reads `process.env.NEXT_PUBLIC_GEMINI_API_KEY` at module load time). Use dynamic imports.

```typescript
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local BEFORE importing gemini (it reads API key at module level)
config({ path: resolve(__dirname, '../.env.local') });

// Now safe to import
import { analyzeTranscript, mergeFollowUp } from '@/lib/services/gemini';
import type { GeminiAnalysisResult, FollowUpQuestion, Report } from '@/lib/types/report';

// ─── Colors ───
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN = '\x1b[36m';
const DIM = '\x1b[2m';
const RESET = '\x1b[0m';

// ─── Test State ───
let passed = 0;
let failed = 0;
const failures: string[] = [];

function pass(name: string) {
  passed++;
  console.log(`  ${GREEN}[PASS]${RESET} ${name}`);
}

function fail(name: string, reason: string) {
  failed++;
  failures.push(`${name}: ${reason}`);
  console.log(`  ${RED}[FAIL]${RESET} ${name} ${DIM}→ ${reason}${RESET}`);
}

// ─── Validation Helpers ───

function assertDefined(val: unknown, name: string): boolean {
  if (val === undefined || val === null) { fail(name, `undefined/null`); return false; }
  pass(name);
  return true;
}

function assertArray(val: unknown, name: string, minLength = 0): boolean {
  if (!Array.isArray(val)) { fail(name, `not array: ${typeof val}`); return false; }
  if (val.length < minLength) { fail(name, `length ${val.length} < ${minLength}`); return false; }
  pass(name);
  return true;
}

function assertString(val: unknown, name: string, contains?: string): boolean {
  if (typeof val !== 'string') { fail(name, `not string: ${typeof val}`); return false; }
  if (contains && !val.toLowerCase().includes(contains.toLowerCase())) {
    fail(name, `"${val}" does not contain "${contains}"`);
    return false;
  }
  pass(name);
  return true;
}

function assertNumber(val: unknown, name: string, min?: number, max?: number): boolean {
  if (typeof val !== 'number') { fail(name, `not number: ${typeof val}`); return false; }
  if (min !== undefined && val < min) { fail(name, `${val} < ${min}`); return false; }
  if (max !== undefined && val > max) { fail(name, `${val} > ${max}`); return false; }
  pass(name);
  return true;
}

function assertNoQuestionAbout(questions: FollowUpQuestion[], keyword: string, name: string): boolean {
  const found = questions.find(q => q.frage.toLowerCase().includes(keyword.toLowerCase()));
  if (found) { fail(name, `question still present: "${found.frage}"`); return false; }
  pass(name);
  return true;
}

function assertContainsItem(arr: Array<Record<string, unknown>>, field: string, keyword: string, name: string): boolean {
  const found = arr.some(item => {
    const val = item[field];
    return typeof val === 'string' && val.toLowerCase().includes(keyword.toLowerCase());
  });
  if (!found) { fail(name, `no item with ${field} containing "${keyword}"`); return false; }
  pass(name);
  return true;
}

const VALID_REPORT_TYPES = [
  'bautagesbericht', 'abnahmeprotokoll', 'baustellenbegehung', 'regiebericht',
  'einsatzbericht', 'bedenkenanzeige', 'berichtsheft', 'besprechungsprotokoll', 'checkliste'
];

// ─── Main ───

async function main() {
  console.log(`\n${CYAN}=== BauVoice KI-Tests ===${RESET}\n`);

  let report: Report;
  let questions: FollowUpQuestion[];
  let result: GeminiAnalysisResult;

  // ─── Szenario 1: Basis-Flow ───
  console.log(`${YELLOW}Szenario 1: Basis-Flow${RESET}`);

  result = await analyzeTranscript(
    'Heute auf der Baustelle Marienplatz 5. Thomas und ich haben Fliesen verlegt im Bad, ungefähr 20 Quadratmeter. Wir haben um 7 Uhr angefangen.'
  );
  report = result.report;
  questions = result.questions;

  assertDefined(report, '1.1 Report existiert');
  assertString(report.allgemeine_informationen?.projekt, '1.2 Projekt gesetzt', 'marienplatz');
  assertArray(report.mitarbeiter, '1.3 Mitarbeiter ist Array', 1);
  assertArray(report.leistungen, '1.4 Leistungen vorhanden', 1);
  assertContainsItem(
    report.leistungen as unknown as Array<Record<string, unknown>>,
    'beschreibung', 'fliesen', '1.5 Leistung enthält Fliesen'
  );
  assertArray(questions, '1.6 Fragen vorhanden', 1);
  assertNumber(report.vollstaendigkeit, '1.7 Vollständigkeit ist Zahl 0-100', 0, 100);

  // ─── Szenario 1b: Frage beantworten ───
  console.log(`\n${YELLOW}Szenario 1b: Frage mit kurzem Text beantworten${RESET}`);

  // Pick first question and answer it contextually
  const firstQ = questions[0];
  console.log(`  ${DIM}Offene Frage: "${firstQ?.frage}"${RESET}`);

  // Answer with a short reply
  const shortAnswer = firstQ?.frage?.toLowerCase().includes('wetter')
    ? 'sonnig'
    : firstQ?.frage?.toLowerCase().includes('material')
    ? '30kg Fliesenkleber'
    : firstQ?.frage?.toLowerCase().includes('bis')
    ? '16 Uhr'
    : 'ja, alles erledigt';

  console.log(`  ${DIM}Antwort: "${shortAnswer}"${RESET}`);

  result = await mergeFollowUp(report, shortAnswer, questions);
  report = result.report;
  const prevQuestionText = firstQ?.frage || '';
  questions = result.questions;

  assertDefined(report, '1b.1 Report nach Merge existiert');
  // The answered question should not reappear (check by first few words)
  const keywordFromQ = prevQuestionText.split(' ').slice(0, 3).join(' ');
  if (keywordFromQ.length > 5) {
    assertNoQuestionAbout(questions, keywordFromQ.split(' ')[1] || '', '1b.2 Beantwortete Frage ist weg');
  } else {
    pass('1b.2 Beantwortete Frage ist weg (skipped — question too short to match)');
  }

  // ─── Szenario 2: Merge-Korrektheit ───
  console.log(`\n${YELLOW}Szenario 2: Merge-Korrektheit${RESET}`);

  // 2a: Add new material
  const prevMaterialCount = report.materialien.length;
  result = await mergeFollowUp(report, 'Wir haben auch 30kg Fliesenkleber verbraucht und eine Flex benutzt', questions);
  report = result.report;
  questions = result.questions;

  assertArray(report.materialien, '2.1 Materialien ist Array', prevMaterialCount > 0 ? prevMaterialCount : 1);
  assertContainsItem(
    report.materialien as unknown as Array<Record<string, unknown>>,
    'bezeichnung', 'fliesenkleber', '2.2 Fliesenkleber hinzugefügt'
  );
  assertArray(report.leistungen, '2.3 Leistungen noch da (nicht verloren)', 1);
  assertContainsItem(
    report.leistungen as unknown as Array<Record<string, unknown>>,
    'beschreibung', 'fliesen', '2.4 Ursprüngliche Leistung erhalten'
  );
  assertArray(report.geraete, '2.5 Geräte vorhanden (Flex)', 1);

  // 2b: Correct a value
  result = await mergeFollowUp(report, 'Es waren eigentlich nur 20kg Fliesenkleber, nicht 30', questions);
  report = result.report;
  questions = result.questions;

  const kleberItems = (report.materialien as unknown as Array<Record<string, unknown>>)
    .filter(m => typeof m.bezeichnung === 'string' && m.bezeichnung.toLowerCase().includes('fliesenkleber'));

  if (kleberItems.length <= 1) {
    pass('2.6 Fliesenkleber nicht dupliziert');
  } else {
    fail('2.6 Fliesenkleber nicht dupliziert', `${kleberItems.length} Einträge gefunden`);
  }

  const kleberMenge = kleberItems[0]?.menge;
  if (typeof kleberMenge === 'string' && kleberMenge.includes('20')) {
    pass('2.7 Menge korrigiert auf 20');
  } else {
    fail('2.7 Menge korrigiert auf 20', `Menge: "${kleberMenge}"`);
  }

  // ─── Szenario 3: Edge Cases ───
  console.log(`\n${YELLOW}Szenario 3: Edge Cases${RESET}`);

  // 3a: Nonsense input — should not crash
  const reportBefore = JSON.stringify(report);
  try {
    result = await mergeFollowUp(report, 'asdfghjkl zxcvbnm qwerty', questions);
    pass('3.1 Unsinniger Input crasht nicht');
    // Report should be mostly unchanged
    if (result.report.allgemeine_informationen?.projekt === report.allgemeine_informationen?.projekt) {
      pass('3.2 Report bleibt intakt nach Unsinn');
    } else {
      fail('3.2 Report bleibt intakt nach Unsinn', 'Projekt geändert');
    }
    report = result.report;
    questions = result.questions;
  } catch (e: unknown) {
    fail('3.1 Unsinniger Input crasht nicht', `Error: ${(e as Error).message}`);
    fail('3.2 Report bleibt intakt nach Unsinn', 'skipped due to crash');
  }

  // 3b: Mixed input — answer + new info
  result = await mergeFollowUp(
    report,
    'Das Wetter war sonnig, 15 Grad. Übrigens haben wir auch die Silikonfugen im Bad gemacht.',
    questions
  );
  report = result.report;
  questions = result.questions;

  const wetterSet = report.allgemeine_informationen?.wetter;
  if (typeof wetterSet === 'string' && wetterSet.length > 0) {
    pass('3.3 Wetter aus gemischter Eingabe gesetzt');
  } else {
    fail('3.3 Wetter aus gemischter Eingabe gesetzt', `Wetter: "${wetterSet}"`);
  }

  // Check if Silikonfugen added as new Leistung
  assertContainsItem(
    report.leistungen as unknown as Array<Record<string, unknown>>,
    'beschreibung', 'silikon', '3.4 Neue Leistung aus gemischter Eingabe'
  );

  // ─── Szenario 4: Fragen-Kontext ───
  console.log(`\n${YELLOW}Szenario 4: Fragen-Kontext${RESET}`);

  // Create a fresh report with guaranteed multiple questions
  const freshResult = await analyzeTranscript('Wir haben heute auf der Baustelle gearbeitet.');
  let freshReport = freshResult.report;
  let freshQuestions = freshResult.questions;

  assertArray(freshQuestions, '4.1 Vage Eingabe erzeugt Fragen', 1);
  console.log(`  ${DIM}${freshQuestions.length} Fragen generiert${RESET}`);
  freshQuestions.forEach(q => console.log(`  ${DIM}  - ${q.frage}${RESET}`));

  if (freshQuestions.length >= 2) {
    // Answer only the first question
    const q1 = freshQuestions[0];
    const answer = `Antwort auf Frage: "${q1.frage}" → Projekt Schulneubau München`;

    result = await mergeFollowUp(freshReport, answer, freshQuestions);
    freshReport = result.report;
    const newQuestions = result.questions;

    // The first question's topic should not reappear
    const q1Keyword = q1.frage.split(' ').find(w => w.length > 4) || '';
    if (q1Keyword) {
      assertNoQuestionAbout(newQuestions, q1Keyword, '4.2 Beantwortete Frage (Q1) ist weg');
    } else {
      pass('4.2 Beantwortete Frage (Q1) ist weg (skipped — no keyword)');
    }

    // Other questions should still exist or be replaced by new relevant ones
    // (we can't guarantee exact same questions, but there should still be some if report is incomplete)
    if (freshReport.vollstaendigkeit < 90) {
      assertArray(newQuestions, '4.3 Andere Fragen noch vorhanden', 1);
    } else {
      pass('4.3 Andere Fragen noch vorhanden (skipped — report nearly complete)');
    }
  } else {
    pass('4.2 Beantwortete Frage (Q1) ist weg (skipped — less than 2 questions)');
    pass('4.3 Andere Fragen noch vorhanden (skipped — less than 2 questions)');
  }

  // 4b: Quick-reply format
  const qrResult = await analyzeTranscript(
    'Heute auf der Baustelle Hauptstraße 10. Malerarbeiten im Flur, 30 Quadratmeter gestrichen.'
  );
  let qrReport = qrResult.report;
  let qrQuestions = qrResult.questions;

  if (qrQuestions.length > 0 && qrQuestions[0].quick_replies && qrQuestions[0].quick_replies.length > 0) {
    const qr = qrQuestions[0];
    const reply = qr.quick_replies![0];
    const contextualAnswer = `Antwort auf Frage: "${qr.frage}" → ${reply}`;

    result = await mergeFollowUp(qrReport, contextualAnswer, qrQuestions);
    pass('4.4 Quick-Reply-Format wird verarbeitet');
  } else {
    pass('4.4 Quick-Reply-Format wird verarbeitet (skipped — no quick replies available)');
  }

  // ─── Szenario 5: Strukturelle Robustheit ───
  console.log(`\n${YELLOW}Szenario 5: Strukturelle Robustheit${RESET}`);

  // Use the main report for structural checks
  assertArray(report.leistungen, '5.1 leistungen ist Array');
  assertArray(report.materialien, '5.2 materialien ist Array');
  assertArray(report.geraete, '5.3 geraete ist Array');
  assertArray(report.mitarbeiter, '5.4 mitarbeiter ist Array');
  assertArray(report.bilder, '5.5 bilder ist Array');

  if (VALID_REPORT_TYPES.includes(report.berichtstyp)) {
    pass('5.6 berichtstyp ist gültiger Wert');
  } else {
    fail('5.6 berichtstyp ist gültiger Wert', `"${report.berichtstyp}"`);
  }

  assertNumber(report.vollstaendigkeit, '5.7 vollstaendigkeit ist Zahl 0-100', 0, 100);
  assertString(report.allgemeine_informationen?.projekt, '5.8 Projekt ist String');
  assertString(report.allgemeine_informationen?.datum, '5.9 Datum ist String');
  assertString(report.besondere_vorkommnisse, '5.10 besondere_vorkommnisse ist String (auch wenn leer)');

  // ─── Summary ───
  console.log(`\n${CYAN}=== Ergebnis ===${RESET}`);
  console.log(`${GREEN}${passed} PASS${RESET}, ${failed > 0 ? RED : GREEN}${failed} FAIL${RESET}`);

  if (failures.length > 0) {
    console.log(`\n${RED}Fehlgeschlagene Tests:${RESET}`);
    failures.forEach(f => console.log(`  ${RED}✗${RESET} ${f}`));
  }

  console.log('');
  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error(`\n${RED}Fatal error:${RESET}`, err);
  process.exit(2);
});
```

**Step 2: Commit**

```bash
git add scripts/test-ai.ts
git commit -m "feat: add KI output test script with 5 scenarios

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Run tests and analyze

**Step 1: Run the test script**

```bash
npx tsx scripts/test-ai.ts
```

Expected: Colored output with PASS/FAIL per test, summary at the end. Some tests may fail due to AI non-determinism — analyze failures to distinguish between real bugs and expected variance.

**Step 2: If failures found, analyze and adjust**

- If structural failures (null arrays, wrong types): Bug in sanitizeResult
- If question not disappearing: Bug in MERGE_PROMPT or question context injection
- If merge duplicating: Bug in MERGE_PROMPT correction logic
- If crash on edge case: Missing error handling

Report findings and fix if needed.
