import Link from "next/link";

function Tile({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl bg-[color:var(--surface)] ring-1 ring-[color:var(--border)] p-5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow)] focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/30"
    >
      <div className="text-sm font-semibold text-black/80 dark:text-white/85">
        {title}
      </div>
      <div className="mt-1 text-xs text-black/45 dark:text-white/55">
        {subtitle}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <div className="h-1.5 flex-1 rounded-full bg-black/5 dark:bg-white/10">
          <div className="h-1.5 w-[10%] rounded-full bg-[color:var(--brand)]" />
        </div>
        <div className="ml-3 text-[11px] font-semibold text-black/40 dark:text-white/50">
          Start
        </div>
      </div>
    </Link>
  );
}

export default function ReadAndSelectPage() {
  return (
    <div className="min-h-dvh p-6 sm:p-10">
      <div className="mx-auto max-w-4xl rounded-2xl bg-[color:var(--surface)] ring-1 ring-[color:var(--border)] shadow-[var(--shadow)]">
        <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
          <div>
            <div className="text-lg font-semibold tracking-tight text-black/80 dark:text-white/85">
              Read and Select
            </div>
            <div className="mt-1 text-sm text-black/45 dark:text-white/55">
              Here we will learn a lot of vocabulary
            </div>
          </div>
          <Link
            href="/reading"
            className="rounded-xl bg-[color:var(--surface-muted)] px-4 py-2 text-sm font-semibold text-black/60 ring-1 ring-[color:var(--border)] transition hover:bg-[color:var(--surface)] dark:text-white/70"
          >
            Back
          </Link>
        </div>

        <div className="border-t border-[color:var(--border)] p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Tile title="Lessons" subtitle="Build your word bank" href="#" />
            <Tile
              title="Home practice"
              subtitle="Quick daily practice"
              href="#"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

