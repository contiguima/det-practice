import Link from "next/link";

export default function FillInTheBlanksPage() {
  return (
    <div className="min-h-dvh bg-white p-6 sm:p-10">
      <div className="mx-auto max-w-4xl rounded-2xl border border-neutral-200 bg-white">
        <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
          <div>
            <div className="text-lg font-semibold tracking-tight text-neutral-900">
              Fill in the Blanks
            </div>
            <div className="mt-1 text-sm text-neutral-600">
              Practice section — content coming soon.
            </div>
          </div>
          <Link
            href="/reading"
            className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50"
          >
            Back
          </Link>
        </div>
      </div>
    </div>
  );
}
