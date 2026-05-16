"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileSectionNav() {
  const pathname = usePathname();
  const practiceActive =
    (pathname === "/" || pathname?.startsWith("/reading")) && !pathname?.startsWith("/tests");
  const testActive = pathname === "/tests" || pathname?.startsWith("/tests/");

  return (
    <nav
      className="mb-6 flex gap-2 md:hidden"
      aria-label="Secciones"
    >
      <Link
        href="/"
        className={[
          "flex-1 rounded-xl px-3 py-2.5 text-center text-sm font-semibold transition",
          practiceActive
            ? "bg-[color:var(--brand)]/10 text-[color:var(--brand)] ring-1 ring-[color:var(--brand)]/25"
            : "border border-neutral-200 bg-white text-neutral-900",
        ].join(" ")}
      >
        Practicar
      </Link>
      <Link
        href="/tests"
        className={[
          "flex-1 rounded-xl px-3 py-2.5 text-center text-sm font-semibold transition",
          testActive
            ? "bg-[color:var(--brand)]/10 text-[color:var(--brand)] ring-1 ring-[color:var(--brand)]/25"
            : "border border-neutral-200 bg-white text-neutral-900",
        ].join(" ")}
      >
        Test
      </Link>
    </nav>
  );
}
