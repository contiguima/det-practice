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

export default function ReadingPage() {
  return (
    <div className="min-h-dvh p-6 sm:p-10">
      <div className="mx-auto max-w-4xl rounded-2xl bg-[color:var(--surface)] ring-1 ring-[color:var(--border)] shadow-[var(--shadow)]">
        <div className="flex items-start justify-between gap-4">
          <div className="px-5 py-4 sm:px-6">
            <div className="text-lg font-semibold tracking-tight text-black/80 dark:text-white/85">
              Reading
            </div>
            <div className="mt-1 text-sm text-black/45 dark:text-white/55">
              Elegí un tipo de práctica.
            </div>
          </div>
          <Link
            href="/"
            className="m-4 rounded-xl bg-[color:var(--surface-muted)] px-4 py-2 text-sm font-semibold text-black/60 ring-1 ring-[color:var(--border)] transition hover:bg-[color:var(--surface)] dark:text-white/70"
          >
            Volver
          </Link>
        </div>

        <div className="border-t border-[color:var(--border)] p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Link
              href="/reading/read-and-select"
              className="group rounded-2xl bg-[color:var(--surface)] ring-1 ring-[color:var(--border)] p-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/30"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-black/80 dark:text-white/85">
                  Read and Select
                </div>
                <div className="text-[11px] font-semibold text-[color:var(--brand)]">
                  Disponible
                </div>
              </div>
              <div className="mt-2 text-xs text-black/45 dark:text-white/55">
                Vocabulario y rapidez.
              </div>
              <div className="mt-4 h-1.5 w-full rounded-full bg-black/5 dark:bg-white/10">
                <div className="h-1.5 w-[6%] rounded-full bg-[color:var(--brand)]" />
              </div>
            </Link>

            {[
              "Fill in the Blanks",
              "Read and Complete",
              "Interactive Reading",
            ].map((title) => (
              <button
                key={title}
                type="button"
                disabled
                aria-disabled="true"
                className="rounded-2xl bg-[color:var(--surface)] ring-1 ring-[color:var(--border)] p-4 opacity-70 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-black/80 dark:text-white/85">
                    {title}
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2.5 py-1 text-[11px] font-semibold text-black/55 dark:bg-white/10 dark:text-white/60">
                    <LockIcon className="h-3.5 w-3.5" />
                    Bloqueado
                  </span>
                </div>
                <div className="mt-2 text-xs text-black/45 dark:text-white/55">
                  Próximamente
                </div>
                <div className="mt-4 h-1.5 w-full rounded-full bg-black/5 dark:bg-white/10" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

