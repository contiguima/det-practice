import type { Exam1Question } from "@/lib/exams/exam1Data";
import type { WritingEvaluation } from "@/lib/exams/evaluateWriting";

export type { WritingEvaluation, WritingCriterionScore } from "@/lib/exams/evaluateWriting";

export type GradedAnswer = {
  questionId: string;
  userAnswer: string;
  timedOut: boolean;
  correct: boolean | null;
  earnedPoints: number;
  maxPoints: number;
  explanation: string;
  correctAnswerDisplay: string;
  writingEvaluation?: WritingEvaluation;
};

function normalizeFill(s: string) {
  return s.trim().replace(/\s+/g, " ");
}

export function gradeReadSelect(
  q: Extract<Exam1Question, { type: "read_select" }>,
  answer: "yes" | "no" | "",
): GradedAnswer {
  const userAnswer = answer;
  const correct = answer !== "" && answer === q.correctAnswer;
  return {
    questionId: q.id,
    userAnswer: userAnswer || "(sin respuesta)",
    timedOut: answer === "",
    correct,
    earnedPoints: correct ? q.points : 0,
    maxPoints: q.points,
    explanation: q.explanation,
    correctAnswerDisplay: q.correctAnswer === "yes" ? "Yes" : "No",
  };
}

export function gradeFillBlank(
  q: Extract<Exam1Question, { type: "fill_blank" }>,
  raw: string,
  timedOut: boolean,
): GradedAnswer {
  const userAnswer = raw.trim() || "(sin respuesta)";
  let correct = false;
  if (raw.trim()) {
    if (q.requireCapitalized) {
      const expected = q.correctAnswer.trim();
      correct =
        raw.trim() === expected ||
        raw.trim().toLowerCase() === expected.toLowerCase();
    } else {
      correct = normalizeFill(raw).toLowerCase() === q.correctAnswer.toLowerCase();
    }
  }
  return {
    questionId: q.id,
    userAnswer,
    timedOut,
    correct,
    earnedPoints: correct ? q.points : 0,
    maxPoints: q.points,
    explanation: q.explanation,
    correctAnswerDisplay: q.correctAnswer,
  };
}

export function gradeWriting(
  q: Extract<Exam1Question, { type: "writing" }>,
  text: string,
  timedOut: boolean,
): GradedAnswer {
  const trimmed = text.trim();
  return {
    questionId: q.id,
    userAnswer: trimmed || "(sin respuesta)",
    timedOut,
    correct: null,
    earnedPoints: 0,
    maxPoints: 0,
    explanation: q.explanation,
    correctAnswerDisplay: "Respuesta abierta (revisión con rúbrica)",
  };
}

export function gradeQuestion(
  q: Exam1Question,
  payload: { yesNo?: "yes" | "no" | ""; text?: string; timedOut: boolean },
): GradedAnswer {
  if (q.type === "read_select") {
    return gradeReadSelect(q, payload.yesNo ?? "");
  }
  if (q.type === "fill_blank") {
    return gradeFillBlank(q, payload.text ?? "", payload.timedOut);
  }
  return gradeWriting(q, payload.text ?? "", payload.timedOut);
}
