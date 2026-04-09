import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  getExpensesPage,
  type ExpenseListFilters,
} from "@/lib/data/assistance";
import {
  ASSISTANCE_EXPENSE_CATEGORY_OPTIONS,
  CONFERENCE_EXPENSE_CATEGORY_OPTIONS,
  formatExpenseCategoryLabel,
} from "@/lib/expenses";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatMoney(amount: number | string, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
    }).format(typeof amount === "number" ? amount : parseFloat(String(amount)) || 0);
  } catch {
    return money.format(typeof amount === "number" ? amount : parseFloat(String(amount)) || 0);
  }
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    category?: string;
    from?: string;
    to?: string;
    scope?: string;
  }>;
}) {
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

  const params = await searchParams;
  const pageRaw = params.page ? parseInt(params.page, 10) : 1;
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const filters: ExpenseListFilters = {
    category: params.category,
    from: params.from,
    to: params.to,
    scope:
      params.scope === "neighbor" || params.scope === "conference" || params.scope === "all"
        ? params.scope
        : "all",
  };

  const { rows, totalCount, pageSize } = await getExpensesPage(page, filters);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  const qs = new URLSearchParams();
  if (filters.category) qs.set("category", filters.category);
  if (filters.from) qs.set("from", filters.from);
  if (filters.to) qs.set("to", filters.to);
  if (filters.scope && filters.scope !== "all") qs.set("scope", filters.scope);
  const filterQuery = qs.toString();

  const pageHref = (p: number) => {
    const q = new URLSearchParams(filterQuery);
    if (p > 1) q.set("page", String(p));
    const s = q.toString();
    return s ? `/expenses?${s}` : "/expenses";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Expenses</h2>
          <p className="mt-1 text-sm text-muted">
            Conference and neighbor assistance expenses (newest first).
          </p>
        </div>
        <Link
          href="/expenses/new"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
        >
          Add expense
        </Link>
      </div>

      <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground">Filters</h3>
        <form
          className="mt-4 flex flex-wrap items-end gap-3"
          method="get"
        >
        <div>
          <label htmlFor="scope" className="block text-xs font-medium text-muted">
            Scope
          </label>
          <select
            id="scope"
            name="scope"
            defaultValue={filters.scope ?? "all"}
            className="mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="all">All</option>
            <option value="neighbor">Neighbor Assistance</option>
            <option value="conference">Conference Expenses</option>
          </select>
        </div>
        <div>
          <label htmlFor="category" className="block text-xs font-medium text-muted">
            Category
          </label>
          <select
            id="category"
            name="category"
            defaultValue={filters.category ?? ""}
            className="mt-1 min-w-[12rem] rounded-md border border-border bg-background px-3 py-2 text-sm"
          >
            <option value="">Any</option>
            <optgroup label="Assistance">
              {ASSISTANCE_EXPENSE_CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Conference">
              {CONFERENCE_EXPENSE_CATEGORY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
        <div>
          <label htmlFor="from" className="block text-xs font-medium text-muted">
            From
          </label>
          <input
            id="from"
            type="date"
            name="from"
            defaultValue={filters.from ?? ""}
            className="mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="to" className="block text-xs font-medium text-muted">
            To
          </label>
          <input
            id="to"
            type="date"
            name="to"
            defaultValue={filters.to ?? ""}
            className="mt-1 rounded-md border border-border bg-background px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-stone-800 px-4 py-2 text-sm font-medium text-white hover:bg-stone-700"
        >
          Apply
        </button>
      </form>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead className="border-b border-border bg-stone-50 text-xs font-medium uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Neighbor</th>
                <th className="px-4 py-3">Check #</th>
                <th className="px-4 py-3">Recorded by</th>
                <th className="px-4 py-3 text-right" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted">
                    No expenses match these filters.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="transition hover:bg-stone-50/80">
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-foreground">
                      {r.expense_date}
                    </td>
                    <td className="max-w-[200px] px-4 py-3 text-muted">
                      {formatExpenseCategoryLabel(r.category)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-foreground">
                      {formatMoney(r.amount, r.currency)}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {r.neighbor_id ? (
                        <Link
                          href={`/neighbors/${r.neighbor_id}`}
                          className="font-medium text-accent hover:underline"
                        >
                          {r.neighbor_name}
                        </Link>
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="max-w-[140px] px-4 py-3 text-muted">{r.check_number ?? "—"}</td>
                    <td className="max-w-[160px] px-4 py-3 text-muted">{r.recorded_by_name ?? "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      {r.neighbor_id ? (
                        <Link
                          href={`/neighbors/${r.neighbor_id}/assistance/${r.id}/edit`}
                          className="text-xs font-medium text-accent hover:underline"
                        >
                          Edit
                        </Link>
                      ) : (
                        <Link
                          href={`/expenses/${r.id}/edit`}
                          className="text-xs font-medium text-accent hover:underline"
                        >
                          Edit
                        </Link>
                      )}
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
                  href={pageHref(page - 1)}
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
                  href={pageHref(page + 1)}
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
