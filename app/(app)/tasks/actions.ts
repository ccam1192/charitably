"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import type { TaskStatus, TaskType } from "@/lib/data/tasks";

async function getMyChapterId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("users")
    .select("chapter_id")
    .eq("id", user.id)
    .maybeSingle();
  return data?.chapter_id ?? null;
}

function str(v: FormDataEntryValue | null): string | null {
  if (v == null || typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

const TASK_TYPES: TaskType[] = ["visit", "call", "follow_up"];

function safeReturnTo(raw: FormDataEntryValue | null): string {
  if (raw == null || typeof raw !== "string") return "/tasks";
  const t = raw.trim();
  if (!t.startsWith("/") || t.startsWith("//")) return "/tasks";
  return t;
}

function parseTaskType(raw: string | null): TaskType | null {
  if (!raw || !TASK_TYPES.includes(raw as TaskType)) return null;
  return raw as TaskType;
}

export async function createTask(formData: FormData) {
  const chapterId = await getMyChapterId();
  if (!chapterId) redirect("/login");

  const task_type = parseTaskType(str(formData.get("task_type")));
  if (!task_type) {
    redirect("/tasks/new?error=" + encodeURIComponent("Task type is required"));
  }

  const supabase = await createClient();
  const assignedRaw = str(formData.get("assigned_to"));
  const neighborRaw = str(formData.get("related_neighbor_id"));

  const { error } = await supabase.from("tasks").insert({
    chapter_id: chapterId,
    task_type,
    status: "pending",
    assigned_to: assignedRaw,
    related_neighbor_id: neighborRaw,
    notes: str(formData.get("notes")),
    due_date: str(formData.get("due_date")),
  });

  if (error) {
    redirect("/tasks/new?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  redirect("/tasks");
}

/** Create a task tied to this neighbor; used from `/neighbors/[id]/tasks/new`. */
export async function updateTask(taskId: string, formData: FormData) {
  const chapterId = await getMyChapterId();
  if (!chapterId) redirect("/login");

  const task_type = parseTaskType(str(formData.get("task_type")));
  if (!task_type) {
    redirect(`/tasks/${taskId}/edit?error=` + encodeURIComponent("Task type is required"));
  }

  const statusRaw = str(formData.get("status"));
  if (statusRaw !== "pending" && statusRaw !== "completed") {
    redirect(`/tasks/${taskId}/edit?error=` + encodeURIComponent("Status is required"));
  }
  const status = statusRaw as TaskStatus;

  const supabase = await createClient();
  const assignedRaw = str(formData.get("assigned_to"));
  const neighborRaw = str(formData.get("related_neighbor_id"));

  const { error } = await supabase
    .from("tasks")
    .update({
      task_type,
      status,
      assigned_to: assignedRaw,
      related_neighbor_id: neighborRaw,
      notes: str(formData.get("notes")),
      due_date: str(formData.get("due_date")),
    })
    .eq("id", taskId);

  if (error) {
    redirect(`/tasks/${taskId}/edit?error=` + encodeURIComponent(error.message));
  }

  await revalidateTaskPaths(taskId);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  redirect(safeReturnTo(formData.get("return_to")));
}

export async function createTaskForNeighbor(neighborId: string, formData: FormData) {
  const chapterId = await getMyChapterId();
  if (!chapterId) redirect("/login");

  const task_type = parseTaskType(str(formData.get("task_type")));
  if (!task_type) {
    redirect(
      `/neighbors/${neighborId}/tasks/new?error=` + encodeURIComponent("Task type is required"),
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const volunteerRaw = str(formData.get("assigned_to"));
  const assigned_to = volunteerRaw || user?.id || null;

  const { error } = await supabase.from("tasks").insert({
    chapter_id: chapterId,
    task_type,
    status: "pending",
    assigned_to,
    related_neighbor_id: neighborId,
    notes: str(formData.get("notes")),
    due_date: str(formData.get("due_date")),
  });

  if (error) {
    redirect(
      `/neighbors/${neighborId}/tasks/new?error=` + encodeURIComponent(error.message),
    );
  }

  revalidatePath("/tasks");
  revalidatePath(`/neighbors/${neighborId}/tasks`);
  revalidatePath("/dashboard");
  redirect(`/neighbors/${neighborId}/tasks`);
}

export async function updateTaskAssignment(taskId: string, formData: FormData) {
  const chapterId = await getMyChapterId();
  if (!chapterId) redirect("/login");

  const supabase = await createClient();
  const assignedRaw = str(formData.get("assigned_to"));

  const { error } = await supabase
    .from("tasks")
    .update({ assigned_to: assignedRaw })
    .eq("id", taskId);

  if (error) {
    redirect("/tasks?error=" + encodeURIComponent(error.message));
  }

  await revalidateTaskPaths(taskId);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  redirect("/tasks");
}

async function revalidateTaskPaths(taskId: string) {
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("tasks")
    .select("related_neighbor_id")
    .eq("id", taskId)
    .maybeSingle();
  if (row?.related_neighbor_id) {
    revalidatePath(`/neighbors/${row.related_neighbor_id}/tasks`);
  }
}

export async function updateNeighborTaskAssignment(
  neighborId: string,
  taskId: string,
  formData: FormData,
) {
  const chapterId = await getMyChapterId();
  if (!chapterId) redirect("/login");

  const supabase = await createClient();
  const assignedRaw = str(formData.get("assigned_to"));

  const { error } = await supabase
    .from("tasks")
    .update({ assigned_to: assignedRaw })
    .eq("id", taskId)
    .eq("related_neighbor_id", neighborId);

  if (error) {
    redirect(
      `/neighbors/${neighborId}/tasks?error=` + encodeURIComponent(error.message),
    );
  }

  revalidatePath("/tasks");
  revalidatePath(`/neighbors/${neighborId}/tasks`);
  revalidatePath("/dashboard");
  redirect(`/neighbors/${neighborId}/tasks`);
}

export async function completeNeighborTask(neighborId: string, taskId: string, formData?: FormData) {
  void formData;
  const chapterId = await getMyChapterId();
  if (!chapterId) redirect("/login");

  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ status: "completed" })
    .eq("id", taskId)
    .eq("related_neighbor_id", neighborId)
    .eq("status", "pending");

  if (error) {
    redirect(
      `/neighbors/${neighborId}/tasks?error=` + encodeURIComponent(error.message),
    );
  }

  revalidatePath("/tasks");
  revalidatePath(`/neighbors/${neighborId}/tasks`);
  revalidatePath("/dashboard");
  redirect(`/neighbors/${neighborId}/tasks`);
}

export async function completeTask(taskId: string, formData?: FormData) {
  void formData;
  const chapterId = await getMyChapterId();
  if (!chapterId) redirect("/login");

  const supabase = await createClient();
  const { error } = await supabase
    .from("tasks")
    .update({ status: "completed" })
    .eq("id", taskId)
    .eq("status", "pending");

  if (error) {
    redirect("/tasks?error=" + encodeURIComponent(error.message));
  }

  await revalidateTaskPaths(taskId);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  redirect("/tasks");
}
