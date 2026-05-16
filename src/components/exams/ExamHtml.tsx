/** Renders limited HTML from exam content (b, br only). */
export function ExamHtml({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  const safe = html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<\/?(?!b|br)\w+[^>]*>/gi, "");
  return (
    <div
      className={["text-sm leading-relaxed text-neutral-800 [&_b]:font-semibold", className].join(
        " ",
      )}
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  );
}
