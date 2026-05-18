"use client";

import type { FitbWordExercise } from "@/lib/fillInTheBlanks/types";

export function FitbWordIntro({
  exercise,
  wordIndex,
  totalWords,
  onContinue,
}: {
  exercise: FitbWordExercise;
  wordIndex: number;
  totalWords: number;
  onContinue: () => void;
}) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
          Palabra {wordIndex} de {totalWords}
        </span>
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm">
        <div className="text-3xl font-semibold tracking-tight text-neutral-900">
          {exercise.word}
        </div>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600">{exercise.definition}</p>
      </div>

      <div className="space-y-3">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
          Ejemplos de uso
        </div>
        <ul className="space-y-2">
          {exercise.examples.map((sentence, i) => (
            <li
              key={i}
              className="rounded-xl border border-neutral-100 bg-neutral-50/80 px-4 py-3 text-sm leading-relaxed text-neutral-800"
            >
              {sentence}
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="w-full rounded-xl bg-[color:var(--brand)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95"
      >
        Practicar con un ejercicio
      </button>
    </div>
  );
}
