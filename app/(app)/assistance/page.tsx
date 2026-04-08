import Link from "next/link";
import { getAssistanceConferenceSummary, getAssistancePage } from "@/lib/data/assistance";
import { formatAssistanceCategoryLabel } from "@/lib/financial-assistance";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function toAmount(v: number | string): number {
  if (typeof v === "number") return v;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(amount: number | string, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(toAmount(amount));
  } catch {
    return money.format(toAmount(amount));
  }
}

export default async function AssistancePage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const pageRaw = params.page ? parseInt(params.page, 10) : 1;
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const [{ count, sum }, { rows, totalCount, pageSize }] = await Promise.all([
    getAssistanceConferenceSummary(),
    getAssistancePage(page),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Financial assistance</h2>
          <p className="mt-1 text-sm text-muted">
            All grants and aid recorded for your conference, newest first.
          </p>
        </div>
        <Link
          href="/assistance/new"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
        >
          Record assistance
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-card px-4 py-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Total entries</p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">{count}</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">
            Total assistance provided
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums text-foreground">
            {money.format(sum)}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b border-border bg-stone-50 text-xs font-medium uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Neighbor</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Check # / Invoice #</th>
                <th className="px-4 py-3">Recorded by</th>
                <th className="px-4 py-3 text-right" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted">
                    No assistance recorded yet.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="transition hover:bg-stone-50/80">
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-foreground">
                      {r.assistance_date}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{r.neighbor_name}</td>
                    <td className="max-w-[200px] px-4 py-3 text-muted">
                      {formatAssistanceCategoryLabel(r.category)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-foreground">
                      {formatMoney(r.amount, r.currency)}
                    </td>
                    <td className="max-w-[140px] px-4 py-3 text-muted">{r.check_number ?? "—"}</td>
                    <td className="max-w-[160px] px-4 py-3 text-muted">{r.recorded_by_name ?? "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Link
                        href={`/neighbors/${r.neighbor_id}/assistance/${r.id}/edit`}
                        className="text-xs font-medium text-accent hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm">
            <p className="text-muted">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} of{" "}
              {totalCount}
            </p>
            <div className="flex items-center gap-2">
              {page > 1 ? (
                <Link
                  href={page === 2 ? "/assistance" : `/assistance?page=${page - 1}`}
                  className="rounded-md border border-border px-3 py-1.5 font-medium text-foreground hover:bg-stone-50"
                >
                  Previous
                </Link>
              ) : (
                <span className="rounded-md border border-transparent px-3 py-1.5 text-muted">
                  Previous
                </span>
              )}
              <span className="tabular-nums text-muted">
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={`/assistance?page=${page + 1}`}
                  className="rounded-md border border-border px-3 py-1.5 font-medium text-foreground hover:bg-stone-50"
                >
                  Next
                </Link>
              ) : (
                <span className="rounded-md border border-transparent px-3 py-1.5 text-muted">
                  Next
                </span>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
