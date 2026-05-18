"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Chevron } from "@/components/fill-in-the-blanks/Chevron";
import { FitbBlankInput } from "@/components/fill-in-the-blanks/FitbBlankInput";
import { countBlanksInPrompt, isAnswerCorrect } from "@/lib/fillInTheBlanks/grading";
import { recordFitbResult } from "@/lib/fillInTheBlanks/stats";
import type { FitbReviewExercise, FitbStats } from "@/lib/fillInTheBlanks/types";

function formatTimer(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${String(r).padStart(2, "0")}`;
}

export function FitbReviewCard({
  exercise,
  index,
  stats,
  onStatsChange,
}: {
  exercise: FitbReviewExercise;
  index: number;
  stats: FitbStats;
  onStatsChange: (s: FitbStats) => void;
}) {
  const saved = stats.results[exercise.id];
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState<string[]>(() => exercise.blanks.map(() => ""));
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(exercise.timerSeconds);
  const [finished, setFinished] = useState(!!saved?.completedAt);
  const [timedOut, setTimedOut] = useState(!!saved?.timedOut);
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
      const score = exercise.blanks.filter((b, i) =>
        isAnswerCorrect(values[i] ?? "", b.answer),
      ).length;
      onStatsChange(
        recordFitbResult(stats, {
          exerciseId: exercise.id,
          correct: score === exercise.blanks.length,
          attempts: 1,
          completedAt: Date.now(),
          timedOut: timeout,
          score,
          maxScore: exercise.blanks.length,
        }),
      );
    },
    [clearTimer, exercise, onStatsChange, stats, values],
  );

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

  const score =
    saved?.score ??
    (finished
      ? exercise.blanks.filter((b, i) => isAnswerCorrect(values[i] ?? "", b.answer)).length
      : 0);

  return (
    <details
      open={open}
      onToggle={(e) => setOpen((e.target as HTMLDetailsElement).open)}
      className="group rounded-2xl border border-amber-200/80 bg-amber-50/30"
    >
      <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
        <Chevron open={open} />
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-amber-800">Review #{index}</span>
          <span className="text-sm font-semibold text-neutral-900">{exercise.title}</span>
          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-amber-900">
            {exercise.level} · 1:30
          </span>
          {saved?.completedAt ? (
            <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-neutral-700">
              {saved.score}/{saved.maxScore} blanks
            </span>
          ) : null}
        </div>
      </summary>

      <div className="space-y-4 border-t border-amber-100 px-4 pb-5 pt-4">
        <p className="text-sm text-neutral-700">{exercise.explanation}</p>
        <p className="text-xs text-neutral-600">
          Complete all blanks in the passage below. You have{" "}
          <span className="font-semibold">1 minute 30 seconds</span> once you start the timer.
        </p>

        {!started && !finished ? (
          <button
            type="button"
            onClick={startTimer}
            className="rounded-xl bg-[color:var(--brand)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
          >
            Start timed review
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
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2.5 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
          >
            Submit early
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
                  <span className="font-semibold">Time is up.</span> You scored {score}/
                  {exercise.blanks.length} blanks.
                </p>
              ) : (
                <p>
                  <span className="font-semibold">Submitted.</span> You scored {score}/
                  {exercise.blanks.length} blanks.
                </p>
              )}
            </div>
            <div className="space-y-2">
              {exercise.blanks.map((b, i) => (
                <p key={b.id} className="text-xs text-neutral-700">
                  <span className="font-semibold">Blank {i + 1}:</span> {b.explanation}
                </p>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </details>
  );
}
