export function Chevron({ open, className = "" }: { open?: boolean; className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      aria-hidden
      className={[
        "h-5 w-5 shrink-0 text-neutral-500 transition-transform duration-200",
        open ? "rotate-90" : "",
        className,
      ].join(" ")}
      fill="none"
    >
      <path
        d="M7.5 5l5 5-5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
