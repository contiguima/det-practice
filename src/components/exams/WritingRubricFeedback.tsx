"use client";

import type { WritingEvaluation } from "@/lib/exams/examGrading";

function barColor(percent: number) {
  if (percent >= 75) return "bg-emerald-500";
  if (percent >= 55) return "bg-amber-500";
  return "bg-rose-500";
}

export function WritingRubricFeedback({
  evaluation,
  earnedPoints,
  maxPoints,
}: {
  evaluation: WritingEvaluation;
  earnedPoints: number;
  maxPoints: number;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-200 bg-white px-4 py-3">
        <span className="text-sm font-semibold text-neutral-900">Evaluación por rúbrica</span>
        <span className="text-sm font-semibold text-[color:var(--brand)]">
          {evaluation.overallPercent}% · {earnedPoints}/{maxPoints} pts
        </span>
      </div>
      <div className="space-y-2">
        {evaluation.criteria.map((c) => (
          <div key={c.id} className="rounded-xl border border-neutral-200 bg-neutral-50/80 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-semibold text-neutral-800">{c.label}</span>
              <span className="text-xs font-semibold text-neutral-600">
                {c.scorePercent}% · peso {c.weightPercent}%
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-neutral-200">
              <div
                className={`h-full rounded-full transition-all ${barColor(c.scorePercent)}`}
                style={{ width: `${c.scorePercent}%` }}
              />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-neutral-600">{c.feedback}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
