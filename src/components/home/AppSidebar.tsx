"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

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

export function AppSidebar() {
  const pathname = usePathname();
  const practiceActive =
    (pathname === "/" || pathname?.startsWith("/reading")) && !pathname?.startsWith("/tests");
  const testActive = pathname === "/tests" || pathname?.startsWith("/tests/");

  return (
    <aside className="hidden md:flex w-[272px] shrink-0 flex-col border-r border-neutral-200 bg-white">
      <div className="p-6">
        <Link
          href="/"
          className="flex items-center justify-between rounded-xl focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/25"
        >
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl border border-neutral-200 bg-white text-[color:var(--brand)]">
              <span className="text-xs font-bold tracking-wide">DET</span>
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-neutral-900">Duolingo English Test</div>
              <div className="text-xs text-neutral-600">Práctica</div>
            </div>
          </div>
          <div className="h-9 w-9 rounded-xl bg-white ring-1 ring-neutral-200 grid place-items-center text-xs font-semibold text-neutral-700">
            A
          </div>
        </Link>
      </div>

      <nav className="flex flex-1 flex-col px-4 pb-6" aria-label="Navegación principal">
        <div className="space-y-1">
          <Link
            href="/"
            className={[
              "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
              practiceActive
                ? "bg-[color:var(--brand)]/10 text-[color:var(--brand)] ring-1 ring-[color:var(--brand)]/25"
                : "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
            ].join(" ")}
          >
            Practicar
          </Link>
          <Link
            href="/tests"
            className={[
              "flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
              testActive
                ? "bg-[color:var(--brand)]/10 text-[color:var(--brand)] ring-1 ring-[color:var(--brand)]/25"
                : "border border-neutral-200 bg-white text-neutral-900 hover:bg-neutral-50",
            ].join(" ")}
          >
            <ClipboardIcon className="h-4 w-4 shrink-0" />
            Test
          </Link>
        </div>
      </nav>
    </aside>
  );
}
