"use client";

import { useState } from "react";
import { FitbBlankInput } from "@/components/fill-in-the-blanks/FitbBlankInput";
import { isAnswerCorrect } from "@/lib/fillInTheBlanks/grading";
import type { FitbWordExercise } from "@/lib/fillInTheBlanks/types";

export function FitbWordPractice({
  exercise,
  onResult,
}: {
  exercise: FitbWordExercise;
  onResult: (correct: boolean) => void;
}) {
  const [value, setValue] = useState("");
  const [feedback, setFeedback] = useState<"none" | "ok" | "bad">("none");
  const correct = feedback === "ok";

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-sky-100 bg-sky-50/80 p-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-sky-800">Recuerda</p>
        <p className="mt-1 text-sm font-semibold text-sky-950">{exercise.word}</p>
        <p className="mt-0.5 text-xs text-sky-900/80">{exercise.definition}</p>
      </div>

      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-600">
          Completa el espacio
        </p>
        <div className="mt-2 rounded-xl border border-neutral-200 bg-white p-4">
          <FitbBlankInput
            prompt={exercise.prompt}
            values={[value]}
            onChange={(_, v) => setValue(v)}
            disabled={correct}
            showResult={feedback !== "none"}
            answers={[exercise.answer]}
          />
        </div>
      </div>

      {feedback !== "none" ? (
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
              <span className="font-semibold">Correcto.</span> &quot;{exercise.answer}&quot; encaja
              en esta oración.
            </p>
          ) : (
            <p>
              <span className="font-semibold">Casi.</span> Respuesta esperada:{" "}
              <span className="font-semibold">{exercise.answer}</span>. Revisa la definición e
              inténtalo de nuevo.
            </p>
          )}
        </div>
      ) : null}

      {correct ? (
        <button
          type="button"
          onClick={() => onResult(true)}
          className="w-full rounded-xl bg-[color:var(--brand)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95"
        >
          Siguiente
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            const ok = isAnswerCorrect(value, exercise.answer);
            setFeedback(ok ? "ok" : "bad");
            if (!ok) onResult(false);
          }}
          disabled={!value.trim()}
          className="w-full rounded-xl bg-[color:var(--brand)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95 disabled:opacity-50"
        >
          Comprobar
        </button>
      )}
    </div>
  );
}
