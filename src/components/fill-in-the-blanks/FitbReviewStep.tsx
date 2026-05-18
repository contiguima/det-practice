"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { FitbBlankInput } from "@/components/fill-in-the-blanks/FitbBlankInput";
import { countBlanksInPrompt, isAnswerCorrect } from "@/lib/fillInTheBlanks/grading";
import type { FitbReviewExercise } from "@/lib/fillInTheBlanks/types";

function formatTimer(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function FitbReviewStep({
  exercise,
  onComplete,
}: {
  exercise: FitbReviewExercise;
  onComplete: (score: number, maxScore: number, timedOut: boolean) => void;
}) {
  const [values, setValues] = useState<string[]>(() => exercise.blanks.map(() => ""));
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(exercise.timerSeconds);
  const [finished, setFinished] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const answers = exercise.blanks.map((b) => b.answer);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const finish = useCallback(
    (timeout: boolean) => {
      clearTimer();
      setFinished(true);
      setTimedOut(timeout);
    },
    [clearTimer],
  );

  const handleContinue = () => {
    const s = exercise.blanks.filter((b, i) =>
      isAnswerCorrect(values[i] ?? "", b.answer),
    ).length;
    onComplete(s, exercise.blanks.length, timedOut);
  };

  useEffect(() => () => clearTimer(), [clearTimer]);

  const startTimer = () => {
    setStarted(true);
    setTimeLeft(exercise.timerSeconds);
    clearTimer();
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          finish(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const score = finished
    ? exercise.blanks.filter((b, i) => isAnswerCorrect(values[i] ?? "", b.answer)).length
    : 0;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
        <p className="text-sm font-semibold text-amber-950">{exercise.title}</p>
        <p className="mt-1 text-xs text-amber-900/80">{exercise.explanation}</p>
        <p className="mt-2 text-xs text-neutral-600">
          Repaso de las últimas 5 palabras. Tienes{" "}
          <span className="font-semibold">1 minuto 30 segundos</span> cuando inicies el cronómetro.
        </p>
      </div>

      {!started && !finished ? (
        <button
          type="button"
          onClick={startTimer}
          className="w-full rounded-xl bg-[color:var(--brand)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95"
        >
          Iniciar repaso cronometrado
        </button>
      ) : null}

      {started && !finished ? (
        <div
          className={[
            "inline-flex rounded-xl px-3 py-1.5 font-mono text-sm font-semibold tabular-nums",
            timeLeft <= 15
              ? "bg-rose-100 text-rose-800 ring-1 ring-rose-200"
              : "bg-white text-neutral-900 ring-1 ring-neutral-200",
          ].join(" ")}
        >
          {formatTimer(timeLeft)}
        </div>
      ) : null}

      {(() => {
        let offset = 0;
        return exercise.paragraphs.map((para, pi) => {
          const el = (
            <div key={pi} className="rounded-xl border border-neutral-200 bg-white p-4">
              <FitbBlankInput
                prompt={para}
                values={values}
                blankOffset={offset}
                onChange={(i, v) => {
                  const next = [...values];
                  next[i] = v;
                  setValues(next);
                }}
                disabled={finished}
                showResult={finished}
                answers={answers}
              />
            </div>
          );
          offset += countBlanksInPrompt(para);
          return el;
        });
      })()}

      {started && !finished ? (
        <button
          type="button"
          onClick={() => finish(false)}
          className="w-full rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
        >
          Enviar antes de tiempo
        </button>
      ) : null}

      {finished ? (
        <div className="space-y-3">
          <div
            className={[
              "rounded-xl p-3 text-sm",
              timedOut
                ? "border border-amber-200 bg-amber-50 text-amber-900"
                : score === exercise.blanks.length
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border border-rose-100 bg-rose-50 text-rose-900",
            ].join(" ")}
          >
            {timedOut ? (
              <p>
                <span className="font-semibold">Se acabó el tiempo.</span> Obtuviste {score}/
                {exercise.blanks.length} espacios correctos.
              </p>
            ) : (
              <p>
                <span className="font-semibold">Enviado.</span> Obtuviste {score}/
                {exercise.blanks.length} espacios correctos.
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={handleContinue}
            className="w-full rounded-xl bg-[color:var(--brand)] px-4 py-3 text-sm font-semibold text-white transition hover:opacity-95"
          >
            Continuar
          </button>
        </div>
      ) : null}
    </div>
  );
}
