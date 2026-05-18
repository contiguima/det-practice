import Link from "next/link";
import { FillInTheBlanksPractice } from "@/components/fill-in-the-blanks/FillInTheBlanksPractice";

export default function FillInTheBlanksPage() {
  return (
    <div className="min-h-dvh bg-white p-6 sm:p-10">
      <div className="mx-auto max-w-3xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-lg font-semibold tracking-tight text-neutral-900">
              Fill in the Blanks
            </div>
            <p className="mt-1 text-sm text-neutral-600">
              Aprende cada palabra con definición y ejemplos, practica con un mini ejercicio sin
              tiempo y, cada 5 palabras, un repaso cronometrado (1:30).
            </p>
          </div>
          <Link
            href="/reading"
            className="shrink-0 rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
          >
            Back
          </Link>
        </div>

        <div className="mt-8">
          <FillInTheBlanksPractice />
        </div>
      </div>
    </div>
  );
}
