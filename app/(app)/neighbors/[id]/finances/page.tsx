import Link from "next/link";
import {
  computeMonthlySummaryFromRows,
  getNeighborFinances,
} from "@/lib/data/neighbor-finances";
import { getNeighborById } from "@/lib/data/neighbors";
import { notFound } from "next/navigation";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const frequencyLabel: Record<string, string> = {
  weekly: "Weekly",
  biweekly: "Biweekly",
  monthly: "Monthly",
  "one-time": "One-time",
};

function formatCategory(slug: string): string {
  return slug
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export default async function NeighborFinancesPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const [neighbor, rows] = await Promise.all([getNeighborById(id), getNeighborFinances(id)]);
  if (!neighbor) notFound();
  const summary = computeMonthlySummaryFromRows(rows);
  const net = summary.net_monthly_balance;
  const netPositive = net >= 0;

  return (
    <div className="space-y-8">
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-border bg-card px-5 py-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Total monthly income</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
            {money.format(summary.total_monthly_income)}
          </p>
          <p className="mt-1 text-xs text-muted">Recurring only (excludes one-time)</p>
        </div>
        <div className="rounded-lg border border-border bg-card px-5 py-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Total monthly expenses</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-foreground">
            {money.format(summary.total_monthly_expenses)}
          </p>
          <p className="mt-1 text-xs text-muted">Recurring only (excludes one-time)</p>
        </div>
        <div
          className={
            netPositive
              ? "rounded-lg border border-emerald-200/80 bg-emerald-50/60 px-5 py-4 shadow-sm"
              : "rounded-lg border border-red-200/80 bg-red-50/60 px-5 py-4 shadow-sm"
          }
        >
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Net balance</p>
          <p
            className={
              netPositive
                ? "mt-2 text-2xl font-semibold tabular-nums text-emerald-900"
                : "mt-2 text-2xl font-semibold tabular-nums text-red-900"
            }
          >
            {money.format(net)}
          </p>
          <p className="mt-1 text-xs text-muted">Income minus expenses (monthly)</p>
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h3 className="text-sm font-medium text-foreground">Entries</h3>
          <Link
            href={`/neighbors/${id}/finances/new`}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Add entry
          </Link>
        </div>
        <div className="mt-3 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-stone-50 text-xs font-medium uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Amount (monthly)</th>
                <th className="px-4 py-3">Frequency</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Date added</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted">
                    No finance entries yet.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50/80">
                    <td className="whitespace-nowrap px-4 py-3 capitalize text-foreground">{r.type}</td>
                    <td className="max-w-[200px] px-4 py-3 text-foreground">{formatCategory(r.category)}</td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums text-foreground">
                      {money.format(typeof r.amount === "number" ? r.amount : parseFloat(String(r.amount)))}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">
                      {frequencyLabel[r.frequency] ?? r.frequency}
                    </td>
                    <td className="max-w-[180px] px-4 py-3 text-muted">{r.source ?? "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted">
                      {new Date(r.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Link
                        href={`/neighbors/${id}/finances/${r.id}/edit`}
                        className="font-medium text-accent hover:underline"
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
      </section>
    </div>
  );
}
