import { NextResponse } from "next/server";
import { EXAM_1_QUESTIONS } from "@/lib/exams/exam1Data";
import { evaluateWritingResponse } from "@/lib/exams/evaluateWriting";
import type { GradedAnswer } from "@/lib/exams/examGrading";

export async function POST(req: Request) {
  let questionId = "";
  let text = "";
  let priorTaskText = "";
  let timedOut = false;

  try {
    const body = (await req.json()) as {
      questionId?: unknown;
      text?: unknown;
      priorTaskText?: unknown;
      timedOut?: unknown;
    };
    questionId = typeof body.questionId === "string" ? body.questionId : "";
    text = typeof body.text === "string" ? body.text : "";
    priorTaskText = typeof body.priorTaskText === "string" ? body.priorTaskText : "";
    timedOut = body.timedOut === true;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const question = EXAM_1_QUESTIONS.find((q) => q.id === questionId && q.type === "writing");
  if (!question) {
    return NextResponse.json({ error: "Unknown writing question" }, { status: 404 });
  }

  const trimmed = text.trim();
  if (timedOut && !trimmed) {
    const graded: GradedAnswer = {
      questionId,
      userAnswer: "(sin respuesta)",
      timedOut: true,
      correct: false,
      earnedPoints: 0,
      maxPoints: question.points,
      explanation: "Tiempo agotado sin texto enviado.",
      correctAnswerDisplay: "Rúbrica DET (evaluación automática)",
      writingEvaluation: { overallPercent: 0, criteria: [] },
    };
    return NextResponse.json({ graded });
  }

  const { evaluation, earnedPoints, explanation } = await evaluateWritingResponse({
    questionId,
    text: trimmed,
    maxPoints: question.points,
    priorTaskText: questionId === "w2" ? priorTaskText : undefined,
  });

  const graded: GradedAnswer = {
    questionId,
    userAnswer: trimmed || "(sin respuesta)",
    timedOut,
    correct: evaluation.overallPercent >= 55 ? true : evaluation.overallPercent >= 35 ? null : false,
    earnedPoints,
    maxPoints: question.points,
    explanation,
    correctAnswerDisplay: `Rúbrica · ${evaluation.overallPercent}%`,
    writingEvaluation: evaluation,
  };

  return NextResponse.json({ graded });
}
