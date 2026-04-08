import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 50;

export type CallListRow = {
  id: string;
  call_date: string;
  summary: string | null;
  neighbor_id: string;
  neighbor_name: string;
  volunteer_id: string | null;
  volunteer_name: string | null;
};

/**
 * Paginated conference calls, newest first.
 * @param page 1-based page index
 */
export async function getCallsPage(page: number): Promise<{
  rows: CallListRow[];
  totalCount: number;
  pageSize: number;
}> {
  const supabase = await createClient();
  const pageIndex = Math.max(1, Math.floor(page));
  const from = (pageIndex - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: calls, error, count } = await supabase
    .from("calls")
    .select("id, call_date, summary, neighbor_id, volunteer_id", { count: "exact" })
    .order("call_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return { rows: [], totalCount: 0, pageSize: PAGE_SIZE };
  }

  if (!calls?.length) {
    return { rows: [], totalCount: count ?? 0, pageSize: PAGE_SIZE };
  }

  const nIds = [...new Set(calls.map((c) => c.neighbor_id))];
  const vIds = [
    ...new Set(calls.map((c) => c.volunteer_id).filter(Boolean)),
  ] as string[];

  const [{ data: neighbors }, { data: volunteers }] = await Promise.all([
    supabase.from("neighbors").select("id, full_name").in("id", nIds),
    vIds.length
      ? supabase.from("users").select("id, full_name").in("id", vIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string | null }[] }),
  ]);

  const nNames = new Map<string, string>();
  for (const n of neighbors ?? []) nNames.set(n.id, n.full_name);

  const volNames = new Map<string, string | null>();
  for (const u of volunteers ?? []) volNames.set(u.id, u.full_name);

  const rows: CallListRow[] = calls.map((c) => ({
    id: c.id,
    call_date: c.call_date,
    summary: c.summary,
    neighbor_id: c.neighbor_id,
    neighbor_name: nNames.get(c.neighbor_id) ?? "Unknown",
    volunteer_id: c.volunteer_id,
    volunteer_name: c.volunteer_id ? volNames.get(c.volunteer_id) ?? null : null,
  }));

  return { rows, totalCount: count ?? 0, pageSize: PAGE_SIZE };
}
