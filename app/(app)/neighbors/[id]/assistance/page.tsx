import Link from "next/link";
import {
  getAssistanceForNeighbor,
  getAssistanceSumForNeighbor,
  getNeighborById,
} from "@/lib/data/neighbors";
import { formatAssistanceCategoryLabel } from "@/lib/financial-assistance";
import { notFound } from "next/navigation";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default async function NeighborAssistancePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const [neighbor, rows, total] = await Promise.all([
    getNeighborById(id),
    getAssistanceForNeighbor(id),
    getAssistanceSumForNeighbor(id),
  ]);
  if (!neighbor) notFound();

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <section className="rounded-lg border border-amber-200/80 bg-amber-50/50 px-5 py-4">
        <p className="text-sm font-medium text-stone-700">Total assistance (this neighbor)</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums text-stone-900">
          {money.format(total)}
        </p>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h3 className="text-sm font-medium text-foreground">Records</h3>
          <Link
            href={`/neighbors/${id}/assistance/new`}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Add assistance
          </Link>
        </div>
        <div className="mt-3 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-stone-50 text-xs font-medium uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Check # / Invoice #</th>
                <th className="px-4 py-3">Recorded by</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-muted">
                    No assistance recorded yet.
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const amt =
                    typeof r.amount === "string" ? parseFloat(r.amount) : Number(r.amount);
                  return (
                    <tr key={r.id} className="hover:bg-stone-50/80">
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-foreground">
                        {r.assistance_date}
                      </td>
                      <td className="max-w-[200px] px-4 py-3 text-muted">
                        {formatAssistanceCategoryLabel(r.category)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium tabular-nums text-foreground">
                        {money.format(Number.isFinite(amt) ? amt : 0)}
                      </td>
                      <td className="max-w-[140px] px-4 py-3 text-muted">{r.check_number ?? "—"}</td>
                      <td className="max-w-[160px] px-4 py-3 text-muted">{r.recorded_by_name ?? "—"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right">
                        <Link
                          href={`/neighbors/${id}/assistance/${r.id}/edit`}
                          className="text-xs font-medium text-accent hover:underline"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
