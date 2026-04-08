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

export type AssistanceListRow = {
  id: string;
  assistance_date: string;
  amount: number | string;
  currency: string;
  category: string;
  check_number: string | null;
  neighbor_id: string;
  neighbor_name: string;
  recorded_by_name: string | null;
};

function toAmount(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v) || 0;
  return 0;
}

/** Total entries and sum of amounts for the conference (all rows). */
export async function getAssistanceConferenceSummary(): Promise<{ count: number; sum: number }> {
  const supabase = await createClient();

  const [{ count }, { data: amountRows }] = await Promise.all([
    supabase.from("financial_assistance").select("id", { count: "exact", head: true }),
    supabase.from("financial_assistance").select("amount"),
  ]);

  const sum = (amountRows ?? []).reduce((s, r) => s + toAmount(r.amount), 0);

  return { count: count ?? 0, sum };
}

/**
 * Paginated assistance rows, newest first.
 * @param page 1-based page index
 */
export async function getAssistancePage(page: number): Promise<{
  rows: AssistanceListRow[];
  totalCount: number;
  pageSize: number;
}> {
  const supabase = await createClient();
  const pageIndex = Math.max(1, Math.floor(page));
  const from = (pageIndex - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: fa, error, count } = await supabase
    .from("financial_assistance")
    .select("id, amount, currency, assistance_date, category, check_number, neighbor_id, users(full_name)", {
      count: "exact",
    })
    .order("assistance_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return { rows: [], totalCount: 0, pageSize: PAGE_SIZE };
  }

  if (!fa?.length) {
    return { rows: [], totalCount: count ?? 0, pageSize: PAGE_SIZE };
  }

  const nIds = [...new Set(fa.map((r) => r.neighbor_id))];
  const { data: neighbors } = await supabase
    .from("neighbors")
    .select("id, full_name")
    .in("id", nIds);

  const names = new Map<string, string>();
  for (const n of neighbors ?? []) {
    names.set(n.id, n.full_name);
  }

  const rows: AssistanceListRow[] = fa.map((r) => ({
    id: r.id,
    assistance_date: r.assistance_date,
    amount: r.amount,
    currency: r.currency,
    category: r.category,
    check_number: r.check_number,
    neighbor_id: r.neighbor_id,
    neighbor_name: names.get(r.neighbor_id) ?? "Unknown",
    recorded_by_name: embeddedUserFullName(r.users),
  }));

  return { rows, totalCount: count ?? 0, pageSize: PAGE_SIZE };
}
