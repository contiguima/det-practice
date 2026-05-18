"use client";

import { useMemo, useState } from "react";
import { FitbReviewStep } from "@/components/fill-in-the-blanks/FitbReviewStep";
import { FitbWordIntro } from "@/components/fill-in-the-blanks/FitbWordIntro";
import { FitbWordPractice } from "@/components/fill-in-the-blanks/FitbWordPractice";
import { buildLearnPath, countLearnWords, type LearnUnit } from "@/lib/fillInTheBlanks/learnPath";
import {
  getCurrentUnitIndex,
  loadFitbProgress,
  markUnitComplete,
  type FitbLearnProgress,
} from "@/lib/fillInTheBlanks/progress";
import { recordFitbResult } from "@/lib/fillInTheBlanks/stats";
import type { FitbExercise, FitbStats } from "@/lib/fillInTheBlanks/types";

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

  const unitIndex = getCurrentUnitIndex(path, progress);
  const current: LearnUnit | undefined = path[unitIndex];
  const wordsDone = path
    .slice(0, unitIndex)
    .filter((u) => u.type === "word").length;

  const wordIndexForCurrent =
    current?.type === "word" ? wordsDone + 1 : wordsDone;

  const completeUnit = (unitId: string) => {
    setProgress((p) => markUnitComplete(p, unitId));
    setWordPhase("intro");
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
    completeUnit(exerciseId);
  };

  if (path.length === 0) {
    return <p className="text-sm text-neutral-600">No hay ejercicios disponibles.</p>;
  }

  if (!current) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-center">
        <p className="text-sm font-semibold text-emerald-900">¡Completaste todo el recorrido!</p>
        <p className="mt-2 text-xs text-emerald-800">
          Usa la sección de repaso para revisar las palabras que aprendiste.
        </p>
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

      {current.type === "word" ? (
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
          exercise={current.exercise}
          onComplete={(score, max, timedOut) =>
            handleReviewComplete(current.exercise.id, score, max, timedOut)
          }
        />
      )}
    </section>
  );
}
