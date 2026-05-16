"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { CefrLevelScale } from "@/components/home/CefrLevelScale";
import { getEnabledExams } from "@/lib/examCatalog";
import { getExamQuestions } from "@/lib/exams/getExamQuestions";
import { computeCefrLevelFromPoints } from "@/lib/examLevel";
import {
  aggregateEffectivenessPercent,
  getPerExamStats,
  hasAnyExamAttempts,
  loadExamStats,
  type ExamLifetimeStats,
} from "@/lib/examStats";
import { EXAM_1_MAX_AUTO_POINTS } from "@/lib/exams/exam1Data";

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none">
      <path
        d="M9 5H7.5A2.5 2.5 0 0 0 5 7.5v10A2.5 2.5 0 0 0 7.5 20h9a2.5 2.5 0 0 0 2.5-2.5V15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9 5a2 2 0 0 1 2-2h5.5A1.5 1.5 0 0 1 18 4.5V15a2 2 0 0 1-2 2H9V5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} fill="none">
      <path
        d="M7.5 11V8.7a4.5 4.5 0 0 1 9 0V11"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6.2 11h11.6c.9 0 1.7.8 1.7 1.7v6.6c0 .9-.8 1.7-1.7 1.7H6.2c-.9 0-1.7-.8-1.7-1.7v-6.6c0-.9.8-1.7 1.7-1.7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TestDashboard() {
  const [stats, setStats] = useState<ExamLifetimeStats | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStats(loadExamStats());
    setHydrated(true);
  }, []);

  const exams = getEnabledExams();
  const effectiveness = useMemo(
    () => (stats ? aggregateEffectivenessPercent(stats) : 0),
    [stats],
  );
  const hasAttempts = stats ? hasAnyExamAttempts(stats) : false;
  const bestPoints = useMemo(() => {
    if (!stats) return 0;
    let best = 0;
    for (const row of Object.values(stats.byExam)) {
      best = Math.max(best, row.bestEarnedPoints);
    }
    return best;
  }, [stats]);
  const level = computeCefrLevelFromPoints(bestPoints, hasAttempts);
  const totalAttempts = useMemo(
    () => (stats ? stats.attempts.length : 0),
    [stats],
  );

  return (
    <div className="mx-auto w-full max-w-4xl">
      <header className="flex items-center justify-between gap-4">
        <div>
          <div className="text-xl font-semibold tracking-tight text-neutral-900 md:text-2xl">
            Test
          </div>
          <p className="mt-1 text-sm text-neutral-600">
            Exámenes cronometrados · repetí para mejorar tu mejor puntaje
          </p>
        </div>
        {!hydrated ? (
          <span className="text-xs text-neutral-500">Cargando…</span>
        ) : null}
      </header>

      <section className="mt-6 rounded-2xl border border-neutral-200 bg-white p-5 sm:p-6">
        <div className="text-sm font-semibold text-neutral-900">Dashboard</div>
        <p className="mt-1 text-sm text-neutral-600">
          Métricas guardadas en este dispositivo (localStorage).
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 sm:col-span-1">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              Efectividad
            </div>
            <div className="mt-2 text-4xl font-semibold tracking-tight text-neutral-900">
              {hydrated ? `${effectiveness}%` : "—"}
            </div>
            <p className="mt-2 text-xs text-neutral-600">
              {hasAttempts
                ? `% de puntos auto-calificados (máx. ${EXAM_1_MAX_AUTO_POINTS} por intento)`
                : "Completá un examen para ver tu %"}
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 sm:col-span-1">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              Nivel actual
            </div>
            <div className="mt-2 text-4xl font-semibold tracking-tight text-[color:var(--brand)]">
              {level ?? "—"}
            </div>
            <p className="mt-2 text-xs text-neutral-600">
              Según tu mejor puntaje (0–40 A1–A2 · 41–125 B1–B2 · 126+ C1)
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50/80 p-4 sm:col-span-1">
            <div className="text-[11px] font-semibold uppercase tracking-wide text-neutral-500">
              Intentos
            </div>
            <div className="mt-2 text-4xl font-semibold tracking-tight text-neutral-900">
              {hydrated ? totalAttempts : "—"}
            </div>
            <p className="mt-2 text-xs text-neutral-600">Total de exámenes realizados</p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-neutral-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            Escala MCER
          </div>
          <div className="mt-3">
            <CefrLevelScale activeLevel={level} />
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="text-sm font-semibold text-neutral-900">Exámenes disponibles</div>
        <p className="mt-1 text-sm text-neutral-600">
          Cada pregunta tiene tiempo limitado. Podés repetir para superar tu mejor puntaje.
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {exams.map((exam) => {
            const row = stats ? getPerExamStats(stats, exam.id) : null;
            const qMeta = getExamQuestions(exam.id);
            return (
              <Link
                key={exam.id}
                href={`/tests/${exam.id}`}
                className="group rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/25"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl border border-neutral-200 bg-neutral-50 text-[color:var(--brand)]">
                    <ClipboardIcon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-[color:var(--brand)]/10 px-2.5 py-1 text-[11px] font-semibold text-[color:var(--brand)]">
                    Disponible
                  </span>
                </div>
                <div className="mt-4 text-sm font-semibold text-neutral-900">{exam.title}</div>
                <div className="mt-1 text-xs text-neutral-600">{exam.subtitle}</div>
                <p className="mt-3 line-clamp-2 text-xs text-neutral-600">{exam.description}</p>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] font-semibold text-neutral-500">
                  <span>
                    {qMeta
                      ? `${qMeta.questionCount} preguntas · ~${qMeta.estimatedMinutes} min`
                      : `${exam.questionCount} preguntas`}
                  </span>
                  {row && row.attemptCount > 0 ? (
                    <>
                      <span className="text-neutral-300">·</span>
                      <span>Mejor: {row.bestScorePercent}%</span>
                      <span className="text-neutral-300">·</span>
                      <span>
                        {row.attemptCount} intento{row.attemptCount === 1 ? "" : "s"}
                      </span>
                    </>
                  ) : (
                    <span className="text-neutral-400">Sin intentos aún</span>
                  )}
                </div>
              </Link>
            );
          })}

          <div
            className="rounded-2xl border border-dashed border-neutral-200 bg-neutral-50/50 p-5 opacity-70"
            aria-hidden
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-neutral-700">
              <LockIcon className="h-4 w-4" />
              Más exámenes próximamente
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
