import type { FitbExercise, FitbReviewExercise, FitbWordExercise } from "./types";

export type LearnUnit =
  | { type: "word"; exercise: FitbWordExercise }
  | { type: "review"; exercise: FitbReviewExercise };

export function buildLearnPath(exercises: FitbExercise[]): LearnUnit[] {
  return exercises.map((ex) =>
    ex.kind === "word" ? { type: "word", exercise: ex } : { type: "review", exercise: ex },
  );
}

export function countLearnWords(path: LearnUnit[]): number {
  return path.filter((u) => u.type === "word").length;
}
