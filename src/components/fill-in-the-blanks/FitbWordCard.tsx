"use client";

import { useState } from "react";
import { Chevron } from "@/components/fill-in-the-blanks/Chevron";
import { FitbBlankInput } from "@/components/fill-in-the-blanks/FitbBlankInput";
import { isAnswerCorrect } from "@/lib/fillInTheBlanks/grading";
import type { FitbWordExercise } from "@/lib/fillInTheBlanks/types";
import type { FitbStats } from "@/lib/fillInTheBlanks/types";
import { recordFitbResult } from "@/lib/fillInTheBlanks/stats";

export function FitbWordCard({
  exercise,
  index,
  stats,
  onStatsChange,
}: {
  exercise: FitbWordExercise;
  index: number;
  stats: FitbStats;
  onStatsChange: (s: FitbStats) => void;
}) {
  const saved = stats.results[exercise.id];
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(!!saved?.correct);

  const correct = saved?.correct ?? (checked && isAnswerCorrect(value, exercise.answer));

  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="group rounded-2xl border border-neutral-200 bg-white"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
        <Chevron open={open} />
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-neutral-500">#{index}</span>
          <span className="text-sm font-semibold text-neutral-900">{exercise.word}</span>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-neutral-600">
            {exercise.level}
          </span>
          {saved?.correct ? (
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-800">
              Done
            </span>
          ) : null}
        </div>
      </summary>

      <div className="space-y-4 border-t border-neutral-100 px-4 pb-5 pt-4">
        <div className="rounded-xl border border-sky-100 bg-sky-50/80 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-sky-800">
            Definition
          </div>
          <p className="mt-1 text-sm text-sky-950">{exercise.definition}</p>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-3">
          <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-600">
            Context
          </div>
          <p className="mt-1 text-sm text-neutral-700">{exercise.explanation}</p>
        </div>

        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-600">
            Fill the blank
          </div>
          <div className="mt-2">
            <FitbBlankInput
              prompt={exercise.prompt}
              values={[value]}
              onChange={(_, v) => setValue(v)}
              disabled={checked && correct}
              showResult={checked}
              answers={[exercise.answer]}
            />
          </div>
        </div>

        {checked ? (
          <div
            className={[
              "rounded-xl p-3 text-sm",
              correct
                ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                : "border border-rose-200 bg-rose-50 text-rose-900",
            ].join(" ")}
          >
            {correct ? (
              <p>
                <span className="font-semibold">Correct.</span> &quot;{exercise.answer}&quot; fits
                this sentence naturally.
              </p>
            ) : (
              <p>
                <span className="font-semibold">Not quite.</span> Expected:{" "}
                <span className="font-semibold">{exercise.answer}</span>. Review the definition and
                try again.
              </p>
            )}
          </div>
        ) : null}

        {!checked || !correct ? (
          <button
            type="button"
            onClick={() => {
              const ok = isAnswerCorrect(value, exercise.answer);
              setChecked(true);
              onStatsChange(
                recordFitbResult(stats, {
                  exerciseId: exercise.id,
                  correct: ok,
                  attempts: 1,
                  completedAt: Date.now(),
                }),
              );
            }}
            disabled={!value.trim()}
            className="rounded-xl bg-[color:var(--brand)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
          >
            Check answer
          </button>
        ) : null}
      </div>
    </details>
  );
}
