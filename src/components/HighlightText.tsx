interface HighlightTextProps {
  text: string;
  query: string; // the debounced search query (may be empty)
}

export function HighlightText({ text, query }: HighlightTextProps) {
  const q = query.trim();
  if (!q) return <>{text}</>;

  // Case-insensitive split preserving the original casing of the match
  const regex = new RegExp(
    `(${q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
    "gi"
  );
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        const isMatch = part.toLowerCase() === q.toLowerCase();
        return isMatch ? (
          <mark
            key={i}
            className="rounded px-0.5 bg-yellow-200 text-yellow-900 dark:bg-yellow-800 dark:text-yellow-100"
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        );
      })}
    </>
  );
}
