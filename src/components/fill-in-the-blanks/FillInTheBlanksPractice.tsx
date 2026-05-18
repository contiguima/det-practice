"use client";

import { useEffect, useMemo, useState } from "react";
import { FitbLearnSection } from "@/components/fill-in-the-blanks/FitbLearnSection";
import { FitbRepasoSection } from "@/components/fill-in-the-blanks/FitbRepasoSection";
import { aggregateFitbStats, loadFitbStats } from "@/lib/fillInTheBlanks/stats";
import type { FitbExercise, FitbStats } from "@/lib/fillInTheBlanks/types";

export function FillInTheBlanksPractice() {
  const [exercises, setExercises] = useState<FitbExercise[]>([]);
  const [stats, setStats] = useState<FitbStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setStats(loadFitbStats());
    fetch("/api/fill-in-the-blanks-bank", { cache: "no-store" })
      .then((r) => r.json())
      .then((j: { exercises?: FitbExercise[] }) => setExercises(j.exercises ?? []))
      .finally(() => setLoading(false));
  }, []);

  const metrics = useMemo(
    () => (stats ? aggregateFitbStats(exercises, stats) : null),
    [exercises, stats],
  );

  if (loading) {
    return <p className="text-sm text-neutral-600">Cargando ejercicios…</p>;
  }

  return (
    <div className="space-y-8">
      {metrics ? (
        <section className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-5">
          <p className="text-sm font-semibold text-neutral-900">Tu progreso</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl bg-white p-3 ring-1 ring-neutral-200">
              <div className="text-[11px] font-semibold uppercase text-neutral-500">Palabras</div>
              <div className="mt-1 text-2xl font-semibold text-neutral-900">
                {metrics.wordsCompleted}/{metrics.totalWords}
              </div>
            </div>
            <div className="rounded-xl bg-white p-3 ring-1 ring-neutral-200">
              <div className="text-[11px] font-semibold uppercase text-neutral-500">Repasos</div>
              <div className="mt-1 text-2xl font-semibold text-neutral-900">
                {metrics.reviewsCompleted}/{metrics.totalReviews}
              </div>
            </div>
            <div className="rounded-xl bg-white p-3 ring-1 ring-neutral-200">
              <div className="text-[11px] font-semibold uppercase text-neutral-500">
                Efectividad
              </div>
              <div className="mt-1 text-2xl font-semibold text-[color:var(--brand)]">
                {metrics.effectiveness}%
              </div>
            </div>
            <div className="rounded-xl bg-white p-3 ring-1 ring-neutral-200">
              <div className="text-[11px] font-semibold uppercase text-neutral-500">
                Intentos
              </div>
              <div className="mt-1 text-2xl font-semibold text-neutral-900">
                {metrics.attempts}
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-neutral-600">
            El progreso se guarda en este dispositivo. Los mini ejercicios no tienen tiempo; los
            repasos cada 5 palabras duran 1:30.
          </p>
        </section>
      ) : null}

      <FitbLearnSection
        exercises={exercises}
        stats={stats ?? { version: 1, results: {} }}
        onStatsChange={setStats}
      />

      <FitbRepasoSection exercises={exercises} stats={stats ?? { version: 1, results: {} }} />
    </div>
  );
}
