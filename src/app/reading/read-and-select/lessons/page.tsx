import Link from "next/link";

function LockIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none">
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

function LessonCard({
  title,
  subtitle,
  enabled,
  href,
}: {
  title: string;
  subtitle: string;
  enabled: boolean;
  href?: string;
}) {
  const inner = (
    <div
      className={[
        "rounded-2xl border border-neutral-200 bg-white p-4 transition",
        enabled ? "hover:border-neutral-300" : "opacity-60",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-neutral-900">{title}</div>
          <div className="mt-1 text-xs text-neutral-600">{subtitle}</div>
        </div>
        {enabled ? (
          <span className="rounded-full bg-[color:var(--brand)]/10 px-2.5 py-1 text-[11px] font-semibold text-[color:var(--brand)]">
            Available
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-700">
            <LockIcon className="h-3.5 w-3.5" />
            Locked
          </span>
        )}
      </div>
      <div className="mt-4 h-1.5 w-full rounded-full bg-neutral-100">
        <div
          className={[
            "h-1.5 rounded-full",
            enabled ? "w-[8%] bg-[color:var(--brand)]" : "w-[0%] bg-transparent",
          ].join(" ")}
        />
      </div>
    </div>
  );

  return enabled && href ? (
    <Link
      href={href}
      className="rounded-2xl focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/25"
      aria-label={`Open ${title}`}
    >
      {inner}
    </Link>
  ) : (
    <button type="button" disabled aria-disabled="true" className="text-left">
      {inner}
    </button>
  );
}

export default function LessonsPage() {
  return (
    <div className="min-h-dvh bg-white p-6 sm:p-10">
      <div className="mx-auto max-w-4xl rounded-2xl border border-neutral-200 bg-white">
        <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
          <div>
            <div className="text-lg font-semibold tracking-tight text-neutral-900">
              Lessons
            </div>
            <div className="mt-1 text-sm text-neutral-600">
              Learn first, then practice.
            </div>
          </div>
          <Link
            href="/reading/read-and-select"
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
          >
            Back
          </Link>
        </div>

        <div className="border-t border-neutral-200 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <LessonCard
              enabled
              href="/reading/read-and-select/lessons/lesson-0"
              title="Lesson 0 · The Skeleton of English"
              subtitle="Foundations · Frequency words + 3 verbs"
            />
            <LessonCard
              enabled
              href="/reading/read-and-select/lessons/lesson-1"
              title="Lesson 1 · Business & Workplace"
              subtitle="The Consultant's Path · 10 terms"
            />
            <LessonCard
              enabled
              href="/reading/read-and-select/lessons/lesson-2"
              title="Lesson 2 · Academic Nuance"
              subtitle="The Engineer's Voice · 10 verbs"
            />
            <LessonCard
              enabled
              href="/reading/read-and-select/lessons/lesson-3"
              title="Lesson 3 · Technology & Innovation"
              subtitle="The Product Builder · Digital studios & emerging tech"
            />
            <LessonCard
              enabled
              href="/reading/read-and-select/lessons/lesson-4"
              title="Lesson 4 · Abstract Concepts & Qualities"
              subtitle="B2 Precision · Beyond good and bad"
            />
            <LessonCard
              enabled
              href="/reading/read-and-select/lessons/lesson-5"
              title="Lesson 5 · Transition & Connection"
              subtitle="Logic & Flow · Connectors"
            />
            <LessonCard
              enabled
              href="/reading/read-and-select/lessons/lesson-6"
              title="Lesson 6 · Idiomatic Expressions & Collocations"
              subtitle="Natural partnerships · Capstone writing"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
