"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ExamHtml } from "@/components/exams/ExamHtml";
import { ExamResults } from "@/components/exams/ExamResults";
import { WritingRubricFeedback } from "@/components/exams/WritingRubricFeedback";
import type { Exam1Question } from "@/lib/exams/exam1Data";
import { gradeQuestion, type GradedAnswer } from "@/lib/exams/examGrading";
import type { ExamQuestionsMeta } from "@/lib/exams/getExamQuestions";
import {
  recordExamAttempt,
  type ExamLifetimeStats,
  type QuestionResultRecord,
} from "@/lib/examStats";

type RunnerPhase = "intro" | "running" | "results";
type StepPhase = "question" | "feedback";

function formatTimer(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m > 0) return `${m}:${String(r).padStart(2, "0")}`;
  return `0:${String(r).padStart(2, "0")}`;
}

function toQuestionResults(
  questions: Exam1Question[],
  graded: GradedAnswer[],
): QuestionResultRecord[] {
  return graded.map((g) => {
    const q = questions.find((x) => x.id === g.questionId);
    return {
      questionId: g.questionId,
      sectionLabel: q?.sectionLabel ?? "",
      userAnswer: g.userAnswer,
      correct: g.correct,
      earnedPoints: g.earnedPoints,
      maxPoints: g.maxPoints,
      timedOut: g.timedOut,
      explanation: g.explanation,
      correctAnswerDisplay: g.correctAnswerDisplay,
    };
  });
}

function FeedbackBanner({ graded }: { graded: GradedAnswer }) {
  if (graded.writingEvaluation) {
    const pct = graded.writingEvaluation.overallPercent;
    if (pct >= 75) {
      return (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <span className="font-semibold">Muy bien.</span> +{graded.earnedPoints}/{graded.maxPoints}{" "}
          pts según la rúbrica ({pct}%).
        </div>
      );
    }
    if (pct >= 55) {
      return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <span className="font-semibold">Desempeño sólido.</span> +{graded.earnedPoints}/
          {graded.maxPoints} pts ({pct}%).
        </div>
      );
    }
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
        <span className="font-semibold">Hay margen de mejora.</span> +{graded.earnedPoints}/
        {graded.maxPoints} pts ({pct}%).
      </div>
    );
  }
  if (graded.correct === null) {
    return (
      <div className="rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
        <span className="font-semibold">Respuesta guardada.</span> Revisá tu texto con la rúbrica
        en los resultados finales.
      </div>
    );
  }
  if (graded.timedOut) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <span className="font-semibold">Tiempo agotado.</span>{" "}
        {graded.correct ? "Aun así acertaste." : "No se registró una respuesta válida a tiempo."}
      </div>
    );
  }
  if (graded.correct) {
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
        <span className="font-semibold">Correcta.</span> +{graded.earnedPoints} pts
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900">
      <span className="font-semibold">Incorrecta.</span>{" "}
      {graded.maxPoints > 0 ? `0 / ${graded.maxPoints} pts` : null}
    </div>
  );
}

export function ExamRunner({
  examId,
  meta,
  description,
  onStatsChange,
}: {
  examId: string;
  meta: ExamQuestionsMeta;
  description: string;
  onStatsChange?: (stats: ExamLifetimeStats) => void;
}) {
  const { questions, questionCount, maxAutoPoints } = meta;

  const [phase, setPhase] = useState<RunnerPhase>("intro");
  const [stepPhase, setStepPhase] = useState<StepPhase>("question");
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [gradedResults, setGradedResults] = useState<GradedAnswer[]>([]);
  const [currentGraded, setCurrentGraded] = useState<GradedAnswer | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);

  const [yesNo, setYesNo] = useState<"yes" | "no" | "">("");
  const [fillText, setFillText] = useState("");
  const [writingText, setWritingText] = useState("");
  const [hintVisible, setHintVisible] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [evaluatingWriting, setEvaluatingWriting] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const handleTimeoutRef = useRef<() => void>(() => {});
  const gradedRef = useRef<GradedAnswer[]>([]);
  const w1AnswerRef = useRef("");

  const question = questions[index];
  const isLast = index >= questionCount - 1;

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const resetQuestionState = useCallback(() => {
    setYesNo("");
    setFillText("");
    setWritingText("");
    setHintVisible(false);
    setSubmitted(false);
    setEvaluatingWriting(false);
    setCurrentGraded(null);
    setStepPhase("question");
  }, []);

  const showFeedback = useCallback((graded: GradedAnswer) => {
    clearTimer();
    setCurrentGraded(graded);
    gradedRef.current = [...gradedRef.current, graded];
    setGradedResults(gradedRef.current);
    setStepPhase("feedback");
  }, [clearTimer]);

  const submitWriting = useCallback(
    async (timedOut: boolean) => {
      if (!question || question.type !== "writing" || submitted) return;
      setSubmitted(true);
      clearTimer();
      setEvaluatingWriting(true);
      try {
        const res = await fetch("/api/exam-writing-eval", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            questionId: question.id,
            text: timedOut ? "" : writingText,
            priorTaskText: question.id === "w2" ? w1AnswerRef.current : "",
            timedOut,
          }),
        });
        if (!res.ok) throw new Error("eval failed");
        const json = (await res.json()) as { graded: GradedAnswer };
        if (question.id === "w1" && writingText.trim()) {
          w1AnswerRef.current = writingText.trim();
        }
        showFeedback(json.graded);
      } catch {
        showFeedback(
          gradeQuestion(question, {
            text: timedOut ? "" : writingText,
            timedOut,
          }),
        );
      } finally {
        setEvaluatingWriting(false);
      }
    },
    [question, submitted, writingText, showFeedback, clearTimer],
  );

  const submitAnswer = useCallback(
    (timedOut: boolean) => {
      if (!question || submitted) return;
      if (question.type === "writing") {
        void submitWriting(timedOut);
        return;
      }
      setSubmitted(true);

      let graded: GradedAnswer;
      if (question.type === "read_select") {
        const answer = timedOut ? "" : yesNo;
        graded = gradeQuestion(question, { yesNo: answer, timedOut: timedOut || answer === "" });
      } else {
        graded = gradeQuestion(question, {
          text: timedOut ? "" : fillText,
          timedOut,
        });
      }
      showFeedback(graded);
    },
    [question, submitted, yesNo, fillText, submitWriting, showFeedback],
  );

  handleTimeoutRef.current = () => submitAnswer(true);

  const startTimer = useCallback(
    (seconds: number) => {
      clearTimer();
      setTimeLeft(seconds);
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            clearTimer();
            handleTimeoutRef.current();
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    },
    [clearTimer],
  );

  const beginQuestion = useCallback(
    (qIndex: number) => {
      const q = questions[qIndex];
      if (!q) return;
      resetQuestionState();
      setIndex(qIndex);
      startTimer(q.timeSeconds);
    },
    [questions, resetQuestionState, startTimer],
  );

  const startExam = () => {
    const now = Date.now();
    setStartedAt(now);
    gradedRef.current = [];
    w1AnswerRef.current = "";
    setGradedResults([]);
    setPhase("running");
    beginQuestion(0);
  };

  const finishExam = useCallback(
    (allGraded: GradedAnswer[]) => {
      clearTimer();
      const finishedAt = Date.now();
      const earnedPoints = allGraded.reduce((s, g) => s + g.earnedPoints, 0);
      const scored = allGraded.filter((g) => g.maxPoints > 0);
      const correctCount = scored.filter((g) => g.correct === true).length;
      const timedOutCount = allGraded.filter((g) => g.timedOut).length;

      const next = recordExamAttempt({
        examId,
        correctCount,
        totalQuestions: questionCount,
        timedOutCount,
        startedAt: startedAt ?? finishedAt,
        finishedAt,
        earnedPoints,
        maxAutoPoints,
        questionResults: toQuestionResults(questions, allGraded),
      });
      onStatsChange?.(next);
      setPhase("results");
    },
    [clearTimer, examId, questionCount, maxAutoPoints, questions, startedAt, onStatsChange],
  );

  const continueAfterFeedback = () => {
    if (isLast) {
      finishExam(gradedRef.current);
      return;
    }
    beginQuestion(index + 1);
  };

  const retryExam = () => {
    clearTimer();
    gradedRef.current = [];
    w1AnswerRef.current = "";
    setPhase("intro");
    setIndex(0);
    setGradedResults([]);
    setStartedAt(null);
    resetQuestionState();
  };

  useEffect(() => () => clearTimer(), [clearTimer]);

  const handleYesNo = (value: "yes" | "no") => {
    if (submitted || stepPhase !== "question") return;
    setYesNo(value);
    setSubmitted(true);
    clearTimer();
    const graded = gradeQuestion(question as Extract<Exam1Question, { type: "read_select" }>, {
      yesNo: value,
      timedOut: false,
    });
    showFeedback(graded);
  };

  const timerUrgent =
    stepPhase === "question" && timeLeft <= (question?.timeSeconds ?? 0) * 0.15 && timeLeft > 0;

  if (phase === "results") {
    const earnedPoints = gradedResults.reduce((s, g) => s + g.earnedPoints, 0);
    const timedOutCount = gradedResults.filter((g) => g.timedOut).length;
    return (
      <ExamResults
        results={gradedResults}
        earnedPoints={earnedPoints}
        maxAutoPoints={maxAutoPoints}
        timedOutCount={timedOutCount}
        onRetry={retryExam}
      />
    );
  }

  return (
    <>
      {phase === "intro" ? (
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
          <p className="text-sm leading-relaxed text-neutral-700">{description}</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="text-[11px] font-semibold uppercase text-neutral-500">Preguntas</div>
              <div className="mt-1 text-lg font-semibold text-neutral-900">{questionCount}</div>
              <div className="text-xs text-neutral-600">
                Tiempo variable por ítem
              </div>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="text-[11px] font-semibold uppercase text-neutral-500">Puntos</div>
              <div className="mt-1 text-lg font-semibold text-neutral-900">
                hasta {maxAutoPoints}
              </div>
              <div className="text-xs text-neutral-600">incluye writing con rúbrica</div>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
              <div className="text-[11px] font-semibold uppercase text-neutral-500">Duración</div>
              <div className="mt-1 text-lg font-semibold text-neutral-900">
                ~{meta.estimatedMinutes} min
              </div>
              <div className="text-xs text-neutral-600">incluye writing</div>
            </div>
          </div>
          <ul className="mt-6 space-y-2 text-sm text-neutral-700">
            <li>· Read and Select: 10 s por palabra (Yes / No)</li>
            <li>· Fill the Blanks: 20–35 s; pista solo si la pedís</li>
            <li>· Writing: 5 min + 3 min (evaluación automática por rúbrica)</li>
          </ul>
          <button
            type="button"
            onClick={startExam}
            className="mt-6 rounded-xl bg-[color:var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
          >
            Comenzar examen
          </button>
        </div>
      ) : null}

      {phase === "running" && question ? (
        <div className="mt-8 rounded-2xl border border-neutral-200 bg-white overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 bg-neutral-50 px-5 py-3">
            <div>
              <div className="text-xs font-semibold text-[color:var(--brand)]">
                {question.sectionLabel}
              </div>
              <div className="text-sm font-semibold text-neutral-900">
                Pregunta{" "}
                <span className="font-mono text-neutral-600">
                  {index + 1} / {questionCount}
                </span>
              </div>
            </div>
            {stepPhase === "question" ? (
              <div
                className={[
                  "rounded-xl px-3 py-1.5 font-mono text-sm font-semibold tabular-nums",
                  timerUrgent
                    ? "bg-rose-50 text-rose-800 ring-1 ring-rose-200"
                    : "bg-white text-neutral-900 ring-1 ring-neutral-200",
                ].join(" ")}
              >
                {formatTimer(timeLeft)}
              </div>
            ) : null}
          </div>

          <div className="p-5 sm:p-8">
            {stepPhase === "question" ? (
              <>
                {question.type === "read_select" ? (
                  <div className="mx-auto max-w-lg text-center">
                    <p className="text-sm text-neutral-600">
                      ¿Es una palabra real en inglés?
                    </p>
                    <p className="mt-3 text-2xl font-semibold tracking-tight text-neutral-900">
                      {question.word}
                    </p>
                    <div className="mt-8 flex justify-center gap-3">
                      <button
                        type="button"
                        disabled={submitted}
                        onClick={() => handleYesNo("yes")}
                        className="min-w-[120px] rounded-xl border-2 border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] disabled:opacity-50"
                      >
                        Yes
                      </button>
                      <button
                        type="button"
                        disabled={submitted}
                        onClick={() => handleYesNo("no")}
                        className="min-w-[120px] rounded-xl border-2 border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-900 transition hover:border-[color:var(--brand)] hover:text-[color:var(--brand)] disabled:opacity-50"
                      >
                        No
                      </button>
                    </div>
                  </div>
                ) : null}

                {question.type === "fill_blank" ? (
                  <div className="mx-auto max-w-xl">
                    <p className="text-sm leading-relaxed text-neutral-800">{question.prompt}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <input
                        type="text"
                        value={fillText}
                        onChange={(e) => setFillText(e.target.value)}
                        disabled={submitted}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && fillText.trim()) submitAnswer(false);
                        }}
                        placeholder="Tu respuesta"
                        className="flex-1 min-w-[200px] rounded-xl border border-neutral-200 px-4 py-3 text-sm focus:border-[color:var(--brand)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/20"
                        autoComplete="off"
                        spellCheck={false}
                      />
                      <button
                        type="button"
                        onClick={() => setHintVisible(true)}
                        disabled={hintVisible}
                        className="rounded-xl border border-neutral-200 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-60"
                      >
                        Pista
                      </button>
                    </div>
                    {hintVisible ? (
                      <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-amber-800">
                          Definition
                        </div>
                        <p className="mt-1 leading-relaxed">{question.hint}</p>
                      </div>
                    ) : null}
                    <button
                      type="button"
                      disabled={submitted || !fillText.trim()}
                      onClick={() => submitAnswer(false)}
                      className="mt-4 rounded-xl bg-[color:var(--brand)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
                    >
                      Confirmar
                    </button>
                  </div>
                ) : null}

                {question.type === "writing" ? (
                  <div className="mx-auto max-w-xl">
                    <ExamHtml html={question.promptHtml} />
                    <textarea
                      value={writingText}
                      onChange={(e) => setWritingText(e.target.value)}
                      disabled={submitted}
                      rows={10}
                      placeholder="Escribí tu respuesta en inglés…"
                      className="mt-4 w-full resize-y rounded-xl border border-neutral-200 px-4 py-3 text-sm leading-relaxed focus:border-[color:var(--brand)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/20"
                      spellCheck
                    />
                    <ExamHtml html={question.rubricHtml} className="mt-4 text-xs" />
                    <button
                      type="button"
                      disabled={submitted || evaluatingWriting}
                      onClick={() => submitAnswer(false)}
                      className="mt-4 rounded-xl bg-[color:var(--brand)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
                    >
                      {evaluatingWriting ? "Evaluando con la rúbrica…" : "Enviar y continuar"}
                    </button>
                  </div>
                ) : null}
              </>
            ) : null}

            {stepPhase === "feedback" && currentGraded ? (
              <div className="mx-auto max-w-xl space-y-4">
                <FeedbackBanner graded={currentGraded} />
                <div className="text-sm text-neutral-800">
                  <span className="font-semibold text-neutral-900">Tu respuesta:</span>{" "}
                  {currentGraded.userAnswer.length > 120
                    ? `${currentGraded.userAnswer.slice(0, 120)}â€¦`
                    : currentGraded.userAnswer}
                </div>
                {currentGraded.correct !== null &&
                !currentGraded.correct &&
                !currentGraded.writingEvaluation ? (
                  <div className="text-sm text-neutral-800">
                    <span className="font-semibold text-neutral-900">Respuesta correcta:</span>{" "}
                    {currentGraded.correctAnswerDisplay}
                  </div>
                ) : null}
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-sm text-neutral-700">
                  <span className="font-semibold text-neutral-900">Por qué:</span>{" "}
                  {currentGraded.explanation}
                </div>
                {currentGraded.writingEvaluation ? (
                  <WritingRubricFeedback
                    evaluation={currentGraded.writingEvaluation}
                    earnedPoints={currentGraded.earnedPoints}
                    maxPoints={currentGraded.maxPoints}
                  />
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="flex flex-wrap justify-between gap-3 border-t border-neutral-200 px-5 py-4">
            {stepPhase === "feedback" ? (
              <button
                type="button"
                onClick={continueAfterFeedback}
                className="ml-auto rounded-xl bg-[color:var(--brand)] px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
              >
                {isLast ? "Ver resultados" : "Siguiente pregunta"}
              </button>
            ) : (
              <p className="text-xs text-neutral-500">
                {question.type === "read_select"
                  ? "Elegí Yes o No antes de que termine el tiempo."
                  : question.type === "fill_blank"
                    ? "Completá el espacio y confirmá, o usá Pista si la necesitás."
                    : "Escribí tu respuesta y enviá cuando estés listo."}
              </p>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

