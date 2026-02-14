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
  const parsed = JSON.parse(cleaned) as GeminiAnalysisResult;
  return parsed;
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
  const parsed = JSON.parse(cleaned) as GeminiAnalysisResult;
  return parsed;
}
