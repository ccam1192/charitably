import Link from "next/link";
import { NeighborsListSection } from "@/components/neighbors/neighbors-list";
import { getNeighborsWithAssistanceTotals } from "@/lib/data/neighbors";

export default async function NeighborsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const rows = await getNeighborsWithAssistanceTotals();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Neighbors</h2>
          <p className="mt-1 text-sm text-muted">
            People your conference serves — open a row for visits, calls, and assistance.
          </p>
        </div>
        <Link
          href="/neighbors/new"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
        >
          Add neighbor
        </Link>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <NeighborsListSection rows={rows} />
    </div>
  );
}
