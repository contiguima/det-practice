export function normalizeAnswer(raw: string): string {
  return raw.trim().toLowerCase().replace(/\s+/g, " ");
}

export function isAnswerCorrect(raw: string, expected: string): boolean {
  return normalizeAnswer(raw) === normalizeAnswer(expected);
}

/** Split prompt into text segments and blank slots (underscore runs). */
export function parseBlankSlots(prompt: string): Array<{ type: "text"; value: string } | { type: "blank"; index: number }> {
  const parts: Array<{ type: "text"; value: string } | { type: "blank"; index: number }> = [];
  const re = /([A-Za-z])(?:_ )+_?/g;
  let last = 0;
  let blankIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(prompt)) !== null) {
    if (m.index > last) {
      parts.push({ type: "text", value: prompt.slice(last, m.index) });
    }
    parts.push({ type: "blank", index: blankIndex++ });
    last = m.index + m[0].length;
  }
  if (last < prompt.length) {
    parts.push({ type: "text", value: prompt.slice(last) });
  }
  return parts;
}

export function countBlanksInPrompt(prompt: string): number {
  return parseBlankSlots(prompt).filter((p) => p.type === "blank").length;
}
