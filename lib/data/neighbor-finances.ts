import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type {
  NeighborFinanceMonthlySummary,
  NeighborFinanceRow,
} from "@/lib/types/neighbor-finance";

function num(v: unknown): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v === "string") {
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  }
  return 0;
}

export async function getNeighborFinances(neighborId: string): Promise<NeighborFinanceRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("neighbor_finances")
    .select(
      "id, chapter_id, neighbor_id, type, category, amount, frequency, source, notes, created_at, updated_at",
    )
    .eq("neighbor_id", neighborId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as NeighborFinanceRow[];
}

export const getNeighborFinanceEntry = cache(async function getNeighborFinanceEntry(
  neighborId: string,
  entryId: string,
): Promise<NeighborFinanceRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("neighbor_finances")
    .select(
      "id, chapter_id, neighbor_id, type, category, amount, frequency, source, notes, created_at, updated_at",
    )
    .eq("id", entryId)
    .eq("neighbor_id", neighborId)
    .maybeSingle();

  if (error || !data) return null;
  return data as NeighborFinanceRow;
});

/** Monthly totals exclude one-time entries (same rules as `neighbor_finance_monthly_summary` in SQL). */
export function computeMonthlySummaryFromRows(
  rows: Pick<NeighborFinanceRow, "type" | "amount" | "frequency">[],
): NeighborFinanceMonthlySummary {
  let income = 0;
  let expenses = 0;
  for (const row of rows) {
    if (row.frequency === "one-time") continue;
    const a = num(row.amount);
    if (row.type === "income") income += a;
    else if (row.type === "expense") expenses += a;
  }
  const net = income - expenses;
  return {
    total_monthly_income: Math.round(income * 100) / 100,
    total_monthly_expenses: Math.round(expenses * 100) / 100,
    net_monthly_balance: Math.round(net * 100) / 100,
  };
}
