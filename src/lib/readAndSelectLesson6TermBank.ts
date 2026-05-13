/** Single tokens for the Lesson 6 “all lessons” summary check (word-boundary match, case-insensitive). */
export const LESSON_6_SUMMARY_SINGLE_TERMS = [
  // Lesson 0
  "Actually",
  "Maybe",
  "Enough",
  "Available",
  "Instead",
  "Anyway",
  "get",
  "want",
  "need",
  // Lesson 1
  "Leverage",
  "Stakeholder",
  "Streamline",
  "Feasibility",
  "Roadmap",
  "Bottleneck",
  "KPI",
  "Scalability",
  "Deliverable",
  "Implementation",
  // Lesson 2
  "Emphasize",
  "Correlate",
  "Hypothesis",
  "Systematic",
  "Variables",
  "Empirical",
  "Facilitate",
  "Synthesize",
  "Evaluate",
  "Methodology",
  // Lesson 3
  "Disruptive",
  "User-centric",
  "Prototype",
  "Deployment",
  "Iteration",
  "Interdependence",
  "Framework",
  "Paradigm",
  "Automation",
  "Optimization",
  // Lesson 4
  "Ubiquitous",
  "Resilience",
  "Ambiguous",
  "Fundamental",
  "Substantial",
  "Versatile",
  "Cohesive",
  "Inherent",
  "Prevalent",
  "Obsolete",
  // Lesson 5
  "Furthermore",
  "Notwithstanding",
  "Consequently",
  "Paradoxically",
  "Albeit",
  "Conversely",
  "Hence",
  "Moreover",
  "Subsequently",
] as const;

export const LESSON_6_SUMMARY_PHRASES = [
  "In light of",
  "Bear in mind",
  "Draw a conclusion",
  "Meet a deadline",
  "Take into account",
  "Undergo a change",
  "High-stakes",
  "Cutting-edge",
] as const;

function hasToken(text: string, term: string): boolean {
  if (term.includes("-")) {
    return text.toLowerCase().includes(term.toLowerCase());
  }
  const esc = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${esc}\\b`, "i").test(text);
}

export function countLesson6SummaryHits(text: string): {
  singles: string[];
  phrases: string[];
  uniqueCount: number;
} {
  const t = text;
  const singles = LESSON_6_SUMMARY_SINGLE_TERMS.filter((term) => hasToken(t, term));
  const phrases = LESSON_6_SUMMARY_PHRASES.filter((p) =>
    t.toLowerCase().includes(p.toLowerCase()),
  );
  const set = new Set([...singles.map((x) => x.toLowerCase()), ...phrases.map((x) => x.toLowerCase())]);
  return { singles, phrases, uniqueCount: set.size };
}

export function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
}
