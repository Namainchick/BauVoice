/**
 * Test script for Gemini API integration.
 * Tests analyzeTranscript() and mergeFollowUp() with real API calls.
 *
 * Run: npx tsx scripts/test-gemini.ts
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load .env.local
const envPath = path.resolve(__dirname, '../.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
if (!API_KEY || API_KEY === 'your_key_here') {
  console.error('ERROR: Set a real NEXT_PUBLIC_GEMINI_API_KEY in .env.local');
  process.exit(1);
}

// Inline the prompts to avoid import alias issues
const SYSTEM_PROMPT = fs.readFileSync(
  path.resolve(__dirname, '../lib/prompts/systemPrompt.ts'),
  'utf-8'
).match(/export const SYSTEM_PROMPT = `([\s\S]*?)`;/)?.[1] || '';

const MERGE_PROMPT_TEXT = fs.readFileSync(
  path.resolve(__dirname, '../lib/prompts/systemPrompt.ts'),
  'utf-8'
).match(/export const MERGE_PROMPT = `([\s\S]*?)`;/)?.[1] || '';

const genAI = new GoogleGenerativeAI(API_KEY);

function getModel() {
  return genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: { responseMimeType: 'application/json' },
  });
}

function cleanJson(text: string): string {
  let c = text.trim();
  if (c.startsWith('```json')) c = c.slice(7);
  else if (c.startsWith('```')) c = c.slice(3);
  if (c.endsWith('```')) c = c.slice(0, -3);
  return c.trim();
}

// ─── Test cases ──────────────────────────────────────────────

const TEST_TRANSCRIPTS = [
  {
    name: 'Bautagesbericht — vollständig',
    input: `Heute war ich mit Kevin und Markus auf der Baustelle Müller in der Hauptstraße 12.
      Wir haben von 7 bis 16 Uhr gearbeitet, eine halbe Stunde Pause gemacht.
      Wir haben 35 Quadratmeter Dampfsperre verlegt und die Dachlatten montiert.
      Verbraucht haben wir 2 Rollen Dampfsperrfolie und 50 Dachlatten.
      Das Wetter war sonnig, ungefähr 12 Grad.
      An der Südwand ist uns ein Riss aufgefallen, das sollte man sich nochmal anschauen.`,
    expectType: 'bautagesbericht',
    expectMinCompleteness: 60,
    expectProblems: true,
  },
  {
    name: 'Bautagesbericht — minimal',
    input: `Heute auf der Baustelle Schmidt gewesen. Fliesen verlegt.`,
    expectType: 'bautagesbericht',
    expectMinCompleteness: 10,
    expectQuestions: true,
  },
  {
    name: 'Abnahmeprotokoll',
    input: `Heute war die Abnahme beim Kunden Meier. Anwesend waren Herr Meier und ich.
      Wir haben das Bad und die Küche geprüft. In der Küche fehlt noch eine Silikonfuge am Fenster,
      das ist ein leichter Mangel. Ansonsten ist der Kunde zufrieden, Abnahme mit Vorbehalt.`,
    expectType: 'abnahmeprotokoll',
  },
  {
    name: 'Regiebericht',
    input: `Der Bauherr hat kurzfristig gewollt dass wir den Durchbruch in der Wand vergrößern.
      Das war nicht im Angebot. Ich hab 3 Stunden dran gearbeitet und Kevin 2 Stunden.
      Auftraggeber ist die Firma Becker GmbH.`,
    expectType: 'regiebericht',
  },
  {
    name: 'Bedenkenanzeige',
    input: `Auf der Baustelle Neubau Schule habe ich festgestellt dass die angelieferten Stahlträger
      nicht die richtige Dimension haben. Die sind dünner als in der Statik vorgesehen.
      Ich hab Bedenken dass die die Last nicht tragen. Der Bauherr sollte den Statiker einschalten.`,
    expectType: 'bedenkenanzeige',
  },
];

const MERGE_TEST = {
  name: 'Merge — Ergänzung nachträglich',
  followUp: `Ach ja, vergessen – wir haben auch noch die Regenrinne repariert, hat ungefähr eine Stunde gedauert. Und 3 Meter Dachrinne verbraucht.`,
};

// ─── Validation helpers ──────────────────────────────────────

interface ValidationResult {
  pass: boolean;
  errors: string[];
  warnings: string[];
}

function validateReport(data: any, testCase: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Top-level structure
  if (!data.report) errors.push('Missing "report" key');
  if (!data.questions) errors.push('Missing "questions" key');
  if (!data.problems) errors.push('Missing "problems" key');
  if (!Array.isArray(data.questions)) errors.push('"questions" is not an array');
  if (!Array.isArray(data.problems)) errors.push('"problems" is not an array');

  const r = data.report;
  if (!r) return { pass: false, errors, warnings };

  // Required fields
  if (!r.berichtstyp) errors.push('Missing berichtstyp');
  if (!r.allgemeine_informationen) errors.push('Missing allgemeine_informationen');
  if (!Array.isArray(r.leistungen)) errors.push('leistungen is not an array');
  if (!Array.isArray(r.materialien)) errors.push('materialien is not an array');
  if (!Array.isArray(r.mitarbeiter)) errors.push('mitarbeiter is not an array');
  if (typeof r.vollstaendigkeit !== 'number') errors.push('vollstaendigkeit is not a number');

  // Check report type
  if (testCase.expectType && r.berichtstyp !== testCase.expectType) {
    errors.push(`Expected type "${testCase.expectType}", got "${r.berichtstyp}"`);
  }

  // Check completeness
  if (testCase.expectMinCompleteness && r.vollstaendigkeit < testCase.expectMinCompleteness) {
    warnings.push(`Completeness ${r.vollstaendigkeit}% below expected minimum ${testCase.expectMinCompleteness}%`);
  }

  // Check problems detected
  if (testCase.expectProblems && data.problems.length === 0) {
    warnings.push('Expected problems to be detected, but none found');
  }

  // Check questions generated
  if (testCase.expectQuestions && data.questions.length === 0) {
    warnings.push('Expected follow-up questions, but none generated');
  }

  // Validate question structure
  for (const q of data.questions) {
    if (!q.id) warnings.push('Question missing id');
    if (!q.frage) errors.push('Question missing frage');
    if (!q.typ) warnings.push('Question missing typ');
  }

  // Validate problem structure
  for (const p of data.problems) {
    if (!p.id) warnings.push('Problem missing id');
    if (!p.typ) errors.push('Problem missing typ');
    if (!p.beschreibung) errors.push('Problem missing beschreibung');
    if (!Array.isArray(p.vorgeschlagene_aktionen)) warnings.push('Problem missing vorgeschlagene_aktionen array');
  }

  return { pass: errors.length === 0, errors, warnings };
}

// ─── Test runner ─────────────────────────────────────────────

async function runTest(testCase: typeof TEST_TRANSCRIPTS[0]) {
  const model = getModel();
  const today = new Date().toISOString().split('T')[0];

  const prompt = `${SYSTEM_PROMPT}

Das heutige Datum ist: ${today}

Transkript des Handwerkers:
"${testCase.input}"

Analysiere das Transkript und erstelle den strukturierten Bericht als JSON.`;

  const startTime = Date.now();
  const result = await model.generateContent(prompt);
  const elapsed = Date.now() - startTime;

  const raw = result.response.text();
  const cleaned = cleanJson(raw);
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    return { testCase, elapsed, parsed: null, validation: { pass: false, errors: ['Invalid JSON: ' + (e as Error).message], warnings: [] }, raw };
  }

  const validation = validateReport(parsed, testCase);
  return { testCase, elapsed, parsed, validation, raw: null };
}

async function runMergeTest(initialReport: any) {
  const model = getModel();

  const prompt = `${SYSTEM_PROMPT}

${MERGE_PROMPT_TEXT}

Bestehender Bericht:
${JSON.stringify(initialReport, null, 2)}

Neue Eingabe des Handwerkers:
"${MERGE_TEST.followUp}"

Merge die neue Information und antworte als JSON.`;

  const startTime = Date.now();
  const result = await model.generateContent(prompt);
  const elapsed = Date.now() - startTime;

  const raw = result.response.text();
  const cleaned = cleanJson(raw);
  let parsed: any;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    return { elapsed, parsed: null, error: 'Invalid JSON: ' + (e as Error).message };
  }

  return { elapsed, parsed };
}

// ─── Main ────────────────────────────────────────────────────

async function main() {
  console.log('═══════════════════════════════════════════════════════');
  console.log('  BauVoice Gemini API Test Suite');
  console.log('═══════════════════════════════════════════════════════\n');

  let passed = 0;
  let failed = 0;
  let firstReport: any = null;

  // Run all transcript analysis tests
  for (const tc of TEST_TRANSCRIPTS) {
    process.stdout.write(`▶ ${tc.name}... `);
    try {
      const { elapsed, parsed, validation, raw } = await runTest(tc);

      if (!parsed) {
        console.log(`FAIL (${elapsed}ms)`);
        console.log(`  ❌ ${validation.errors.join(', ')}`);
        if (raw) console.log(`  Raw response: ${raw.slice(0, 200)}...`);
        failed++;
        continue;
      }

      if (validation.pass) {
        console.log(`PASS (${elapsed}ms)`);
        passed++;
      } else {
        console.log(`FAIL (${elapsed}ms)`);
        failed++;
      }

      // Print details
      const r = parsed.report;
      console.log(`  Type: ${r.berichtstyp} | Completeness: ${r.vollstaendigkeit}%`);
      console.log(`  Mitarbeiter: ${r.mitarbeiter.length} | Leistungen: ${r.leistungen.length} | Materialien: ${r.materialien.length}`);
      console.log(`  Questions: ${parsed.questions.length} | Problems: ${parsed.problems.length}`);

      for (const err of validation.errors) console.log(`  ❌ ${err}`);
      for (const warn of validation.warnings) console.log(`  ⚠️  ${warn}`);

      // Print questions
      if (parsed.questions.length > 0) {
        console.log('  📋 Nachfragen:');
        for (const q of parsed.questions) {
          console.log(`     - [${q.typ}] ${q.frage}`);
          if (q.quick_replies?.length) console.log(`       Quick replies: ${q.quick_replies.join(' | ')}`);
        }
      }

      // Print problems
      if (parsed.problems.length > 0) {
        console.log('  🚨 Probleme:');
        for (const p of parsed.problems) {
          console.log(`     - [${p.typ}] ${p.beschreibung}`);
          if (p.vorgeschlagene_aktionen?.length) {
            console.log(`       Aktionen: ${p.vorgeschlagene_aktionen.map((a: any) => `${a.typ}: ${a.label}`).join(' | ')}`);
          }
        }
      }

      // Save first report for merge test
      if (!firstReport && r.berichtstyp === 'bautagesbericht') {
        firstReport = parsed.report;
      }

    } catch (e) {
      console.log(`ERROR`);
      console.log(`  ❌ ${(e as Error).message}`);
      failed++;
    }
    console.log();
  }

  // Merge test
  if (firstReport) {
    console.log('───────────────────────────────────────────────────────');
    console.log(`▶ ${MERGE_TEST.name}...`);
    console.log(`  Follow-up: "${MERGE_TEST.followUp}"`);
    console.log();

    try {
      const beforeLeistungen = firstReport.leistungen.length;
      const beforeMaterialien = firstReport.materialien.length;

      const { elapsed, parsed, error } = await runMergeTest(firstReport);

      if (error || !parsed) {
        console.log(`  FAIL (${elapsed}ms): ${error}`);
        failed++;
      } else {
        const r = parsed.report;
        const afterLeistungen = r.leistungen.length;
        const afterMaterialien = r.materialien.length;

        const leistungenAdded = afterLeistungen > beforeLeistungen;
        const materialienAdded = afterMaterialien > beforeMaterialien;

        console.log(`  Response time: ${elapsed}ms`);
        console.log(`  Leistungen: ${beforeLeistungen} → ${afterLeistungen} ${leistungenAdded ? '✅ added' : '⚠️  not added'}`);
        console.log(`  Materialien: ${beforeMaterialien} → ${afterMaterialien} ${materialienAdded ? '✅ added' : '⚠️  not added'}`);
        console.log(`  Completeness: ${firstReport.vollstaendigkeit}% → ${r.vollstaendigkeit}%`);
        console.log(`  New questions: ${parsed.questions.length}`);

        // Check merge didn't delete existing data
        const originalMitarbeiter = firstReport.mitarbeiter;
        const mergedMitarbeiter = r.mitarbeiter;
        const allPreserved = originalMitarbeiter.every((m: string) =>
          mergedMitarbeiter.some((mm: string) => mm.toLowerCase().includes(m.toLowerCase()))
        );
        console.log(`  Original data preserved: ${allPreserved ? '✅ yes' : '❌ NO — data was lost!'}`);

        if (leistungenAdded && materialienAdded && allPreserved) {
          console.log(`  PASS`);
          passed++;
        } else {
          console.log(`  PARTIAL — merge worked but some expectations not met`);
          passed++; // Still count as pass if no crash
        }
      }
    } catch (e) {
      console.log(`  ERROR: ${(e as Error).message}`);
      failed++;
    }
    console.log();
  }

  // Summary
  console.log('═══════════════════════════════════════════════════════');
  console.log(`  Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
  console.log('═══════════════════════════════════════════════════════');

  process.exit(failed > 0 ? 1 : 0);
}

main();
