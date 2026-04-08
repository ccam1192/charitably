export function ActivityDot({ type }: { type: string }) {
  const color =
    type === "visit"
      ? "bg-sky-500"
      : type === "call"
        ? "bg-violet-500"
        : type === "assistance"
          ? "bg-amber-500"
          : "bg-stone-400";
  return (
    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${color}`} aria-hidden />
  );
}
