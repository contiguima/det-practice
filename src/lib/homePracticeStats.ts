const STORAGE_KEY = "det-home-practice-stats-v1";
const VERSION = 1 as const;

export type HomePracticeLifetimeStats = {
  version: typeof VERSION;
  totalCorrect: number;
  totalWrong: number;
  /** Normalized keys (lowercase trimmed) answered correctly at least once */
  learnedWordKeys: string[];
};

function emptyStats(): HomePracticeLifetimeStats {
  return { version: VERSION, totalCorrect: 0, totalWrong: 0, learnedWordKeys: [] };
}

export function wordStatsKey(word: string): string {
  return word.trim().toLowerCase();
}

export function loadHomePracticeStats(): HomePracticeLifetimeStats {
  if (typeof window === "undefined") return emptyStats();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStats();
    const data = JSON.parse(raw) as Partial<HomePracticeLifetimeStats>;
    if (data.version !== VERSION || typeof data.totalCorrect !== "number" || typeof data.totalWrong !== "number") {
      return emptyStats();
    }
    const learned = Array.isArray(data.learnedWordKeys)
      ? data.learnedWordKeys.filter((k): k is string => typeof k === "string")
      : [];
    const uniqueLearned = [...new Set(learned.map((k) => k.trim().toLowerCase()).filter(Boolean))];
    return {
      version: VERSION,
      totalCorrect: Math.max(0, Math.floor(data.totalCorrect)),
      totalWrong: Math.max(0, Math.floor(data.totalWrong)),
      learnedWordKeys: uniqueLearned,
    };
  } catch {
    return emptyStats();
  }
}

export function saveHomePracticeStats(stats: HomePracticeLifetimeStats): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // ignore quota / private mode
  }
}

/** Append one attempt (correct or incorrect) and optionally mark word as learned. */
export function recordHomePracticeAttempt(word: string, correct: boolean): HomePracticeLifetimeStats {
  const prev = loadHomePracticeStats();
  const key = wordStatsKey(word);
  const next: HomePracticeLifetimeStats = {
    ...prev,
    totalCorrect: prev.totalCorrect + (correct ? 1 : 0),
    totalWrong: prev.totalWrong + (correct ? 0 : 1),
    learnedWordKeys: [...prev.learnedWordKeys],
  };
  if (correct && key && !next.learnedWordKeys.includes(key)) {
    next.learnedWordKeys.push(key);
  }
  saveHomePracticeStats(next);
  return next;
}

export function clearHomePracticeStats(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

export function effectivenessPercent(stats: HomePracticeLifetimeStats): number {
  const n = stats.totalCorrect + stats.totalWrong;
  if (n === 0) return 0;
  return Math.round((stats.totalCorrect / n) * 100);
}
