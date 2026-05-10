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
      className="group rounded-2xl border border-neutral-200 bg-white p-5 transition hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/25"
    >
      <div className="text-sm font-semibold text-neutral-900">{title}</div>
      <div className="mt-1 text-xs text-neutral-600">{subtitle}</div>
      <div className="mt-4 flex items-center justify-between">
        <div className="h-1.5 flex-1 rounded-full bg-neutral-100">
          <div className="h-1.5 w-[10%] rounded-full bg-[color:var(--brand)]" />
        </div>
        <div className="ml-3 text-[11px] font-semibold text-neutral-500">
          Start
        </div>
      </div>
    </Link>
  );
}

export default function ReadAndSelectPage() {
  return (
    <div className="min-h-dvh bg-white p-6 sm:p-10">
      <div className="mx-auto max-w-4xl rounded-2xl border border-neutral-200 bg-white">
        <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
          <div>
            <div className="text-lg font-semibold tracking-tight text-neutral-900">
              Read and Select
            </div>
            <div className="mt-1 text-sm text-neutral-600">
              Here we will learn a lot of vocabulary
            </div>
          </div>
          <Link
            href="/reading"
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
          >
            Back
          </Link>
        </div>

        <div className="border-t border-neutral-200 p-5 sm:p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <Tile
              title="Lessons"
              subtitle="Build your word bank"
              href="/reading/read-and-select/lessons"
            />
            <Tile
              title="Home practice"
              subtitle="Quick daily practice"
              href="/reading/read-and-select/home-practice"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
