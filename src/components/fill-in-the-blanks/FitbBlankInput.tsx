"use client";

import { parseBlankSlots } from "@/lib/fillInTheBlanks/grading";

export function FitbBlankInput({
  prompt,
  values,
  onChange,
  disabled,
  showResult,
  answers,
  blankOffset = 0,
}: {
  prompt: string;
  values: string[];
  onChange: (index: number, value: string) => void;
  disabled?: boolean;
  showResult?: boolean;
  answers: string[];
  blankOffset?: number;
}) {
  const slots = parseBlankSlots(prompt);

  return (
    <p className="text-sm leading-relaxed text-neutral-800">
      {slots.map((slot, i) => {
        if (slot.type === "text") {
          return <span key={`t-${i}`}>{slot.value}</span>;
        }
        const idx = slot.index + blankOffset;
        const expected = answers[idx] ?? "";
        const val = values[idx] ?? "";
        const ok =
          showResult &&
          val.trim() &&
          val.trim().toLowerCase() === expected.trim().toLowerCase();
        const bad = showResult && val.trim() && !ok;
        return (
          <span key={`b-${idx}`} className="inline-flex items-baseline gap-0.5 mx-0.5">
            <input
              type="text"
              value={val}
              disabled={disabled}
              onChange={(e) => onChange(idx, e.target.value)}
              size={Math.max(expected.length, 4)}
              className={[
                "rounded-md border px-1.5 py-0.5 font-mono text-sm align-baseline",
                "focus:border-[color:var(--brand)] focus:outline-none focus:ring-1 focus:ring-[color:var(--brand)]/30",
                bad
                  ? "border-rose-300 bg-rose-50"
                  : ok
                    ? "border-emerald-300 bg-emerald-50"
                    : "border-neutral-300 bg-white",
              ].join(" ")}
              spellCheck={false}
              autoComplete="off"
            />
          </span>
        );
      })}
    </p>
  );
}
