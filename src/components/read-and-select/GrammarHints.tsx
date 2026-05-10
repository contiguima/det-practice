"use client";

import { useEffect, useRef, useState } from "react";

export type GrammarMatch = {
  offset: number;
  length: number;
  message: string;
  replacements: Array<{ value: string }>;
  ruleId?: string;
};

export function applyGrammarMatch(text: string, m: GrammarMatch, replacement: string): string {
  const before = text.slice(0, m.offset);
  const after = text.slice(m.offset + m.length);
  return before + replacement + after;
}

export function GrammarHints({
  text,
  onChangeText,
  debounceMs = 700,
}: {
  text: string;
  onChangeText: (next: string) => void;
  debounceMs?: number;
}) {
  const [matches, setMatches] = useState<GrammarMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seq = useRef(0);

  const trimmed = text.trim();
  const canCheck = trimmed.length >= 8;

  useEffect(() => {
    if (!canCheck) {
      setMatches([]);
      setLoading(false);
      return;
    }
    const id = ++seq.current;
    setLoading(true);
    setError(null);
    const t = window.setTimeout(async () => {
      try {
        const res = await fetch("/api/grammar-check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        const json = (await res.json()) as { matches?: GrammarMatch[] };
        if (seq.current !== id) return;
        setMatches(Array.isArray(json.matches) ? json.matches : []);
      } catch {
        if (seq.current !== id) return;
        setError("No se pudo revisar el texto ahora.");
        setMatches([]);
      } finally {
        if (seq.current === id) setLoading(false);
      }
    }, debounceMs);
    return () => window.clearTimeout(t);
  }, [text, canCheck, debounceMs]);

  if (!canCheck) return null;

  if (loading && matches.length === 0) {
    return (
      <div className="mt-3 text-xs text-neutral-500">
        Revisando gramática y claridad…
      </div>
    );
  }
  if (error) {
    return <div className="mt-3 text-xs text-rose-700">{error}</div>;
  }
  if (matches.length === 0) {
    return loading ? (
      <div className="mt-3 text-xs text-neutral-500">Revisando…</div>
    ) : null;
  }

  return (
    <div className="mt-3 rounded-xl border border-amber-200/80 bg-amber-50/60 p-3">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-amber-900/90">
        Sugerencias (gramática y claridad)
      </div>
      <ul className="mt-2 space-y-2">
        {matches.map((m, i) => {
          const snippet = text.slice(m.offset, m.offset + m.length);
          const rep = m.replacements[0]?.value;
          return (
            <li key={`${m.offset}-${m.length}-${i}`} className="text-xs text-neutral-800">
              <span className="font-semibold text-neutral-900">{snippet}</span>
              <span className="text-neutral-600"> — {m.message}</span>
              {rep ? (
                <button
                  type="button"
                  onClick={() => {
                    const next = applyGrammarMatch(text, m, rep);
                    onChangeText(next);
                    setMatches([]);
                  }}
                  className="ml-2 rounded-lg bg-white px-2 py-0.5 text-[11px] font-semibold text-[color:var(--brand)] ring-1 ring-neutral-200 transition hover:bg-neutral-50"
                >
                  Aplicar: {rep}
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
