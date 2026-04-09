import { createClient } from "@/lib/supabase/server";

export type ConferenceFinanceMetrics = {
  donations_month: number;
  donations_year: number;
  donations_all_time: number;
  expenses_month: number;
  expenses_year: number;
  expenses_all_time: number;
  assistance_expenses_month: number;
  assistance_expenses_year: number;
  assistance_expenses_all_time: number;
  conference_expenses_month: number;
  conference_expenses_year: number;
  conference_expenses_all_time: number;
};

function toNum(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v) || 0;
  return 0;
}

function rpcMissing(err: { message?: string; code?: string } | null): boolean {
  if (!err) return false;
  if (err.code === "PGRST202") return true;
  return /does not exist|could not find/i.test(err.message ?? "");
}

export async function loadConferenceFinanceMetrics(): Promise<{
  metrics: ConferenceFinanceMetrics | null;
  rpcMissing: boolean;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("dashboard_conference_finance_metrics");

  if (rpcMissing(error)) {
    return { metrics: null, rpcMissing: true };
  }
  if (error || !data?.length) {
    return { metrics: null, rpcMissing: false };
  }

  const row = data[0] as Record<string, unknown>;
  const metrics: ConferenceFinanceMetrics = {
    donations_month: toNum(row.donations_month),
    donations_year: toNum(row.donations_year),
    donations_all_time: toNum(row.donations_all_time),
    expenses_month: toNum(row.expenses_month),
    expenses_year: toNum(row.expenses_year),
    expenses_all_time: toNum(row.expenses_all_time),
    assistance_expenses_month: toNum(row.assistance_expenses_month),
    assistance_expenses_year: toNum(row.assistance_expenses_year),
    assistance_expenses_all_time: toNum(row.assistance_expenses_all_time),
    conference_expenses_month: toNum(row.conference_expenses_month),
    conference_expenses_year: toNum(row.conference_expenses_year),
    conference_expenses_all_time: toNum(row.conference_expenses_all_time),
  };

  return { metrics, rpcMissing: false };
}

export type RecentFinanceRow =
  | {
      kind: "donation";
      id: string;
      occurred_at: string;
      label: string;
      amount: number;
      currency: string;
    }
  | {
      kind: "expense";
      id: string;
      occurred_at: string;
      category: string;
      amount: number;
      currency: string;
      neighbor_name: string | null;
    };

/** Recent donations + expenses merged (newest first). */
export async function getRecentFinanceTransactions(limit = 25): Promise<RecentFinanceRow[]> {
  const supabase = await createClient();
  const take = Math.min(100, Math.max(1, limit));

  const [{ data: donations }, { data: expenses }] = await Promise.all([
    supabase
      .from("donations")
      .select("id, amount, currency, donation_date, donor_name, created_at")
      .order("donation_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(take),
    supabase
      .from("expenses")
      .select("id, amount, currency, expense_date, category, created_at, neighbor_id, neighbors(full_name)")
      .order("expense_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(take),
  ]);

  const dRows: RecentFinanceRow[] = (donations ?? []).map((d) => ({
    kind: "donation" as const,
    id: d.id,
    occurred_at: (d.created_at as string) ?? "",
    label: (d.donor_name as string | null)?.trim() || "Donation",
    amount: toNum(d.amount),
    currency: (d.currency as string) || "USD",
  }));

  const eRows: RecentFinanceRow[] = (expenses ?? []).map((e) => {
    const n = e.neighbors as { full_name?: string | null } | { full_name?: string | null }[] | null;
    const name = Array.isArray(n) ? n[0]?.full_name : n?.full_name;
    return {
      kind: "expense" as const,
      id: e.id,
      occurred_at: (e.created_at as string) ?? "",
      category: e.category as string,
      amount: toNum(e.amount),
      currency: (e.currency as string) || "USD",
      neighbor_name: name?.trim() ? name : null,
    };
  });

  const merged = [...dRows, ...eRows].sort(
    (a, b) => new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime(),
  );

  return merged.slice(0, take);
}
