"use client";

import { useMemo, useState } from "react";
import { FitbReviewStep } from "@/components/fill-in-the-blanks/FitbReviewStep";
import { FitbWordIntro } from "@/components/fill-in-the-blanks/FitbWordIntro";
import { FitbWordPractice } from "@/components/fill-in-the-blanks/FitbWordPractice";
import { buildLearnPath, countLearnWords, type LearnUnit } from "@/lib/fillInTheBlanks/learnPath";
import {
  getCurrentUnitIndex,
  isUnitComplete,
  loadFitbProgress,
  markUnitComplete,
  type FitbLearnProgress,
} from "@/lib/fillInTheBlanks/progress";
import { recordFitbResult } from "@/lib/fillInTheBlanks/stats";
import type { FitbExercise, FitbReviewExercise, FitbStats } from "@/lib/fillInTheBlanks/types";

type WordPhase = "intro" | "practice";

export function FitbLearnSection({
  exercises,
  stats,
  onStatsChange,
}: {
  exercises: FitbExercise[];
  stats: FitbStats;
  onStatsChange: (s: FitbStats) => void;
}) {
  const path = useMemo(() => buildLearnPath(exercises), [exercises]);
  const totalWords = useMemo(() => countLearnWords(path), [path]);

  const [progress, setProgress] = useState<FitbLearnProgress>(() => loadFitbProgress());
  const [wordPhase, setWordPhase] = useState<WordPhase>("intro");
  const [reviewAttemptKey, setReviewAttemptKey] = useState(0);
  const [retryReviewId, setRetryReviewId] = useState<string | null>(null);

  const unitIndex = getCurrentUnitIndex(path, progress);
  const current: LearnUnit | undefined = path[unitIndex];
  const wordsDone = path.slice(0, unitIndex).filter((u) => u.type === "word").length;
  const wordIndexForCurrent = current?.type === "word" ? wordsDone + 1 : wordsDone;

  const completedReviews = useMemo(
    () =>
      path.filter(
        (u): u is LearnUnit & { type: "review"; exercise: FitbReviewExercise } =>
          u.type === "review" && isUnitComplete(progress, u.exercise.id),
      ),
    [path, progress],
  );

  const retryExercise = useMemo(() => {
    if (!retryReviewId) return null;
    const unit = path.find((u) => u.type === "review" && u.exercise.id === retryReviewId);
    return unit?.type === "review" ? unit.exercise : null;
  }, [path, retryReviewId]);

  const completeUnit = (unitId: string) => {
    setProgress((p) => markUnitComplete(p, unitId));
    setWordPhase("intro");
    setReviewAttemptKey((k) => k + 1);
  };

  const saveReviewResult = (
    exerciseId: string,
    score: number,
    maxScore: number,
    timedOut: boolean,
  ) => {
    onStatsChange(
      recordFitbResult(stats, {
        exerciseId,
        correct: score === maxScore,
        attempts: 1,
        completedAt: Date.now(),
        timedOut,
        score,
        maxScore,
      }),
    );
  };

  const handleWordResult = (exerciseId: string, ok: boolean, advance: boolean) => {
    onStatsChange(
      recordFitbResult(stats, {
        exerciseId,
        correct: ok,
        attempts: 1,
        completedAt: Date.now(),
      }),
    );
    if (advance) completeUnit(exerciseId);
  };

  const handleReviewComplete = (
    exerciseId: string,
    score: number,
    maxScore: number,
    timedOut: boolean,
    advance: boolean,
  ) => {
    saveReviewResult(exerciseId, score, maxScore, timedOut);
    if (advance) completeUnit(exerciseId);
    else setRetryReviewId(null);
  };

  const bumpReviewAttempt = () => setReviewAttemptKey((k) => k + 1);

  if (path.length === 0) {
    return <p className="text-sm text-neutral-600">No hay ejercicios disponibles.</p>;
  }

  if (!current && !retryReviewId) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-center">
          <p className="text-sm font-semibold text-emerald-900">¡Completaste todo el recorrido!</p>
          <p className="mt-2 text-xs text-emerald-800">
            Usa la sección de repaso para revisar las palabras que aprendiste.
          </p>
        </div>
        <CompletedReviewsList
          reviews={completedReviews}
          stats={stats}
          onRetry={(id) => {
            setRetryReviewId(id);
            bumpReviewAttempt();
          }}
        />
      </div>
    );
  }

  const progressPct = Math.round((unitIndex / path.length) * 100);

  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Aprender</h2>
          <p className="mt-0.5 text-xs text-neutral-600">
            Palabra → mini ejercicio → siguiente. Cada 5 palabras, repaso cronometrado.
          </p>
        </div>
        <span className="text-xs font-semibold text-neutral-500">{progressPct}%</span>
      </div>

      <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
        <div
          className="h-full rounded-full bg-[color:var(--brand)] transition-all"
          style={{ width: `${progressPct}%` }}
        />
      </div>

      {retryExercise ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/40 p-4">
          <p className="mb-4 text-xs font-semibold uppercase tracking-wide text-amber-900">
            Reintentando evaluación
          </p>
          <FitbReviewStep
            key={`retry-${retryExercise.id}-${reviewAttemptKey}`}
            exercise={retryExercise}
            onComplete={(score, max, timedOut) =>
              handleReviewComplete(retryExercise.id, score, max, timedOut, false)
            }
            onRetry={bumpReviewAttempt}
            continueLabel="Volver a la lista"
          />
        </div>
      ) : null}

      {current && !retryReviewId ? (
        current.type === "word" ? (
          wordPhase === "intro" ? (
            <FitbWordIntro
              exercise={current.exercise}
              wordIndex={wordIndexForCurrent}
              totalWords={totalWords}
              onContinue={() => setWordPhase("practice")}
            />
          ) : (
            <FitbWordPractice
              exercise={current.exercise}
              onResult={(ok) => {
                if (ok) handleWordResult(current.exercise.id, true, true);
                else handleWordResult(current.exercise.id, false, false);
              }}
            />
          )
        ) : (
          <FitbReviewStep
            key={`learn-${current.exercise.id}-${reviewAttemptKey}`}
            exercise={current.exercise}
            onComplete={(score, max, timedOut) =>
              handleReviewComplete(current.exercise.id, score, max, timedOut, true)
            }
            onRetry={bumpReviewAttempt}
          />
        )
      ) : null}

      {completedReviews.length > 0 ? (
        <CompletedReviewsList
          reviews={completedReviews}
          stats={stats}
          activeRetryId={retryReviewId}
          onRetry={(id) => {
            setRetryReviewId(id);
            bumpReviewAttempt();
          }}
          onCancelRetry={() => setRetryReviewId(null)}
        />
      ) : null}
    </section>
  );
}

function CompletedReviewsList({
  reviews,
  stats,
  onRetry,
  activeRetryId,
  onCancelRetry,
}: {
  reviews: Array<LearnUnit & { type: "review"; exercise: FitbReviewExercise }>;
  stats: FitbStats;
  onRetry: (id: string) => void;
  activeRetryId?: string | null;
  onCancelRetry?: () => void;
}) {
  if (reviews.length === 0) return null;

  return (
    <div className="space-y-3 border-t border-neutral-100 pt-5">
      <div>
        <h3 className="text-sm font-semibold text-neutral-900">Evaluaciones (cada 5 palabras)</h3>
        <p className="mt-0.5 text-xs text-neutral-600">
          Puedes repetir cualquier repaso cronometrado sin perder tu progreso.
        </p>
      </div>
      <ul className="space-y-2">
        {reviews.map((unit, i) => {
          const result = stats.results[unit.exercise.id];
          const score = result?.score;
          const max = result?.maxScore ?? unit.exercise.blanks.length;
          const isActive = activeRetryId === unit.exercise.id;

          return (
            <li
              key={unit.exercise.id}
              className={[
                "flex flex-wrap items-center gap-2 rounded-xl border px-4 py-3",
                isActive
                  ? "border-amber-300 bg-amber-50/80"
                  : "border-neutral-200 bg-white",
              ].join(" ")}
            >
              <span className="text-xs font-semibold text-neutral-500">#{i + 1}</span>
              <span className="min-w-0 flex-1 text-sm font-medium text-neutral-900">
                {unit.exercise.title}
              </span>
              {score !== undefined ? (
                <span className="text-xs font-semibold text-neutral-600">
                  {score}/{max}
                </span>
              ) : null}
              {isActive && onCancelRetry ? (
                <button
                  type="button"
                  onClick={onCancelRetry}
                  className="rounded-lg px-3 py-1.5 text-xs font-semibold text-neutral-600 transition hover:bg-neutral-100"
                >
                  Cancelar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => onRetry(unit.exercise.id)}
                  disabled={!!activeRetryId && !isActive}
                  className="rounded-lg bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-800 transition hover:bg-neutral-200 disabled:opacity-40"
                >
                  Reintentar
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
