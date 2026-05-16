import type { RubricCriterionDef } from "@/lib/exams/writingRubric";
import { getWritingCriteria } from "@/lib/exams/writingRubric";

export type WritingCriterionScore = {
  id: string;
  label: string;
  scorePercent: number;
  weightPercent: number;
  feedback: string;
};

export type WritingEvaluation = {
  overallPercent: number;
  criteria: WritingCriterionScore[];
};

const CONNECTORS =
  /\b(however|therefore|because|although|then|after|when|while|since|so|but|and|first|second|finally|meanwhile|later|also|moreover)\b/gi;

const B2_WORDS =
  /\b(accomplish|accomplished|substantial|significant|memorable|satisfying|satisfied|eventually|particularly|throughout|achievement|grateful|delighted|relieved|successful|completed|meaningful)\b/gi;

const PAST_FORMS =
  /\b(was|were|had|did|went|made|felt|said|got|took|saw|knew|thought|told|became|found|gave|left|put|kept|let|began|brought|wrote|stood|heard|spent|ran|paid|met|moved|lived|believed|held|turned|started|showed|tried|walked|drove|finished|enjoyed|realized|decided|worked|happened)\b/gi;

const WEAK_WORDS = /\b(good|nice|great|very|really|thing|things|stuff)\b/gi;

const TASK1_SIGNALS =
  /\b(accomplish|achieved|satisfy|satisfying|satisfied|day|worked|perfect|success|happy|completed|finished|because|why|everything|memorable)\b/gi;

const STOP_WORDS = new Set([
  "about",
  "after",
  "before",
  "there",
  "their",
  "would",
  "could",
  "should",
  "which",
  "while",
  "where",
  "when",
  "that",
  "this",
  "with",
  "from",
  "have",
  "been",
  "were",
  "was",
  "they",
  "them",
  "what",
  "your",
  "mine",
  "ours",
]);

function wordCount(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, Math.round(n)));
}

function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 4 && !STOP_WORDS.has(w));
  const freq = new Map<string, number>();
  for (const w of words) {
    freq.set(w, (freq.get(w) || 0) + 1);
  }
  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 14)
    .map(([w]) => w);
}

async function fetchGrammarScore(text: string): Promise<number> {
  if (text.length < 3) return 0;
  const params = new URLSearchParams();
  params.set("text", text.slice(0, 8000));
  params.set("language", "en-US");
  params.set("enabledOnly", "false");
  try {
    const res = await fetch("https://api.languagetool.org/v2/check", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    if (!res.ok) return 70;
    const json = (await res.json()) as { matches?: unknown[] };
    const errors = Array.isArray(json.matches) ? json.matches.length : 0;
    const wc = Math.max(wordCount(text), 1);
    const errorsPer100 = (errors / wc) * 100;
    return clamp(100 - errorsPer100 * 18);
  } catch {
    return 70;
  }
}

function scoreGrammaticalAccuracy(text: string, grammarScore: number): number {
  const wc = wordCount(text);
  const pastHits = (text.match(PAST_FORMS) || []).length;
  const pastRatio = pastHits / Math.max(wc, 1);
  const pastScore = clamp(pastRatio * 350);
  return clamp(grammarScore * 0.55 + pastScore * 0.45);
}

function scoreLexicalSophistication(text: string): number {
  const words = text.split(/\s+/).filter(Boolean);
  const wc = words.length;
  if (wc < 5) return 0;
  const avgLen = words.reduce((s, w) => s + w.replace(/[^a-z]/gi, "").length, 0) / wc;
  const b2Hits = (text.match(B2_WORDS) || []).length;
  const lenScore = clamp((avgLen - 3.6) * 35);
  const b2Score = clamp(b2Hits * 22);
  const weakPenalty = (text.match(WEAK_WORDS) || []).length * 8;
  return clamp(lenScore * 0.35 + b2Score * 0.45 + 20 - weakPenalty);
}

function scoreCoherence(text: string): number {
  const wc = wordCount(text);
  const connectors = (text.match(CONNECTORS) || []).length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 8).length;
  const connectorScore = clamp((connectors / Math.max(wc / 35, 1)) * 55);
  const structureScore = clamp(sentences * 12);
  return clamp(connectorScore * 0.65 + structureScore * 0.35);
}

function scoreTaskRelevance(text: string): number {
  const wc = wordCount(text);
  const signals = (text.match(TASK1_SIGNALS) || []).length;
  const lengthScore = wc >= 50 ? 35 : wc >= 30 ? 22 : wc >= 15 ? 10 : 0;
  return clamp(signals * 12 + lengthScore);
}

function scoreGrammaticalComplexity(text: string, grammarScore: number): number {
  const clauses = (
    text.match(/,|;|:|\b(which|who|that|when|while|although|because|if|unless)\b/gi) || []
  ).length;
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 5);
  const starters = new Set(
    sentences.map((s) => s.trim().split(/\s+/)[0]?.toLowerCase()).filter(Boolean),
  );
  const varietyScore = clamp(starters.size * 14);
  const clauseScore = clamp(clauses * 9);
  return clamp(grammarScore * 0.35 + varietyScore * 0.35 + clauseScore * 0.3);
}

function scoreVocabularyPrecision(text: string): number {
  const words = text
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z]/g, ""))
    .filter(Boolean);
  if (words.length < 5) return 0;
  const uniqueRatio = new Set(words).size / words.length;
  const weak = (text.match(WEAK_WORDS) || []).length;
  const b2 = (text.match(B2_WORDS) || []).length;
  return clamp(uniqueRatio * 95 + b2 * 10 - weak * 14);
}

function scoreContextualAlignment(priorText: string, text: string): number {
  if (!priorText.trim()) return 55;
  const keys = extractKeywords(priorText);
  if (keys.length === 0) return 50;
  const lower = text.toLowerCase();
  let hits = 0;
  for (const k of keys) {
    if (lower.includes(k)) hits++;
  }
  const overlap = hits / keys.length;
  const momentSignals = /\b(moment|remember|when|suddenly|stood|saw|heard|felt)\b/gi;
  const momentScore = (text.match(momentSignals) || []).length > 0 ? 15 : 0;
  return clamp(overlap * 85 + momentScore);
}

function scoreCriterion(
  id: string,
  text: string,
  grammarScore: number,
  priorText: string,
): number {
  switch (id) {
    case "grammatical_accuracy":
      return scoreGrammaticalAccuracy(text, grammarScore);
    case "lexical_sophistication":
      return scoreLexicalSophistication(text);
    case "coherence":
      return scoreCoherence(text);
    case "task_relevance":
      return scoreTaskRelevance(text);
    case "grammatical_complexity":
      return scoreGrammaticalComplexity(text, grammarScore);
    case "vocabulary_precision":
      return scoreVocabularyPrecision(text);
    case "contextual_alignment":
      return scoreContextualAlignment(priorText, text);
    default:
      return 50;
  }
}

function buildExplanation(criteria: WritingCriterionScore[], overall: number): string {
  const weak = criteria.filter((c) => c.scorePercent < 55);
  const strong = criteria.filter((c) => c.scorePercent >= 75);
  const parts: string[] = [`Puntuación global de writing: ${overall}%.`];
  if (strong.length) {
    parts.push(`Fortalezas: ${strong.map((c) => c.label).join(", ")}.`);
  }
  if (weak.length) {
    parts.push(`A mejorar: ${weak.map((c) => c.feedback).join(" ")}`);
  }
  return parts.join(" ");
}

export async function evaluateWritingResponse(input: {
  questionId: string;
  text: string;
  maxPoints: number;
  priorTaskText?: string;
}): Promise<{
  evaluation: WritingEvaluation;
  earnedPoints: number;
  explanation: string;
}> {
  const criteriaDefs = getWritingCriteria(input.questionId);
  const trimmed = input.text.trim();
  const wc = wordCount(trimmed);

  if (!criteriaDefs) {
    return {
      evaluation: { overallPercent: 0, criteria: [] },
      earnedPoints: 0,
      explanation: "Pregunta de writing no configurada.",
    };
  }

  if (wc < 8) {
    const criteria: WritingCriterionScore[] = criteriaDefs.map((c) => ({
      id: c.id,
      label: c.label,
      scorePercent: 0,
      weightPercent: c.weightPercent,
      feedback: "Escribí al menos un párrafo breve para poder evaluar la rúbrica.",
    }));
    return {
      evaluation: { overallPercent: 0, criteria },
      earnedPoints: 0,
      explanation:
        "Texto demasiado corto. Escribí al menos unas 40–60 palabras para recibir una evaluación útil.",
    };
  }

  const grammarScore = await fetchGrammarScore(trimmed);
  const prior = input.priorTaskText ?? "";

  const criteria: WritingCriterionScore[] = criteriaDefs.map((def: RubricCriterionDef) => {
    const scorePercent = scoreCriterion(def.id, trimmed, grammarScore, prior);
    return {
      id: def.id,
      label: def.label,
      scorePercent,
      weightPercent: def.weightPercent,
      feedback: scorePercent >= 60 ? def.feedbackStrong : def.feedbackWeak,
    };
  });

  const overallPercent = clamp(
    criteria.reduce((sum, c) => sum + c.scorePercent * (c.weightPercent / 100), 0),
  );

  const earnedPoints =
    input.maxPoints > 0 ? Math.round((overallPercent / 100) * input.maxPoints) : 0;

  return {
    evaluation: { overallPercent, criteria },
    earnedPoints,
    explanation: buildExplanation(criteria, overallPercent),
  };
}
