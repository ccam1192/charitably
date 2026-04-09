import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 50;

function embeddedUserFullName(users: unknown): string | null {
  if (!users) return null;
  if (Array.isArray(users)) {
    const row = users[0] as { full_name?: string | null } | undefined;
    return row?.full_name ?? null;
  }
  return (users as { full_name?: string | null }).full_name ?? null;
}

export type ExpenseListRow = {
  id: string;
  expense_date: string;
  amount: number | string;
  currency: string;
  category: string;
  check_number: string | null;
  neighbor_id: string | null;
  neighbor_name: string;
  recorded_by_name: string | null;
};

function toAmount(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v) || 0;
  return 0;
}

/** Total entries and sum of amounts for visible expenses (RLS-scoped). */
export async function getExpensesConferenceSummary(): Promise<{ count: number; sum: number }> {
  const supabase = await createClient();

  const [{ count }, { data: amountRows }] = await Promise.all([
    supabase.from("expenses").select("id", { count: "exact", head: true }),
    supabase.from("expenses").select("amount"),
  ]);

  const sum = (amountRows ?? []).reduce((s, r) => s + toAmount(r.amount), 0);

  return { count: count ?? 0, sum };
}

/** Neighbor-linked assistance expenses only (excludes conference rows; RLS-scoped). */
export async function getNeighborAssistanceSummary(): Promise<{ count: number; sum: number }> {
  const supabase = await createClient();

  const [{ count }, { data: amountRows }] = await Promise.all([
    supabase.from("expenses").select("id", { count: "exact", head: true }).not("neighbor_id", "is", null),
    supabase.from("expenses").select("amount").not("neighbor_id", "is", null),
  ]);

  const sum = (amountRows ?? []).reduce((s, r) => s + toAmount(r.amount), 0);

  return { count: count ?? 0, sum };
}

export type ExpenseListFilters = {
  category?: string;
  from?: string;
  to?: string;
  /** "neighbor" | "conference" | "all" */
  scope?: "neighbor" | "conference" | "all";
};

/**
 * Paginated expense rows, newest first (RLS-scoped).
 * @param page 1-based page index
 */
export async function getExpensesPage(
  page: number,
  filters: ExpenseListFilters = {},
): Promise<{
  rows: ExpenseListRow[];
  totalCount: number;
  pageSize: number;
}> {
  const supabase = await createClient();
  const pageIndex = Math.max(1, Math.floor(page));
  const from = (pageIndex - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let q = supabase
    .from("expenses")
    .select("id, amount, currency, expense_date, category, check_number, neighbor_id, users(full_name)", {
      count: "exact",
    });

  if (filters.category?.trim()) {
    q = q.eq("category", filters.category.trim());
  }
  if (filters.from?.trim()) {
    q = q.gte("expense_date", filters.from.trim());
  }
  if (filters.to?.trim()) {
    q = q.lte("expense_date", filters.to.trim());
  }
  if (filters.scope === "neighbor") {
    q = q.not("neighbor_id", "is", null);
  } else if (filters.scope === "conference") {
    q = q.is("neighbor_id", null);
  }

  const { data: rows, error, count } = await q
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return { rows: [], totalCount: 0, pageSize: PAGE_SIZE };
  }

  if (!rows?.length) {
    return { rows: [], totalCount: count ?? 0, pageSize: PAGE_SIZE };
  }

  const nIds = [...new Set(rows.map((r) => r.neighbor_id).filter(Boolean))] as string[];
  const { data: neighbors } =
    nIds.length > 0
      ? await supabase.from("neighbors").select("id, full_name").in("id", nIds)
      : { data: [] as { id: string; full_name: string }[] };

  const names = new Map<string, string>();
  for (const n of neighbors ?? []) {
    names.set(n.id, n.full_name);
  }

  const out: ExpenseListRow[] = rows.map((r) => ({
    id: r.id,
    expense_date: r.expense_date as string,
    amount: r.amount,
    currency: r.currency as string,
    category: r.category as string,
    check_number: r.check_number as string | null,
    neighbor_id: r.neighbor_id as string | null,
    neighbor_name: r.neighbor_id ? (names.get(r.neighbor_id) ?? "Unknown") : "—",
    recorded_by_name: embeddedUserFullName(r.users),
  }));

  return { rows: out, totalCount: count ?? 0, pageSize: PAGE_SIZE };
}
