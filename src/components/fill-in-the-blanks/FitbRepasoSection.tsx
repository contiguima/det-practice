"use client";

import { useMemo, useState } from "react";
import { Chevron } from "@/components/fill-in-the-blanks/Chevron";
import type { FitbExercise, FitbStats, FitbWordExercise } from "@/lib/fillInTheBlanks/types";

export function FitbRepasoSection({
  exercises,
  stats,
}: {
  exercises: FitbExercise[];
  stats: FitbStats;
}) {
  const learned = useMemo(() => {
    return exercises.filter(
      (e): e is FitbWordExercise =>
        e.kind === "word" && stats.results[e.id]?.correct === true,
    );
  }, [exercises, stats]);

  if (learned.length === 0) {
    return (
      <section className="space-y-3">
        <div>
          <h2 className="text-base font-semibold text-neutral-900">Repaso</h2>
          <p className="mt-0.5 text-xs text-neutral-600">
            Aquí verás las palabras que completes correctamente en Aprender.
          </p>
        </div>
        <p className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50/80 px-4 py-6 text-center text-sm text-neutral-600">
          Aún no tienes palabras aprendidas. Completa al menos un mini ejercicio en Aprender.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-base font-semibold text-neutral-900">Repaso</h2>
        <p className="mt-0.5 text-xs text-neutral-600">
          {learned.length} {learned.length === 1 ? "palabra aprendida" : "palabras aprendidas"}{" "}
          — definición y ejemplo de uso.
        </p>
      </div>

      <ul className="space-y-2">
        {learned.map((word) => (
          <RepasoWordRow key={word.id} word={word} />
        ))}
      </ul>
    </section>
  );
}

function RepasoWordRow({ word }: { word: FitbWordExercise }) {
  const [open, setOpen] = useState(false);
  const example = word.examples[0] ?? word.explanation;

  return (
    <li className="rounded-2xl border border-neutral-200 bg-white">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <Chevron open={open} />
        <span className="flex-1 text-sm font-semibold text-neutral-900">{word.word}</span>
      </button>
      {open ? (
        <div className="space-y-3 border-t border-neutral-100 px-4 pb-4 pt-3">
          <div>
            <p className="text-[11px] font-semibold uppercase text-neutral-500">Definición</p>
            <p className="mt-1 text-sm text-neutral-800">{word.definition}</p>
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase text-neutral-500">Ejemplo</p>
            <p className="mt-1 text-sm leading-relaxed text-neutral-700">{example}</p>
          </div>
          {word.examples.length > 1 ? (
            <ul className="space-y-1.5">
              {word.examples.slice(1).map((ex, i) => (
                <li key={i} className="text-xs leading-relaxed text-neutral-600">
                  {ex}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}
