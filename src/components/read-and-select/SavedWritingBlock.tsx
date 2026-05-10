"use client";

import { GrammarHints } from "./GrammarHints";

function PencilIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L8 18l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}

export function SavedWritingBlock({
  value,
  onChange,
  collapsed,
  onCollapsedChange,
  rows = 7,
  placeholder,
  grammar = true,
}: {
  value: string;
  onChange: (next: string) => void;
  collapsed: boolean;
  onCollapsedChange: (collapsed: boolean) => void;
  rows?: number;
  placeholder?: string;
  grammar?: boolean;
}) {
  const preview =
    value.trim().length > 0
      ? value.trim().split(/\s+/).slice(0, 18).join(" ") + (value.trim().length > 120 ? "…" : "")
      : "";

  if (collapsed && value.trim().length > 0) {
    return (
      <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-900">
                Guardado
              </span>
              <span className="text-[11px] text-neutral-600">Escritura en este dispositivo</span>
            </div>
            <p className="mt-2 text-sm text-neutral-800 line-clamp-3">{preview}</p>
          </div>
          <button
            type="button"
            title="Editar"
            aria-label="Editar escritura"
            onClick={() => onCollapsedChange(false)}
            className="shrink-0 rounded-xl border border-emerald-200 bg-white p-2.5 text-emerald-800 shadow-sm transition hover:bg-emerald-50"
          >
            <PencilIcon />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        spellCheck
        lang="en"
        className="w-full rounded-2xl border border-neutral-200 bg-white p-4 text-sm text-neutral-900 focus:outline-none focus:ring-2 focus:ring-[color:var(--brand)]/25"
        placeholder={placeholder}
      />
      {grammar ? <GrammarHints text={value} onChangeText={onChange} /> : null}
      <div className="flex flex-wrap items-center justify-end gap-2">
        {value.trim().length > 0 ? (
          <button
            type="button"
            onClick={() => onCollapsedChange(true)}
            className="rounded-xl bg-[color:var(--brand)] px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-95"
          >
            Guardar escritura
          </button>
        ) : null}
      </div>
    </div>
  );
}
