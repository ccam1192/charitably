import Link from "next/link";

export function StatWidget({
  label,
  value,
  viewAllHref,
}: {
  label: string;
  value: string;
  viewAllHref: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-4 shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-muted">{label}</p>
        <Link
          href={viewAllHref}
          className="shrink-0 text-xs font-medium text-accent hover:underline"
        >
          View all
        </Link>
      </div>
      <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{value}</p>
    </div>
  );
}
