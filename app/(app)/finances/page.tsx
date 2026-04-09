import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getRecentFinanceTransactions,
  loadConferenceFinanceMetrics,
} from "@/lib/data/finances";
import { formatExpenseCategoryLabel } from "@/lib/expenses";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export default async function FinancesDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const [{ metrics, rpcMissing }, recent] = await Promise.all([
    loadConferenceFinanceMetrics(),
    getRecentFinanceTransactions(30),
  ]);

  const netAllTime =
    metrics != null ? metrics.donations_all_time - metrics.expenses_all_time : null;

  return (
    <div className="space-y-10">
      <div>
        <h2 className="text-xl font-semibold text-foreground">Conference finances</h2>
        <p className="mt-1 text-sm text-muted">
          Donations, expenses, and net balance for your conference (admin only).
        </p>
      </div>

      {rpcMissing ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Run the latest migration{" "}
          <code className="rounded bg-amber-100/80 px-1 font-mono text-xs">
            supabase/migrations/00013_expenses_unified.sql
          </code>{" "}
          in Supabase to enable finance metrics.
        </p>
      ) : null}

      <section>
        <h3 className="text-sm font-medium uppercase tracking-wide text-muted">Totals</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-card px-4 py-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Donations (month)</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">
              {metrics != null ? money.format(metrics.donations_month) : "—"}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Donations (year)</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">
              {metrics != null ? money.format(metrics.donations_year) : "—"}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Donations (all-time)</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">
              {metrics != null ? money.format(metrics.donations_all_time) : "—"}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Net balance</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">
              {netAllTime != null ? money.format(netAllTime) : "—"}
            </p>
            <p className="mt-1 text-xs text-muted">Donations minus expenses (all-time)</p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-medium uppercase tracking-wide text-muted">Expenses</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card px-4 py-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">All (month)</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">
              {metrics != null ? money.format(metrics.expenses_month) : "—"}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">All (year)</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">
              {metrics != null ? money.format(metrics.expenses_year) : "—"}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted">All (all-time)</p>
            <p className="mt-1 text-xl font-semibold tabular-nums">
              {metrics != null ? money.format(metrics.expenses_all_time) : "—"}
            </p>
          </div>
        </div>
      </section>

      <section>
        <h3 className="text-sm font-medium uppercase tracking-wide text-muted">Breakdown</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-border bg-card px-4 py-4 shadow-sm">
            <p className="text-sm font-medium text-foreground">Assistance (neighbors)</p>
            <p className="mt-2 text-sm text-muted">Month</p>
            <p className="text-lg font-semibold tabular-nums">
              {metrics != null ? money.format(metrics.assistance_expenses_month) : "—"}
            </p>
            <p className="mt-2 text-sm text-muted">Year</p>
            <p className="text-lg font-semibold tabular-nums">
              {metrics != null ? money.format(metrics.assistance_expenses_year) : "—"}
            </p>
            <p className="mt-2 text-sm text-muted">All-time</p>
            <p className="text-lg font-semibold tabular-nums">
              {metrics != null ? money.format(metrics.assistance_expenses_all_time) : "—"}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card px-4 py-4 shadow-sm">
            <p className="text-sm font-medium text-foreground">Conference (no neighbor)</p>
            <p className="mt-2 text-sm text-muted">Month</p>
            <p className="text-lg font-semibold tabular-nums">
              {metrics != null ? money.format(metrics.conference_expenses_month) : "—"}
            </p>
            <p className="mt-2 text-sm text-muted">Year</p>
            <p className="text-lg font-semibold tabular-nums">
              {metrics != null ? money.format(metrics.conference_expenses_year) : "—"}
            </p>
            <p className="mt-2 text-sm text-muted">All-time</p>
            <p className="text-lg font-semibold tabular-nums">
              {metrics != null ? money.format(metrics.conference_expenses_all_time) : "—"}
            </p>
          </div>
        </div>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h3 className="text-sm font-medium uppercase tracking-wide text-muted">
              Recent transactions
            </h3>
            <p className="mt-1 text-xs text-muted">Donations and expenses, newest first.</p>
          </div>
          <Link
            href="/expenses"
            className="text-sm font-medium text-accent hover:underline"
          >
            View all expenses
          </Link>
        </div>
        <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-stone-50 text-xs font-medium uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Detail</th>
                <th className="px-4 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recent.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-muted">
                    No transactions yet.
                  </td>
                </tr>
              ) : (
                recent.map((r) => (
                  <tr key={`${r.kind}-${r.id}`} className="hover:bg-stone-50/80">
                    <td className="px-4 py-3 capitalize text-foreground">{r.kind}</td>
                    <td className="max-w-[280px] px-4 py-3 text-muted">
                      {r.kind === "donation" ? (
                        r.label
                      ) : (
                        <>
                          {formatExpenseCategoryLabel(r.category)}
                          {r.neighbor_name ? (
                            <span className="text-muted"> · {r.neighbor_name}</span>
                          ) : (
                            <span className="text-muted"> · Conference</span>
                          )}
                        </>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: r.currency || "USD",
                      }).format(
                        typeof r.amount === "number" ? r.amount : parseFloat(String(r.amount)) || 0,
                      )}
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
