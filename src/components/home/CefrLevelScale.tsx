import { CEFR_LEVELS, type CefrLevel } from "@/lib/examLevel";

export function CefrLevelScale({
  activeLevel,
  compact = false,
}: {
  activeLevel: CefrLevel | null;
  compact?: boolean;
}) {
  return (
    <div
      className={[
        "flex flex-wrap gap-1.5",
        compact ? "justify-start" : "justify-between",
      ].join(" ")}
    >
      {CEFR_LEVELS.map((level) => {
        const active = activeLevel === level;
        return (
          <span
            key={level}
            className={[
              "rounded-lg px-2.5 py-1 text-xs font-bold tracking-wide transition",
              active
                ? "bg-[color:var(--brand)] text-white shadow-sm"
                : "bg-neutral-100 text-neutral-500 ring-1 ring-neutral-200/80",
            ].join(" ")}
          >
            {level}
          </span>
        );
      })}
    </div>
  );
}
