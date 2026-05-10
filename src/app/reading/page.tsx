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

const SECTIONS: Array<{
  title: string;
  subtitle: string;
  href?: string;
}> = [
  {
    title: "Read and Select",
    subtitle: "Vocabulario y rapidez.",
    href: "/reading/read-and-select",
  },
  {
    title: "Fill in the Blanks",
    subtitle: "Completa huecos en el texto.",
    href: "/reading/fill-in-the-blanks",
  },
  {
    title: "Read and Complete",
    subtitle: "Termina fragmentos con sentido.",
    href: "/reading/read-and-complete",
  },
  { title: "Interactive Reading", subtitle: "Próximamente." },
];

export default function ReadingPage() {
  return (
    <div className="min-h-dvh bg-white p-6 sm:p-10">
      <div className="mx-auto max-w-4xl rounded-2xl border border-neutral-200 bg-white">
        <div className="flex items-start justify-between gap-4">
          <div className="px-5 py-4 sm:px-6">
            <div className="text-lg font-semibold tracking-tight text-neutral-900">
              Reading
            </div>
            <div className="mt-1 text-sm text-neutral-600">
              Elegí un tipo de práctica.
            </div>
          </div>
          <Link
            href="/"
            className="m-4 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
          >
            Volver
          </Link>
        </div>

        <div className="border-t border-neutral-200 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {SECTIONS.map((section) =>
              section.href ? (
                <Link
                  key={section.title}
                  href={section.href}
                  className="group rounded-2xl border border-neutral-200 bg-white p-4 transition hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/25"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-neutral-900">
                      {section.title}
                    </div>
                    <div className="text-[11px] font-semibold text-[color:var(--brand)]">
                      Disponible
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-neutral-600">{section.subtitle}</div>
                  <div className="mt-4 h-1.5 w-full rounded-full bg-neutral-100">
                    <div className="h-1.5 w-[6%] rounded-full bg-[color:var(--brand)]" />
                  </div>
                </Link>
              ) : (
                <button
                  key={section.title}
                  type="button"
                  disabled
                  aria-disabled="true"
                  className="rounded-2xl border border-neutral-200 bg-white p-4 text-left opacity-60"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold text-neutral-900">
                      {section.title}
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2.5 py-1 text-[11px] font-semibold text-neutral-700">
                      <LockIcon className="h-3.5 w-3.5" />
                      Bloqueado
                    </span>
                  </div>
                  <div className="mt-2 text-xs text-neutral-600">{section.subtitle}</div>
                  <div className="mt-4 h-1.5 w-full rounded-full bg-neutral-100" />
                </button>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
