import Link from "next/link";

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
    >
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
      <path
        d="M12 15.1v2.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
    >
      <path
        d="M6.5 4.8h8.8c1.8 0 3.2 1.4 3.2 3.2v11c0 0-1.1-1.1-3.2-1.1H6.5c-1.1 0-2 .9-2 2V6.8c0-1.1.9-2 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M7.6 8.1h7.8M7.6 11.1h7.8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PenIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
    >
      <path
        d="M14.7 6.2 17.8 9.3M8.1 20.3H4.6v-3.5L15.7 5.7a1.9 1.9 0 0 1 2.7 0l.9.9a1.9 1.9 0 0 1 0 2.7L8.1 20.3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MicIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
    >
      <path
        d="M12 14.8a3.2 3.2 0 0 0 3.2-3.2V7.2A3.2 3.2 0 0 0 12 4a3.2 3.2 0 0 0-3.2 3.2v4.4A3.2 3.2 0 0 0 12 14.8Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M6.6 11.2a5.4 5.4 0 0 0 10.8 0M12 16.6v3.4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HeadphonesIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
    >
      <path
        d="M4.8 13.2v-1.1A7.2 7.2 0 0 1 12 4.9a7.2 7.2 0 0 1 7.2 7.2v1.1"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M6.3 20.2a1.9 1.9 0 0 1-1.9-1.9v-3a1.9 1.9 0 0 1 1.9-1.9h.9a1.9 1.9 0 0 1 1.9 1.9v3a1.9 1.9 0 0 1-1.9 1.9h-.9Zm10.5 0a1.9 1.9 0 0 0 1.9-1.9v-3a1.9 1.9 0 0 0-1.9-1.9h-.9a1.9 1.9 0 0 0-1.9 1.9v3a1.9 1.9 0 0 0 1.9 1.9h.9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type SkillKey = "reading" | "writing" | "speaking" | "listening";

const skills: Array<{
  key: SkillKey;
  title: string;
  subtitle: string;
  enabled: boolean;
  href?: string;
  icon: (p: { className?: string }) => React.ReactNode;
  accent: "blue";
}> = [
  {
    key: "reading",
    title: "Reading",
    subtitle: "Read and Select · Read and Complete",
    enabled: true,
    href: "/reading",
    icon: (p) => <BookIcon {...p} />,
    accent: "blue",
  },
  {
    key: "writing",
    title: "Writing",
    subtitle: "Write About the Photo · Writing Sample",
    enabled: false,
    icon: (p) => <PenIcon {...p} />,
    accent: "blue",
  },
  {
    key: "speaking",
    title: "Speaking",
    subtitle: "Speak About the Photo · Speaking Sample",
    enabled: false,
    icon: (p) => <MicIcon {...p} />,
    accent: "blue",
  },
  {
    key: "listening",
    title: "Listening",
    subtitle: "Listen and Type · Interactive Listening",
    enabled: false,
    icon: (p) => <HeadphonesIcon {...p} />,
    accent: "blue",
  },
];

const accent = {
  ring: "ring-[color:var(--brand)]/25",
  badge:
    "bg-[color:var(--brand)]/10 text-[color:var(--brand)] dark:bg-[color:var(--brand)]/15",
  icon: "text-[color:var(--brand)]",
} as const;

export default function Home() {
  return (
    <div className="flex min-h-dvh w-full">
      <aside className="hidden md:flex w-[250px] shrink-0 flex-col border-r border-[color:var(--border)] bg-[color:var(--surface)]">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-[color:var(--surface-muted)] text-[color:var(--brand)] ring-1 ring-[color:var(--border)]">
                <span className="text-xs font-bold tracking-wide">DET</span>
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold text-black/80 dark:text-white/85">
                  Duolingo English Test
                </div>
                <div className="text-xs text-black/45 dark:text-white/55">
                  Práctica
                </div>
              </div>
            </div>
            <div className="h-9 w-9 rounded-xl bg-[color:var(--surface-muted)] ring-1 ring-[color:var(--border)] grid place-items-center text-xs font-semibold text-black/60 dark:text-white/65">
              A
            </div>
          </div>
        </div>

        <div className="px-4">
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl bg-[color:var(--brand)]/10 px-3 py-2.5 text-sm font-semibold text-[color:var(--brand)]"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[color:var(--brand)]/15">
              🏠
            </span>
            Practicar
          </button>
        </div>
      </aside>

      <main className="flex-1">
        <div className="mx-auto flex min-h-dvh max-w-5xl flex-col px-5 py-6 sm:px-8 sm:py-10">
          <header className="flex items-center justify-between gap-4">
            <div className="md:hidden flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-[color:var(--surface)] ring-1 ring-[color:var(--border)] text-[color:var(--brand)]">
                <span className="text-xs font-bold tracking-wide">DET</span>
              </div>
              <div className="leading-tight">
                <div className="text-sm font-semibold">Práctica</div>
                <div className="text-xs text-black/45 dark:text-white/55">
                  Habilidades
                </div>
              </div>
            </div>

            <div className="hidden md:block">
              <div className="text-xl font-semibold tracking-tight">
                Práctica de habilidades
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="h-10 w-10 rounded-xl bg-[color:var(--surface)] ring-1 ring-[color:var(--border)] grid place-items-center text-black/60 dark:text-white/65"
                aria-label="Ayuda"
              >
                <span className="text-sm font-semibold">i</span>
              </button>
            </div>
          </header>

          <section className="mt-6">
            <div className="mx-auto w-full max-w-4xl">
              <div className="rounded-2xl bg-[color:var(--surface)] ring-1 ring-[color:var(--border)] shadow-[var(--shadow)]">
                <div className="border-b border-[color:var(--border)] px-5 py-4 sm:px-6">
                  <div className="text-base font-semibold text-black/80 dark:text-white/85">
                    Práctica de habilidades
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-[11px] font-semibold tracking-wide text-black/40 dark:text-white/50">
                    {["TODAS", "SPEAKING", "WRITING", "READING", "LISTENING"].map(
                      (t) => (
                        <span
                          key={t}
                          className={
                            t === "TODAS"
                              ? "relative text-[color:var(--brand)]"
                              : ""
                          }
                        >
                          {t}
                          {t === "TODAS" ? (
                            <span className="absolute -bottom-2 left-0 h-0.5 w-full bg-[color:var(--brand)]" />
                          ) : null}
                        </span>
                      ),
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 p-5 sm:gap-5 sm:p-6">
                  {skills.map((skill) => {
                    const CardInner = (
                      <div
                        className={[
                          "group rounded-2xl bg-[color:var(--surface)] ring-1 ring-[color:var(--border)] p-4 transition",
                          "focus-within:ring-2 focus-within:ring-[color:var(--brand)]/30",
                          skill.enabled
                            ? "hover:-translate-y-0.5 hover:shadow-[var(--shadow)]"
                            : "opacity-70",
                        ].join(" ")}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div
                            className={[
                              "grid h-10 w-10 place-items-center rounded-xl bg-[color:var(--surface-muted)] ring-1 ring-[color:var(--border)]",
                              accent.icon,
                            ].join(" ")}
                          >
                            {skill.icon({ className: "h-5 w-5" })}
                          </div>

                          {skill.enabled ? (
                            <span className={["rounded-full px-2.5 py-1 text-[11px] font-semibold", accent.badge].join(" ")}>
                              Disponible
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded-full bg-black/5 px-2.5 py-1 text-[11px] font-semibold text-black/60 dark:bg-white/10 dark:text-white/65">
                              <LockIcon className="h-3.5 w-3.5" />
                              Bloqueado
                            </span>
                          )}
                        </div>

                        <div className="mt-4">
                          <div className="text-sm font-semibold text-black/80 dark:text-white/85">
                            {skill.title}
                          </div>
                          <div className="mt-1 text-xs text-black/45 dark:text-white/55">
                            {skill.subtitle}
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                          <div className="h-1.5 flex-1 rounded-full bg-black/5 dark:bg-white/10">
                            <div className="h-1.5 w-[6%] rounded-full bg-[color:var(--brand)]" />
                          </div>
                          <div className="text-[11px] font-semibold text-black/40 dark:text-white/50">
                            0/6
                          </div>
                        </div>
                      </div>
                    );

                    return skill.enabled && skill.href ? (
                      <Link
                        key={skill.key}
                        href={skill.href}
                        className="focus:outline-none"
                        aria-label={`Ir a ${skill.title}`}
                      >
                        {CardInner}
                      </Link>
                    ) : (
                      <button
                        key={skill.key}
                        type="button"
                        className="text-left focus:outline-none"
                        aria-disabled="true"
                        disabled
                      >
                        {CardInner}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
