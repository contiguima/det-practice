"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { HomePracticeWord } from "@/lib/homePracticeBank";
import { shuffleInPlace } from "@/lib/homePracticeBank";
import {
  effectivenessPercent,
  loadHomePracticeStats,
  recordHomePracticeAttempt,
  clearHomePracticeStats,
  type HomePracticeLifetimeStats,
} from "@/lib/homePracticeStats";

type Answer = "yes" | "no";
type Phase = "question" | "result" | "summary" | "done";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <path
        d="M20 7.5 10.2 17.3 4 11.1"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
      <path
        d="M7 7l10 10M17 7 7 17"
        stroke="currentColor"
        strokeWidth="2.1"
        strokeLinecap="round"
      />
    </svg>
  );
}

function formatTimer(seconds: number) {
  const s = Math.max(0, seconds);
  return `0:${String(s).padStart(2, "0")}`;
}

export default function HomePracticePage() {
  const [deck, setDeck] = useState<HomePracticeWord[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [statsHydrated, setStatsHydrated] = useState(false);
  const [lifetimeStats, setLifetimeStats] = useState<HomePracticeLifetimeStats | null>(
    null,
  );
  const [sessionStarted, setSessionStarted] = useState(false);

  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("question");
  const [timeLeft, setTimeLeft] = useState(5);
  const [result, setResult] = useState<{
    correct: boolean;
    timedOut: boolean;
  } | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [wrongCount, setWrongCount] = useState(0);

  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    setLifetimeStats(loadHomePracticeStats());
    setStatsHydrated(true);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/home-practice-bank", { cache: "no-store" });
        const json = (await res.json()) as { words?: HomePracticeWord[] };
        if (cancelled) return;
        const words = Array.isArray(json.words) ? json.words : [];
        if (words.length === 0) {
          setLoadError("Word bank not found.");
          setDeck([]);
          return;
        }
        const shuffled = [...words];
        shuffleInPlace(shuffled);
        setDeck(shuffled);
        setLoadError(null);
      } catch {
        if (!cancelled) setLoadError("Could not load words.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const persistAttempt = useCallback((word: string, correct: boolean) => {
    const next = recordHomePracticeAttempt(word, correct);
    setLifetimeStats(next);
  }, []);

  const item = deck[index] ?? null;

  const expectedIsYes = useMemo(() => {
    if (!item) return false;
    return item.isReal;
  }, [item]);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startSession = () => {
    setSessionStarted(true);
    setIndex(0);
    setPhase("question");
    setResult(null);
    setCorrectCount(0);
    setWrongCount(0);
    setTimeLeft(5);
  };

  useEffect(() => {
    clearTimer();
    if (!sessionStarted) return;
    if (phase !== "question") return;
    if (!item) return;

    setTimeLeft(5);
    const start = Date.now();
    const wordAtStart = item.word;
    timerRef.current = window.setInterval(() => {
      const elapsed = Math.floor((Date.now() - start) / 1000);
      const left = 5 - elapsed;
      setTimeLeft(left);
      if (left <= 0) {
        clearTimer();
        setResult({ correct: false, timedOut: true });
        setWrongCount((w) => w + 1);
        persistAttempt(wordAtStart, false);
        setPhase("result");
      }
    }, 150);

    return () => clearTimer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, index, item?.word, sessionStarted]);

  const onPick = (a: Answer) => {
    if (phase !== "question") return;
    if (!item) return;

    clearTimer();

    const pickedYes = a === "yes";
    const isCorrect = pickedYes === expectedIsYes;

    setResult({ correct: isCorrect, timedOut: false });
    if (isCorrect) setCorrectCount((c) => c + 1);
    else setWrongCount((w) => w + 1);
    persistAttempt(item.word, isCorrect);
    setPhase("result");
  };

  const goNext = () => {
    const nextIndex = index + 1;
    const isEnd = nextIndex >= deck.length;

    if (!isEnd && nextIndex % 10 === 0) {
      setPhase("summary");
      return;
    }

    if (isEnd) {
      setPhase("done");
      return;
    }

    setIndex(nextIndex);
    setResult(null);
    setPhase("question");
  };

  const continueAfterSummary = (shouldContinue: boolean) => {
    if (!shouldContinue) {
      setPhase("done");
      return;
    }
    setIndex((i) => i + 1);
    setResult(null);
    setPhase("question");
  };

  const lifetime = lifetimeStats ?? loadHomePracticeStats();
  const lifetimePct = effectivenessPercent(lifetime);
  const learnedCount = lifetime.learnedWordKeys.length;

  const wordBlock = (
    <div className="text-center">
      <div className="text-base font-semibold text-neutral-900">
        Is this a real English word?
      </div>
      <div className="mt-8 text-5xl font-medium tracking-tight text-neutral-900 sm:text-6xl">
        {item?.word ?? "—"}
      </div>
    </div>
  );

  if (loadError) {
    return (
      <div className="min-h-dvh bg-white p-4 sm:p-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-rose-200 bg-rose-50 p-6 text-sm text-rose-900">
          {loadError}
        </div>
      </div>
    );
  }

  if (!statsHydrated || deck.length === 0) {
    return (
      <div className="min-h-dvh bg-white p-4 sm:p-8">
        <div className="mx-auto max-w-4xl rounded-2xl border border-neutral-200 bg-white p-6 text-sm text-neutral-700">
          Cargando…
        </div>
      </div>
    );
  }

  const showIntro = !sessionStarted;

  return (
    <div className="min-h-dvh bg-white p-4 sm:p-8">
      <div className="mx-auto max-w-4xl rounded-2xl border border-neutral-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-neutral-200 px-4 py-3 sm:px-5 sm:py-4">
          <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
            {sessionStarted ? (
              <>
                <span className="inline-flex h-9 max-w-full items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 text-sm font-semibold text-neutral-700">
                  <span className="inline-flex h-2 w-2 shrink-0 rounded-full bg-[color:var(--brand)]" />
                  <span className="tabular-nums">
                    {formatTimer(phase === "question" ? timeLeft : 0)}
                  </span>
                  <span className="hidden font-normal text-neutral-500 sm:inline">
                    para esta pregunta
                  </span>
                </span>
                <span className="inline-flex h-9 items-center rounded-xl border border-neutral-200 bg-neutral-50 px-3 text-xs font-semibold text-neutral-700 sm:text-sm">
                  <span className="text-neutral-500">Palabras (sesión):</span>
                  <span className="ml-1.5 tabular-nums text-neutral-900">{deck.length}</span>
                </span>
              </>
            ) : (
              <span className="text-sm font-semibold text-neutral-800">
                Práctica en casa
              </span>
            )}
          </div>
          <Link
            href="/reading/read-and-select"
            className="shrink-0 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
            aria-label="Cerrar"
          >
            ×
          </Link>
        </div>

        <div className="px-5 py-10 sm:px-10 sm:py-14">
          {showIntro ? (
            <div className="mx-auto max-w-xl">
              <div className="text-center">
                <div className="text-xl font-semibold text-neutral-900">
                  Tus estadísticas
                </div>
                <div className="mt-2 text-sm text-neutral-600">
                  Se guardan en este navegador (localStorage). “Aprendidas” = palabras
                  que respondiste bien al menos una vez.
                </div>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="text-sm font-semibold text-emerald-900">
                    Palabras aprendidas
                  </div>
                  <div className="mt-2 text-3xl font-semibold tabular-nums text-emerald-900">
                    {learnedCount}
                  </div>
                </div>
                <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-5">
                  <div className="text-sm font-semibold text-neutral-900">
                    Efectividad
                  </div>
                  <div className="mt-2 text-3xl font-semibold tabular-nums text-neutral-900">
                    {lifetimePct}%
                  </div>
                  <div className="mt-1 text-xs text-neutral-600">
                    Sobre todos los intentos guardados
                  </div>
                </div>
                <div className="rounded-2xl border border-emerald-200/70 bg-white p-5 ring-1 ring-emerald-100">
                  <div className="text-sm font-semibold text-emerald-900">
                    Correctas (total)
                  </div>
                  <div className="mt-2 text-2xl font-semibold tabular-nums text-emerald-900">
                    {lifetime.totalCorrect}
                  </div>
                </div>
                <div className="rounded-2xl border border-rose-200/70 bg-white p-5 ring-1 ring-rose-100">
                  <div className="text-sm font-semibold text-rose-900">
                    Incorrectas (total)
                  </div>
                  <div className="mt-2 text-2xl font-semibold tabular-nums text-rose-900">
                    {lifetime.totalWrong}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={startSession}
                  className="rounded-2xl bg-[color:var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
                >
                  Comenzar práctica
                </button>
              </div>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={() => {
                    clearHomePracticeStats();
                    setLifetimeStats(loadHomePracticeStats());
                  }}
                  className="text-xs font-semibold text-neutral-500 underline decoration-neutral-300 underline-offset-2 hover:text-neutral-800"
                >
                  Borrar estadísticas guardadas
                </button>
              </div>
            </div>
          ) : phase === "summary" ? (
            <div className="mx-auto max-w-xl text-center">
              <div className="text-xl font-semibold text-neutral-900">
                Quick summary
              </div>
              <div className="mt-2 text-sm text-neutral-600">
                You’ve answered {index + 1} words so far.
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="text-sm font-semibold text-emerald-900">
                    Correct
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-emerald-900">
                    {correctCount}
                  </div>
                </div>
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
                  <div className="text-sm font-semibold text-rose-900">
                    Incorrect
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-rose-900">
                    {wrongCount}
                  </div>
                </div>
              </div>

              <div className="mt-8 text-sm text-neutral-700">
                Do you want to continue?
              </div>
              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={() => continueAfterSummary(true)}
                  className="rounded-2xl bg-[color:var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
                >
                  Continue
                </button>
                <button
                  type="button"
                  onClick={() => continueAfterSummary(false)}
                  className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
                >
                  Stop
                </button>
              </div>
            </div>
          ) : phase === "done" ? (
            <div className="mx-auto max-w-xl text-center">
              <div className="text-xl font-semibold text-neutral-900">
                Session complete
              </div>
              <div className="mt-2 text-sm text-neutral-600">
                Great job. Here are your results.
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                  <div className="text-sm font-semibold text-emerald-900">
                    Correct
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-emerald-900">
                    {correctCount}
                  </div>
                </div>
                <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5">
                  <div className="text-sm font-semibold text-rose-900">
                    Incorrect
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-rose-900">
                    {wrongCount}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <Link
                  href="/reading/read-and-select"
                  className="rounded-2xl border border-neutral-200 bg-white px-5 py-3 text-sm font-semibold text-neutral-900 transition hover:bg-neutral-50"
                >
                  Back to Read and Select
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-10">
              {wordBlock}

              <div className="mx-auto grid w-full max-w-md grid-cols-1 gap-4 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => onPick("yes")}
                  disabled={phase !== "question"}
                  className={[
                    "rounded-2xl border border-neutral-200 bg-white p-6 text-center transition",
                    "hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/25",
                    phase !== "question" ? "opacity-60" : "",
                  ].join(" ")}
                >
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-neutral-50 text-[color:var(--brand)]">
                    <CheckIcon className="h-7 w-7" />
                  </div>
                  <div className="mt-3 text-sm font-semibold text-neutral-900">
                    Yes
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => onPick("no")}
                  disabled={phase !== "question"}
                  className={[
                    "rounded-2xl border border-neutral-200 bg-white p-6 text-center transition",
                    "hover:bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/25",
                    phase !== "question" ? "opacity-60" : "",
                  ].join(" ")}
                >
                  <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-neutral-50 text-[color:var(--brand)]">
                    <XIcon className="h-7 w-7" />
                  </div>
                  <div className="mt-3 text-sm font-semibold text-neutral-900">
                    No
                  </div>
                </button>
              </div>

              {phase === "result" && result ? (
                <div className="mx-auto w-full max-w-2xl">
                  <div
                    className={[
                      "rounded-2xl border p-5",
                      result.timedOut || !result.correct
                        ? "border-rose-200 bg-rose-50"
                        : "border-emerald-200 bg-emerald-50",
                    ].join(" ")}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div
                        className={[
                          "text-sm font-semibold",
                          result.timedOut || !result.correct
                            ? "text-rose-900"
                            : "text-emerald-900",
                        ].join(" ")}
                      >
                        {result.timedOut
                          ? "Time’s up"
                          : result.correct
                            ? "Correct"
                            : "Incorrect"}
                      </div>
                      <div
                        className={[
                          "text-sm",
                          result.timedOut || !result.correct
                            ? "text-rose-800"
                            : "text-emerald-800",
                        ].join(" ")}
                      >
                        {item?.isReal ? "Real word" : "Not a real word"}
                      </div>
                    </div>

                    {item?.isReal ? (
                      <div className="mt-4 grid gap-3">
                        <div className="rounded-xl border border-neutral-200 bg-white p-4">
                          <div className="text-xs font-semibold text-neutral-500">
                            Spanish
                          </div>
                          <div className="mt-1 text-sm font-semibold text-neutral-900">
                            {item.es ?? "—"}
                          </div>
                        </div>
                        <div className="rounded-xl border border-neutral-200 bg-white p-4">
                          <div className="text-xs font-semibold text-neutral-500">
                            Definition (EN)
                          </div>
                          <div className="mt-1 text-sm text-neutral-800">
                            {item.definitionEn ?? "—"}
                          </div>
                        </div>
                        <div className="rounded-xl border border-neutral-200 bg-white p-4">
                          <div className="text-xs font-semibold text-neutral-500">
                            Example sentence
                          </div>
                          <div className="mt-1 text-sm text-neutral-800">
                            {item.exampleEn ?? "—"}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-4">
                        <div className="text-xs font-semibold text-neutral-500">
                          Note (ES)
                        </div>
                        <div className="mt-1 text-sm text-neutral-800">
                          {item?.es ?? "—"}
                        </div>
                        <div className="mt-3 text-sm text-neutral-700">
                          {item?.definitionEn ?? "—"}
                        </div>
                      </div>
                    )}

                    <div className="mt-5 flex justify-end">
                      <button
                        type="button"
                        onClick={goNext}
                        className="rounded-2xl bg-[color:var(--brand)] px-5 py-3 text-sm font-semibold text-white transition hover:opacity-95"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
