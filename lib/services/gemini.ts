import { GoogleGenerativeAI } from '@google/generative-ai';
import { SYSTEM_PROMPT, MERGE_PROMPT } from '@/lib/prompts/systemPrompt';
import { FollowUpQuestion, GeminiAnalysisResult, Report } from '@/lib/types/report';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

function getModel() {
  return genAI.getGenerativeModel({
    model: 'gemini-2.0-flash',
    generationConfig: {
      responseMimeType: 'application/json',
    },
  });
}

function sanitizeResult(raw: unknown): GeminiAnalysisResult {
  const obj = (raw ?? {}) as Record<string, unknown>;
  const report = (obj.report ?? {}) as Record<string, unknown>;

  // Sanitize allgemeine_informationen sub-fields
  const rawInfo = (report.allgemeine_informationen ?? {}) as Record<string, unknown>;
  const allgemeine_informationen = {
    ...rawInfo,
    projekt: typeof rawInfo.projekt === 'string' ? rawInfo.projekt : 'Unbekanntes Projekt',
    datum: typeof rawInfo.datum === 'string' ? rawInfo.datum : new Date().toISOString().split('T')[0],
    erstellt_von: typeof rawInfo.erstellt_von === 'string' ? rawInfo.erstellt_von : 'Unbekannt',
  };

  // Helper: ensure value is an array, defaulting to []
  const ensureArray = (val: unknown): unknown[] =>
    Array.isArray(val) ? val : [];

  const sanitizedReport = {
    ...report,
    berichtstyp: typeof report.berichtstyp === 'string' ? report.berichtstyp : 'bautagesbericht',
    allgemeine_informationen,
    leistungen: ensureArray(report.leistungen),
    materialien: ensureArray(report.materialien),
    geraete: ensureArray(report.geraete),
    mitarbeiter: ensureArray(report.mitarbeiter),
    bilder: ensureArray(report.bilder),
    besondere_vorkommnisse: typeof report.besondere_vorkommnisse === 'string'
      ? report.besondere_vorkommnisse
      : '',
    vollstaendigkeit: typeof report.vollstaendigkeit === 'number'
      ? report.vollstaendigkeit
      : 0,
    status: typeof report.status === 'string' ? report.status : 'entwurf',
  };

  // Sanitize individual questions: ensure quick_replies are real values, not "string" placeholders
  const rawQuestions = ensureArray(obj.questions) as FollowUpQuestion[];
  const sanitizedQuestions = rawQuestions.map((q) => ({
    ...q,
    quick_replies: Array.isArray(q.quick_replies)
      ? q.quick_replies.filter(
          (r) => typeof r === 'string' && r.length > 0 && r.toLowerCase() !== 'string'
        )
      : [],
  }));

  return {
    report: sanitizedReport as GeminiAnalysisResult['report'],
    questions: sanitizedQuestions,
    problems: ensureArray(obj.problems) as GeminiAnalysisResult['problems'],
  };
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
  newInput: string,
  openQuestions?: FollowUpQuestion[]
): Promise<GeminiAnalysisResult> {
  const model = getModel();

  const questionsContext = openQuestions && openQuestions.length > 0
    ? `\n\nKONTEXT — Offene Nachfragen:\nDie folgenden Nachfragen sind aktuell offen und wurden dem Handwerker angezeigt.\nPrüfe ob die neue Eingabe eine oder mehrere dieser Fragen beantwortet:\n- Wenn ja: Information in den Bericht einbauen, beantwortete Frage NICHT erneut stellen\n- Wenn nein: Eingabe als neue Information behandeln und mergen\n- Gemischte Eingaben sind möglich (teils Antwort, teils neue Info)\n- Bei kurzen Antworten (z.B. "5", "Thomas") prüfe ob sie zu einer offenen Frage passen\n\nAktuell offene Nachfragen:\n${JSON.stringify(openQuestions.map(q => ({ id: q.id, frage: q.frage, typ: q.typ })), null, 2)}`
    : '\n\nAktuell offene Nachfragen: Keine';

  const prompt = `${SYSTEM_PROMPT}

${MERGE_PROMPT}
${questionsContext}

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
