export type CefrLevel = "B1" | "B2";

export type FitbWordExercise = {
  id: string;
  kind: "word";
  level: CefrLevel;
  word: string;
  definition: string;
  explanation: string;
  /** Three example sentences in English. */
  examples: string[];
  prompt: string;
  answer: string;
};

export type FitbReviewExercise = {
  id: string;
  kind: "review";
  level: CefrLevel;
  title: string;
  /** Words covered in this review (for stats grouping). */
  relatedWords: string[];
  paragraphs: string[];
  blanks: Array<{
    id: string;
    answer: string;
    /** Short English hint shown after check. */
    explanation: string;
  }>;
  timerSeconds: number;
  /** Overall passage explanation in English. */
  explanation: string;
};

export type FitbExercise = FitbWordExercise | FitbReviewExercise;

export type FitbExerciseResult = {
  exerciseId: string;
  correct: boolean;
  attempts: number;
  completedAt: number;
  timedOut?: boolean;
  score?: number;
  maxScore?: number;
};

export type FitbStats = {
  version: 1;
  results: Record<string, FitbExerciseResult>;
};
