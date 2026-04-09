import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

function embeddedUserFullName(users: unknown): string | null {
  if (!users) return null;
  if (Array.isArray(users)) {
    const row = users[0] as { full_name?: string | null } | undefined;
    return row?.full_name ?? null;
  }
  return (users as { full_name?: string | null }).full_name ?? null;
}

/** Columns selected for neighbor profile rows (matches neighbors table + RLS chapter scope). */
export const NEIGHBOR_ROW_SELECT =
  "id, full_name, phone, email, address, notes, created_at, updated_at, " +
  "household_size, adults_count, children_count, dependents_count, composition_notes, " +
  "referral_source, referral_source_other, needs_summary, needs_category";

export type NeighborRow = {
  id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  household_size: number | null;
  adults_count: number | null;
  children_count: number | null;
  dependents_count: number | null;
  composition_notes: string | null;
  referral_source: string | null;
  referral_source_other: string | null;
  needs_summary: string | null;
  needs_category: string | null;
};

/** Conference-scoped neighbors with total financial assistance (same currency assumed). */
export async function getNeighborsWithAssistanceTotals(): Promise<
  (NeighborRow & { assistance_total: number })[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("neighbors_with_assistance_totals")
    .select(`${NEIGHBOR_ROW_SELECT}, assistance_total`)
    .order("full_name", { ascending: true });

  if (error || !data) {
    return [];
  }

  return data.map((n) => {
    const row = n as NeighborRow & { assistance_total: unknown };
    const raw = row.assistance_total;
    const assistance_total =
      typeof raw === "string" ? parseFloat(raw) : Number(raw);
    return {
      ...row,
      assistance_total: Number.isFinite(assistance_total) ? assistance_total : 0,
    };
  });
}

export const getNeighborById = cache(async function getNeighborById(
  id: string,
): Promise<NeighborRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("neighbors")
    .select(NEIGHBOR_ROW_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data as unknown as NeighborRow;
});

export async function getConferenceUsers(): Promise<
  { id: string; full_name: string | null; email: string | null; role: string }[]
> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("users")
    .select("id, full_name, email, role")
    .order("full_name", { ascending: true });

  return (data ?? []) as {
    id: string;
    full_name: string | null;
    email: string | null;
    role: string;
  }[];
}

/** Lightweight list for selects (e.g. task neighbor link). */
export async function getNeighborOptions(): Promise<{ id: string; full_name: string }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("neighbors")
    .select("id, full_name")
    .order("full_name", { ascending: true });

  return (data ?? []) as { id: string; full_name: string }[];
}

export type VisitListItem = {
  id: string;
  visit_date: string;
  notes: string | null;
  next_steps: string | null;
  volunteer_name: string | null;
};

export type CallListItem = {
  id: string;
  call_date: string;
  summary: string | null;
  volunteer_name: string | null;
};

export async function getVisitsForNeighbor(neighborId: string): Promise<VisitListItem[]> {
  const supabase = await createClient();
  const { data: visits } = await supabase
    .from("visits")
    .select("id, visit_date, notes, next_steps, volunteer_id, users(full_name)")
    .eq("neighbor_id", neighborId)
    .order("visit_date", { ascending: false });

  if (!visits?.length) return [];

  return visits.map((v) => ({
    id: v.id,
    visit_date: v.visit_date,
    notes: v.notes,
    next_steps: v.next_steps,
    volunteer_name: embeddedUserFullName(v.users),
  }));
}

export async function getCallsForNeighbor(neighborId: string): Promise<CallListItem[]> {
  const supabase = await createClient();
  const { data: calls } = await supabase
    .from("calls")
    .select("id, call_date, summary, volunteer_id, users(full_name)")
    .eq("neighbor_id", neighborId)
    .order("call_date", { ascending: false });

  if (!calls?.length) return [];

  return calls.map((c) => ({
    id: c.id,
    call_date: c.call_date,
    summary: c.summary,
    volunteer_name: embeddedUserFullName(c.users),
  }));
}

export async function getAssistanceForNeighbor(neighborId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("expenses")
    .select("id, amount, currency, expense_date, category, notes, check_number, created_at, recorded_by, users(full_name)")
    .eq("neighbor_id", neighborId)
    .order("expense_date", { ascending: false });

  if (!data?.length) return [];

  return data.map((row) => ({
    id: row.id,
    amount: row.amount,
    currency: row.currency,
    assistance_date: row.expense_date,
    category: row.category,
    notes: row.notes,
    check_number: row.check_number,
    created_at: row.created_at,
    recorded_by_name: embeddedUserFullName(row.users),
  }));
}

export async function getAssistanceSumForNeighbor(neighborId: string): Promise<number> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("sum_expenses_for_neighbor", {
    p_neighbor_id: neighborId,
  });
  if (!error && data !== null && data !== undefined) {
    const n = typeof data === "number" ? data : parseFloat(String(data));
    return Number.isFinite(n) ? n : 0;
  }
  const rows = await getAssistanceForNeighbor(neighborId);
  return rows.reduce((sum, r) => {
    const amt = typeof r.amount === "string" ? parseFloat(r.amount) : Number(r.amount);
    return sum + (Number.isFinite(amt) ? amt : 0);
  }, 0);
}

export type NeighborVisitEditRow = {
  id: string;
  visit_date: string;
  notes: string | null;
  next_steps: string | null;
  volunteer_id: string | null;
};

export const getVisitForNeighborEdit = cache(async function getVisitForNeighborEdit(
  neighborId: string,
  visitId: string,
): Promise<NeighborVisitEditRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("visits")
    .select("id, visit_date, notes, next_steps, volunteer_id")
    .eq("id", visitId)
    .eq("neighbor_id", neighborId)
    .maybeSingle();

  if (error || !data) return null;
  return data as NeighborVisitEditRow;
});

export type NeighborCallEditRow = {
  id: string;
  call_date: string;
  summary: string | null;
  volunteer_id: string | null;
};

export const getCallForNeighborEdit = cache(async function getCallForNeighborEdit(
  neighborId: string,
  callId: string,
): Promise<NeighborCallEditRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("calls")
    .select("id, call_date, summary, volunteer_id")
    .eq("id", callId)
    .eq("neighbor_id", neighborId)
    .maybeSingle();

  if (error || !data) return null;
  return data as NeighborCallEditRow;
});

export type NeighborAssistanceEditRow = {
  id: string;
  amount: number | string;
  currency: string;
  assistance_date: string;
  category: string;
  notes: string | null;
  check_number: string | null;
};

export const getAssistanceForNeighborEdit = cache(async function getAssistanceForNeighborEdit(
  neighborId: string,
  assistanceId: string,
): Promise<NeighborAssistanceEditRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("expenses")
    .select("id, amount, currency, expense_date, category, notes, check_number")
    .eq("id", assistanceId)
    .eq("neighbor_id", neighborId)
    .maybeSingle();

  if (error || !data) return null;
  const row = data as {
    id: string;
    amount: number | string;
    currency: string;
    expense_date: string;
    category: string;
    notes: string | null;
    check_number: string | null;
  };
  return {
    id: row.id,
    amount: row.amount,
    currency: row.currency,
    assistance_date: row.expense_date,
    category: row.category,
    notes: row.notes,
    check_number: row.check_number,
  };
});
