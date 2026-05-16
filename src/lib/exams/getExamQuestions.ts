import { EXAM_1_MAX_AUTO_POINTS, EXAM_1_MAX_LEVEL_POINTS, EXAM_1_QUESTIONS } from "@/lib/exams/exam1Data";
import type { Exam1Question } from "@/lib/exams/exam1Data";

export type ExamQuestionsMeta = {
  questions: Exam1Question[];
  questionCount: number;
  maxAutoPoints: number;
  maxLevelPoints: number;
  estimatedMinutes: number;
};

export function getExamQuestions(examId: string): ExamQuestionsMeta | null {
  if (examId !== "exam-1") return null;
  const totalSeconds = EXAM_1_QUESTIONS.reduce((s, q) => s + q.timeSeconds, 0);
  return {
    questions: EXAM_1_QUESTIONS,
    questionCount: EXAM_1_QUESTIONS.length,
    maxAutoPoints: EXAM_1_MAX_AUTO_POINTS,
    maxLevelPoints: EXAM_1_MAX_LEVEL_POINTS,
    estimatedMinutes: Math.ceil(totalSeconds / 60),
  };
}
