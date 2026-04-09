import { createClient } from "@/lib/supabase/server";

export type FinancialStats = {
  expenses_this_month: number;
  expenses_all_time: number;
  donations_all_time: number;
};

export type ActivityRow = {
  activity_type: string;
  occurred_at: string;
  title: string;
  detail: string | null;
  neighbor_name: string;
  /** Present when RPC migration 00004 is applied */
  record_id?: string;
  neighbor_id?: string;
};

export type AssistanceRow = {
  id: string;
  assistance_date: string;
  amount: number | string;
  currency: string;
  category: string;
  neighbor_name: string;
  neighbor_id?: string;
};

export type DashboardData = {
  stats: FinancialStats | null;
  activity: ActivityRow[];
  assistanceRows: AssistanceRow[];
  rpcMissing: boolean;
};

function rpcUnavailable(err: { message?: string; code?: string } | null): boolean {
  if (!err) return false;
  const msg = err.message ?? "";
  if (err.code === "PGRST202") return true;
  return /does not exist|could not find/i.test(msg);
}

function toNum(v: unknown): number {
  if (typeof v === "number") return v;
  if (typeof v === "string") return parseFloat(v) || 0;
  return 0;
}

/** Loads dashboard aggregates via SQL RPCs (see 00003_dashboard_rpcs.sql). */
export async function loadDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();

  const [statsRes, activityRes, assistanceRes] = await Promise.all([
    supabase.rpc("dashboard_financial_stats"),
    supabase.rpc("dashboard_recent_activity", { p_limit: 12 }),
    supabase.rpc("dashboard_recent_assistance", { p_limit: 8 }),
  ]);

  if (rpcUnavailable(statsRes.error)) {
    return { stats: null, activity: [], assistanceRows: [], rpcMissing: true };
  }

  let stats: FinancialStats | null = null;
  if (!statsRes.error && statsRes.data?.length) {
    const row = statsRes.data[0] as Record<string, unknown>;
    stats = {
      expenses_this_month: toNum(row.expenses_this_month ?? row.assistance_this_month),
      expenses_all_time: toNum(row.expenses_all_time ?? row.assistance_all_time),
      donations_all_time: toNum(row.donations_all_time),
    };
  }

  return {
    stats,
    activity: (activityRes.data ?? []) as ActivityRow[],
    assistanceRows: (assistanceRes.data ?? []) as AssistanceRow[],
    rpcMissing: false,
  };
}

/** Neighbors in your conference (RLS-scoped). Used as “active” served households. */
export async function getNeighborCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("neighbors")
    .select("id", { count: "exact", head: true });
  if (error) return 0;
  return count ?? 0;
}
