const STORAGE_KEY = "det-exam-stats-v1";
const VERSION = 1 as const;

export type QuestionResultRecord = {
  questionId: string;
  sectionLabel: string;
  userAnswer: string;
  correct: boolean | null;
  earnedPoints: number;
  maxPoints: number;
  timedOut: boolean;
  explanation: string;
  correctAnswerDisplay: string;
};

export type ExamAttemptRecord = {
  attemptId: string;
  examId: string;
  startedAt: number;
  finishedAt: number;
  correctCount: number;
  totalQuestions: number;
  timedOutCount: number;
  scorePercent: number;
  earnedPoints: number;
  maxAutoPoints: number;
  questionResults?: QuestionResultRecord[];
};

export type ExamPerExamStats = {
  attemptCount: number;
  bestScorePercent: number;
  lastScorePercent: number;
  bestEarnedPoints: number;
  lastEarnedPoints: number;
  lastAttemptAt: number | null;
  totalCorrect: number;
  totalAnswered: number;
  totalEarnedPoints: number;
  totalMaxAutoPoints: number;
};

export type ExamLifetimeStats = {
  version: typeof VERSION;
  attempts: ExamAttemptRecord[];
  byExam: Record<string, ExamPerExamStats>;
};

function emptyPerExam(): ExamPerExamStats {
  return {
    attemptCount: 0,
    bestScorePercent: 0,
    lastScorePercent: 0,
    bestEarnedPoints: 0,
    lastEarnedPoints: 0,
    lastAttemptAt: null,
    totalCorrect: 0,
    totalAnswered: 0,
    totalEarnedPoints: 0,
    totalMaxAutoPoints: 0,
  };
}

function emptyStats(): ExamLifetimeStats {
  return { version: VERSION, attempts: [], byExam: {} };
}

function normalizePerExam(raw: unknown): ExamPerExamStats {
  if (!raw || typeof raw !== "object") return emptyPerExam();
  const o = raw as Partial<ExamPerExamStats>;
  return {
    attemptCount: Math.max(0, Math.floor(Number(o.attemptCount) || 0)),
    bestScorePercent: Math.max(0, Math.min(100, Math.floor(Number(o.bestScorePercent) || 0))),
    lastScorePercent: Math.max(0, Math.min(100, Math.floor(Number(o.lastScorePercent) || 0))),
    lastAttemptAt:
      typeof o.lastAttemptAt === "number" && o.lastAttemptAt > 0 ? o.lastAttemptAt : null,
    totalCorrect: Math.max(0, Math.floor(Number(o.totalCorrect) || 0)),
    totalAnswered: Math.max(0, Math.floor(Number(o.totalAnswered) || 0)),
    bestEarnedPoints: Math.max(0, Math.floor(Number(o.bestEarnedPoints) || 0)),
    lastEarnedPoints: Math.max(0, Math.floor(Number(o.lastEarnedPoints) || 0)),
    totalEarnedPoints: Math.max(0, Math.floor(Number(o.totalEarnedPoints) || 0)),
    totalMaxAutoPoints: Math.max(0, Math.floor(Number(o.totalMaxAutoPoints) || 0)),
  };
}

export function loadExamStats(): ExamLifetimeStats {
  if (typeof window === "undefined") return emptyStats();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStats();
    const data = JSON.parse(raw) as Partial<ExamLifetimeStats>;
    if (data.version !== VERSION) return emptyStats();
    const attempts = Array.isArray(data.attempts)
      ? data.attempts.filter(
          (a): a is ExamAttemptRecord =>
            !!a &&
            typeof a === "object" &&
            typeof (a as ExamAttemptRecord).examId === "string" &&
            typeof (a as ExamAttemptRecord).scorePercent === "number",
        )
      : [];
    const byExam: Record<string, ExamPerExamStats> = {};
    if (data.byExam && typeof data.byExam === "object") {
      for (const [id, v] of Object.entries(data.byExam)) {
        byExam[id] = normalizePerExam(v);
      }
    }
    return { version: VERSION, attempts, byExam };
  } catch {
    return emptyStats();
  }
}

export function saveExamStats(stats: ExamLifetimeStats): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }
}

export function getPerExamStats(stats: ExamLifetimeStats, examId: string): ExamPerExamStats {
  return stats.byExam[examId] ?? emptyPerExam();
}

export function aggregateEffectivenessPercent(stats: ExamLifetimeStats): number {
  let earned = 0;
  let max = 0;
  for (const row of Object.values(stats.byExam)) {
    earned += row.totalEarnedPoints;
    max += row.totalMaxAutoPoints;
  }
  if (max > 0) return Math.round((earned / max) * 100);
  let correct = 0;
  let answered = 0;
  for (const row of Object.values(stats.byExam)) {
    correct += row.totalCorrect;
    answered += row.totalAnswered;
  }
  if (answered === 0) return 0;
  return Math.round((correct / answered) * 100);
}

export function getLatestEarnedPoints(stats: ExamLifetimeStats): number {
  if (stats.attempts.length === 0) return 0;
  const last = stats.attempts[stats.attempts.length - 1];
  return last?.earnedPoints ?? 0;
}

export function hasAnyExamAttempts(stats: ExamLifetimeStats): boolean {
  return stats.attempts.length > 0;
}

export type RecordAttemptInput = {
  examId: string;
  correctCount: number;
  totalQuestions: number;
  timedOutCount: number;
  startedAt: number;
  finishedAt: number;
  earnedPoints: number;
  maxAutoPoints: number;
  questionResults?: QuestionResultRecord[];
};

export function recordExamAttempt(input: RecordAttemptInput): ExamLifetimeStats {
  const prev = loadExamStats();
  const total = Math.max(0, input.totalQuestions);
  const correct = Math.max(0, Math.min(input.correctCount, total));
  const earnedPoints = Math.max(0, input.earnedPoints);
  const maxAutoPoints = Math.max(0, input.maxAutoPoints);
  const scorePercent =
    maxAutoPoints > 0
      ? Math.round((earnedPoints / maxAutoPoints) * 100)
      : total === 0
        ? 0
        : Math.round((correct / total) * 100);

  const attempt: ExamAttemptRecord = {
    attemptId: `${input.examId}-${input.finishedAt}-${Math.random().toString(36).slice(2, 8)}`,
    examId: input.examId,
    startedAt: input.startedAt,
    finishedAt: input.finishedAt,
    correctCount: correct,
    totalQuestions: total,
    timedOutCount: Math.max(0, input.timedOutCount),
    scorePercent,
    earnedPoints,
    maxAutoPoints,
    questionResults: input.questionResults,
  };

  const row = getPerExamStats(prev, input.examId);
  const nextRow: ExamPerExamStats = {
    attemptCount: row.attemptCount + 1,
    bestScorePercent: Math.max(row.bestScorePercent, scorePercent),
    lastScorePercent: scorePercent,
    bestEarnedPoints: Math.max(row.bestEarnedPoints, earnedPoints),
    lastEarnedPoints: earnedPoints,
    lastAttemptAt: input.finishedAt,
    totalCorrect: row.totalCorrect + correct,
    totalAnswered: row.totalAnswered + total,
    totalEarnedPoints: row.totalEarnedPoints + earnedPoints,
    totalMaxAutoPoints: row.totalMaxAutoPoints + maxAutoPoints,
  };

  const next: ExamLifetimeStats = {
    version: VERSION,
    attempts: [...prev.attempts, attempt],
    byExam: { ...prev.byExam, [input.examId]: nextRow },
  };
  saveExamStats(next);
  return next;
}

export function clearExamStats(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}
