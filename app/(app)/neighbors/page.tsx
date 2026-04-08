import Link from "next/link";
import { getNeighborsWithAssistanceTotals } from "@/lib/data/neighbors";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

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

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-stone-50 text-xs font-medium uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3 text-right">Assistance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-muted">
                    No neighbors yet.{" "}
                    <Link href="/neighbors/new" className="text-accent underline-offset-2 hover:underline">
                      Add the first one
                    </Link>
                    .
                  </td>
                </tr>
              ) : (
                rows.map((n) => (
                  <tr key={n.id} className="transition hover:bg-stone-50/80">
                    <td className="px-4 py-3 font-medium text-foreground">
                      <Link
                        href={`/neighbors/${n.id}`}
                        className="text-accent hover:underline"
                      >
                        {n.full_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{n.phone ?? "—"}</td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-muted" title={n.address ?? undefined}>
                      {n.address?.trim() ? n.address : "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">
                      {money.format(n.assistance_total)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
