import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type TaskType = "visit" | "call" | "follow_up";
export type TaskStatus = "pending" | "completed";

export type TaskListRow = {
  id: string;
  task_type: TaskType;
  status: TaskStatus;
  due_date: string | null;
  notes: string | null;
  assigned_to: string | null;
  assignee_name: string | null;
  related_neighbor_id: string | null;
  neighbor_name: string | null;
  created_at: string;
};

/** Single task row for edit forms (no joined names). */
export type TaskEditRow = {
  id: string;
  task_type: TaskType;
  status: TaskStatus;
  due_date: string | null;
  notes: string | null;
  assigned_to: string | null;
  related_neighbor_id: string | null;
};

export const getTaskForEdit = cache(async function getTaskForEdit(
  taskId: string,
): Promise<TaskEditRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("tasks")
    .select("id, task_type, status, due_date, notes, assigned_to, related_neighbor_id")
    .eq("id", taskId)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: data.id,
    task_type: data.task_type as TaskType,
    status: data.status as TaskStatus,
    due_date: data.due_date,
    notes: data.notes,
    assigned_to: data.assigned_to,
    related_neighbor_id: data.related_neighbor_id,
  };
});

function mapTasks(
  tasks: {
    id: string;
    task_type: string;
    status: string;
    due_date: string | null;
    notes: string | null;
    assigned_to: string | null;
    related_neighbor_id: string | null;
    created_at: string;
  }[],
  userNames: Map<string, string | null>,
  neighborNames: Map<string, string>,
): TaskListRow[] {
  return tasks.map((t) => ({
    id: t.id,
    task_type: t.task_type as TaskType,
    status: t.status as TaskStatus,
    due_date: t.due_date,
    notes: t.notes,
    assigned_to: t.assigned_to,
    assignee_name: t.assigned_to ? userNames.get(t.assigned_to) ?? null : null,
    related_neighbor_id: t.related_neighbor_id,
    neighbor_name: t.related_neighbor_id
      ? neighborNames.get(t.related_neighbor_id) ?? null
      : null,
    created_at: t.created_at,
  }));
}

export async function getTasksForConference(): Promise<TaskListRow[]> {
  const supabase = await createClient();
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select(
      "id, task_type, status, due_date, notes, assigned_to, related_neighbor_id, created_at",
    )
    .order("created_at", { ascending: false });

  if (error || !tasks?.length) return [];

  const userIds = [...new Set(tasks.map((t) => t.assigned_to).filter(Boolean))] as string[];
  const neighborIds = [
    ...new Set(tasks.map((t) => t.related_neighbor_id).filter(Boolean)),
  ] as string[];

  const userNames = new Map<string, string | null>();
  const neighborNames = new Map<string, string>();
  const [usersRes, neighborsRes] = await Promise.all([
    userIds.length
      ? supabase.from("users").select("id, full_name").in("id", userIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string | null }[] }),
    neighborIds.length
      ? supabase.from("neighbors").select("id, full_name").in("id", neighborIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string }[] }),
  ]);
  for (const u of usersRes.data ?? []) userNames.set(u.id, u.full_name);
  for (const n of neighborsRes.data ?? []) neighborNames.set(n.id, n.full_name);

  return mapTasks(tasks, userNames, neighborNames);
}

/** Tasks linked to a specific neighbor (`related_neighbor_id`). */
export async function getTasksForNeighbor(neighborId: string): Promise<TaskListRow[]> {
  const supabase = await createClient();
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select(
      "id, task_type, status, due_date, notes, assigned_to, related_neighbor_id, created_at",
    )
    .eq("related_neighbor_id", neighborId)
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error || !tasks?.length) return [];

  const userIds = [...new Set(tasks.map((t) => t.assigned_to).filter(Boolean))] as string[];
  const userNames = new Map<string, string | null>();
  const neighborNames = new Map<string, string>();

  const [usersRes, nRowRes] = await Promise.all([
    userIds.length
      ? supabase.from("users").select("id, full_name").in("id", userIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string | null }[] }),
    supabase.from("neighbors").select("id, full_name").eq("id", neighborId).maybeSingle(),
  ]);
  for (const u of usersRes.data ?? []) userNames.set(u.id, u.full_name);
  if (nRowRes.data) neighborNames.set(nRowRes.data.id, nRowRes.data.full_name);

  return mapTasks(tasks, userNames, neighborNames);
}

export async function getMyPendingTasks(userId: string, limit = 5): Promise<TaskListRow[]> {
  const supabase = await createClient();
  const { data: tasks, error } = await supabase
    .from("tasks")
    .select(
      "id, task_type, status, due_date, notes, assigned_to, related_neighbor_id, created_at",
    )
    .eq("assigned_to", userId)
    .eq("status", "pending")
    .order("due_date", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !tasks?.length) return [];

  const neighborIds = [
    ...new Set(tasks.map((t) => t.related_neighbor_id).filter(Boolean)),
  ] as string[];

  const userNames = new Map<string, string | null>([[userId, null]]);
  const neighborNames = new Map<string, string>();

  const [selfRes, neighborsRes] = await Promise.all([
    supabase.from("users").select("id, full_name").eq("id", userId).maybeSingle(),
    neighborIds.length
      ? supabase.from("neighbors").select("id, full_name").in("id", neighborIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string }[] }),
  ]);
  if (selfRes.data) userNames.set(selfRes.data.id, selfRes.data.full_name);
  for (const n of neighborsRes.data ?? []) neighborNames.set(n.id, n.full_name);

  return mapTasks(tasks, userNames, neighborNames);
}

/** Count of pending tasks assigned to the user (for dashboard stats). */
export async function getMyPendingTaskCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("tasks")
    .select("id", { count: "exact", head: true })
    .eq("assigned_to", userId)
    .eq("status", "pending");

  if (error) return 0;
  return count ?? 0;
}
