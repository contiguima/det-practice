"use client";

import Link from "next/link";
import { CefrLevelScale } from "@/components/home/CefrLevelScale";
import {
  computeCefrLevelFromPoints,
  computeEffectivenessFromPoints,
  levelBandLabel,
} from "@/lib/examLevel";
import type { GradedAnswer } from "@/lib/exams/examGrading";
import { WritingRubricFeedback } from "@/components/exams/WritingRubricFeedback";
import { EXAM_1_MAX_LEVEL_POINTS } from "@/lib/exams/exam1Data";

function Pill({ tone, children }: { tone: "ok" | "bad" | "neutral"; children: React.ReactNode }) {
  const cls =
    tone === "ok"
      ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200"
      : tone === "bad"
        ? "bg-rose-50 text-rose-800 ring-1 ring-rose-200"
        : "bg-neutral-100 text-neutral-700 ring-1 ring-neutral-200";
  return (
    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${cls}`}>
      {children}
    </span>
  );
}

export function ExamResults({
  results,
  earnedPoints,
  maxAutoPoints,
  timedOutCount,
  onRetry,
}: {
  results: GradedAnswer[];
  earnedPoints: number;
  maxAutoPoints: number;
  timedOutCount: number;
  onRetry: () => void;
}) {
  const effectiveness = computeEffectivenessFromPoints(earnedPoints, maxAutoPoints);
  const level = computeCefrLevelFromPoints(earnedPoints, true);
  const scored = results.filter((r) => r.maxPoints > 0);
  const correctCount = scored.filter((r) => r.correct === true).length;

  return (
    <div className="mt-8 space-y-6">
      <section className="rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
        <div className="text-sm font-semibold text-neutral-900">Resultados del intento</div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl bg-neutral-50 p-4">
            <div className="text-[11px] font-semibold uppercase text-neutral-500">Puntos</div>
            <div className="mt-1 text-3xl font-semibold text-neutral-900">
              {earnedPoints}
              <span className="text-lg text-neutral-500"> / {maxAutoPoints}</span>
            </div>
          </div>
          <div className="rounded-xl bg-neutral-50 p-4">
            <div className="text-[11px] font-semibold uppercase text-neutral-500">
              Efectividad
            </div>
            <div className="mt-1 text-3xl font-semibold text-neutral-900">{effectiveness}%</div>
          </div>
          <div className="rounded-xl bg-neutral-50 p-4">
            <div className="text-[11px] font-semibold uppercase text-neutral-500">Nivel</div>
            <div className="mt-1 text-3xl font-semibold text-[color:var(--brand)]">{level}</div>
            <p className="mt-1 text-xs text-neutral-600">{levelBandLabel(earnedPoints)}</p>
          </div>
          <div className="rounded-xl bg-neutral-50 p-4">
            <div className="text-[11px] font-semibold uppercase text-neutral-500">Aciertos</div>
            <div className="mt-1 text-3xl font-semibold text-neutral-900">
              {correctCount}/{scored.length}
            </div>
            {timedOutCount > 0 ? (
              <p className="mt-1 text-xs text-rose-700">{timedOutCount} sin tiempo</p>
            ) : null}
          </div>
        </div>
        <div className="mt-5">
          <CefrLevelScale activeLevel={level} />
        </div>
        <p className="mt-3 text-xs text-neutral-600">
          Escala de referencia: 0–40 pts (A1–A2) · 41–125 pts (B1–B2) · 126–
          {EXAM_1_MAX_LEVEL_POINTS} pts (C1). Writing se evalúa automáticamente con la rúbrica DET.
        </p>
      </section>

      <section>
        <div className="text-sm font-semibold text-neutral-900">Revisión pregunta por pregunta</div>
        <div className="mt-4 space-y-3">
          {results.map((r, i) => {
            const tone = r.writingEvaluation
              ? r.writingEvaluation.overallPercent >= 55
                ? "ok"
                : ("bad" as const)
              : r.correct === null
                ? "neutral"
                : r.correct
                  ? "ok"
                  : ("bad" as const);
            const label = r.writingEvaluation
              ? r.writingEvaluation.overallPercent >= 75
                ? "Excelente"
                : r.writingEvaluation.overallPercent >= 55
                  ? "Sólida"
                  : "En progreso"
              : r.correct === null
                ? "Guardada"
                : r.correct
                  ? "Correcta"
                  : r.timedOut
                    ? "Tiempo agotado"
                    : "Incorrecta";
            return (
              <div
                key={r.questionId}
                className="rounded-2xl border border-neutral-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-neutral-500">
                    Pregunta {i + 1}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    {r.maxPoints > 0 ? (
                      <span className="text-xs font-semibold text-neutral-600">
                        {r.earnedPoints}/{r.maxPoints} pts
                      </span>
                    ) : null}
                    <Pill tone={tone}>{label}</Pill>
                  </div>
                </div>
                <div className="mt-2 text-sm text-neutral-800">
                  <span className="font-semibold text-neutral-900">Tu respuesta:</span>{" "}
                  {r.userAnswer.length > 200 ? `${r.userAnswer.slice(0, 200)}…` : r.userAnswer}
                </div>
                {r.correct !== null && !r.writingEvaluation ? (
                  <div className="mt-2 text-sm text-neutral-800">
                    <span className="font-semibold text-neutral-900">Respuesta correcta:</span>{" "}
                    {r.correctAnswerDisplay}
                  </div>
                ) : null}
                {r.writingEvaluation ? (
                  <div className="mt-3">
                    <WritingRubricFeedback
                      evaluation={r.writingEvaluation}
                      earnedPoints={r.earnedPoints}
                      maxPoints={r.maxPoints}
                    />
                  </div>
                ) : null}
                <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700">
                  <span className="font-semibold text-neutral-900">Por qué:</span> {r.explanation}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onRetry}
          className="rounded-xl bg-[color:var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
        >
          Repetir examen
        </button>
        <Link
          href="/tests"
          className="rounded-xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
        >
          Volver a Test
        </Link>
      </div>
    </div>
  );
}

