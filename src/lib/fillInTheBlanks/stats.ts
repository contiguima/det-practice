import type { FitbExercise, FitbStats } from "@/lib/fillInTheBlanks/types";

const STORAGE_KEY = "det-fill-in-the-blanks-stats-v1";

function emptyStats(): FitbStats {
  return { version: 1, results: {} };
}

export function loadFitbStats(): FitbStats {
  if (typeof window === "undefined") return emptyStats();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStats();
    const data = JSON.parse(raw) as Partial<FitbStats>;
    if (data.version !== 1 || !data.results) return emptyStats();
    return { version: 1, results: data.results };
  } catch {
    return emptyStats();
  }
}

export function saveFitbStats(stats: FitbStats): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function recordFitbResult(
  stats: FitbStats,
  result: FitbStats["results"][string],
): FitbStats {
  const prev = stats.results[result.exerciseId];
  const next: FitbStats = {
    version: 1,
    results: {
      ...stats.results,
      [result.exerciseId]: {
        ...result,
        attempts: (prev?.attempts ?? 0) + 1,
      },
    },
  };
  saveFitbStats(next);
  return next;
}

export function aggregateFitbStats(exercises: FitbExercise[], stats: FitbStats) {
  const words = exercises.filter((e) => e.kind === "word");
  const reviews = exercises.filter((e) => e.kind === "review");
  const wordDone = words.filter((e) => stats.results[e.id]?.correct).length;
  const reviewDone = reviews.filter((e) => stats.results[e.id]?.completedAt).length;
  let attempts = 0;
  let correct = 0;
  for (const r of Object.values(stats.results)) {
    attempts += r.attempts;
    if (r.correct) correct += 1;
  }
  const effectiveness = attempts > 0 ? Math.round((correct / attempts) * 100) : 0;
  return {
    totalWords: words.length,
    totalReviews: reviews.length,
    wordsCompleted: wordDone,
    reviewsCompleted: reviewDone,
    effectiveness,
    attempts,
  };
}
