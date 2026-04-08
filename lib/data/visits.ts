import { createClient } from "@/lib/supabase/server";

const PAGE_SIZE = 50;

export type VisitListRow = {
  id: string;
  visit_date: string;
  notes: string | null;
  next_steps: string | null;
  neighbor_id: string;
  neighbor_name: string;
  volunteer_id: string | null;
  volunteer_name: string | null;
};

/**
 * Paginated conference visits, newest first.
 * @param page 1-based page index
 */
export async function getVisitsPage(page: number): Promise<{
  rows: VisitListRow[];
  totalCount: number;
  pageSize: number;
}> {
  const supabase = await createClient();
  const pageIndex = Math.max(1, Math.floor(page));
  const from = (pageIndex - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data: visits, error, count } = await supabase
    .from("visits")
    .select("id, visit_date, notes, next_steps, neighbor_id, volunteer_id", { count: "exact" })
    .order("visit_date", { ascending: false })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) {
    return { rows: [], totalCount: 0, pageSize: PAGE_SIZE };
  }

  if (!visits?.length) {
    return { rows: [], totalCount: count ?? 0, pageSize: PAGE_SIZE };
  }

  const nIds = [...new Set(visits.map((v) => v.neighbor_id))];
  const vIds = [
    ...new Set(visits.map((v) => v.volunteer_id).filter(Boolean)),
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

  const rows: VisitListRow[] = visits.map((v) => ({
    id: v.id,
    visit_date: v.visit_date,
    notes: v.notes,
    next_steps: v.next_steps,
    neighbor_id: v.neighbor_id,
    neighbor_name: nNames.get(v.neighbor_id) ?? "Unknown",
    volunteer_id: v.volunteer_id,
    volunteer_name: v.volunteer_id ? volNames.get(v.volunteer_id) ?? null : null,
  }));

  return { rows, totalCount: count ?? 0, pageSize: PAGE_SIZE };
}
