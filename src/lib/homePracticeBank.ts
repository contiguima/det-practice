export type HomePracticeWord = {
  word: string;
  isReal: boolean;
  es: string;
  definitionEn: string;
  exampleEn: string;
};

function extractEnglishHint(note: string): string | null {
  const m = note.match(/\(([^)]+)\)/);
  if (!m) return null;
  const inner = m[1].trim();
  // Prefer English hints like "correct is X"
  if (/[a-zA-Z]/.test(inner) && inner.length <= 80) return inner;
  return null;
}

function buildDefinitionEn(word: string, isReal: boolean, note: string): string {
  if (!isReal) {
    return "This is not a standard English word as written.";
  }
  const hint = extractEnglishHint(note);
  if (hint) return hint;
  return "A real English word you may see in academic reading passages.";
}

function buildExampleEn(word: string, isReal: boolean): string {
  if (!isReal) {
    return `Example: “${word}” is not a typical dictionary form in English.`;
  }
  return `Example: The passage uses “${word}” in a formal, academic context.`;
}

export function parseHomePracticeTsv(tsv: string): HomePracticeWord[] {
  const lines = tsv.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const byWord = new Map<string, HomePracticeWord>();

  for (const line of lines) {
    if (/^palabra\b/i.test(line)) continue;

    let parts = line.split("\t").map((p) => p.trim());
    if (parts.length < 3) {
      const m = line.match(/^(.+?)\s+(Sí|Si|No)\s+(.+)$/i);
      if (!m) continue;
      parts = [m[1].trim(), m[2].trim(), m[3].trim()];
    }

    const word = parts[0]?.trim();
    const yn = parts[1]?.trim().toLowerCase();
    const note = parts.slice(2).join(" ").trim();
    if (!word || !yn) continue;

    const isReal = yn === "sí" || yn === "si";
    const es = note || "—";

    byWord.set(word.toLowerCase(), {
      word,
      isReal,
      es,
      definitionEn: buildDefinitionEn(word, isReal, note),
      exampleEn: buildExampleEn(word, isReal),
    });
  }

  return Array.from(byWord.values());
}

export function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}
