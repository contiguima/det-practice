"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/home/AppShell";
import { ExamRunner } from "@/components/exams/ExamRunner";
import { getExamById } from "@/lib/examCatalog";
import { getExamQuestions } from "@/lib/exams/getExamQuestions";
import { getPerExamStats, loadExamStats, type ExamLifetimeStats } from "@/lib/examStats";

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const examId = typeof params.examId === "string" ? params.examId : "";
  const exam = useMemo(() => getExamById(examId), [examId]);
  const meta = useMemo(() => getExamQuestions(examId), [examId]);

  const [stats, setStats] = useState<ExamLifetimeStats | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStats(loadExamStats());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!exam && hydrated) {
      router.replace("/tests");
    }
  }, [exam, hydrated, router]);

  const perExam = stats && exam ? getPerExamStats(stats, exam.id) : null;

  if (!exam) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-white p-6">
        <p className="text-sm text-neutral-600">Examen no encontrado.</p>
      </div>
    );
  }

  const hasQuestions = meta && meta.questionCount > 0;

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-3xl">
        <Link
          href="/tests"
          className="text-sm font-semibold text-[color:var(--brand)] hover:underline"
        >
          ← Volver a Test
        </Link>
        <div className="mt-4">
          <div className="text-lg font-semibold tracking-tight text-neutral-900">{exam.title}</div>
          <div className="mt-1 text-sm text-neutral-600">{exam.subtitle}</div>
        </div>

        {hasQuestions ? (
          <ExamRunner
            examId={examId}
            meta={meta}
            description={exam.description}
            onStatsChange={setStats}
          />
        ) : (
          <div className="mt-8 rounded-2xl border border-neutral-200 bg-white p-6 sm:p-8">
            <p className="text-sm text-neutral-600">
              Este examen aún no tiene preguntas configuradas.
            </p>
            {hydrated && perExam && perExam.attemptCount > 0 ? (
              <p className="mt-3 text-sm text-neutral-700">
                Mejor puntaje guardado:{" "}
                <span className="font-semibold">{perExam.bestScorePercent}%</span>
              </p>
            ) : null}
          </div>
        )}
      </div>
    </AppShell>
  );
}
