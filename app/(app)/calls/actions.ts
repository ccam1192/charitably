"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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

/** Log a call from the global /calls/new form. */
export async function createCallFromGlobalForm(formData: FormData) {
  const chapterId = await getMyChapterId();
  if (!chapterId) redirect("/login");

  const neighborId = str(formData.get("neighbor_id"));
  if (!neighborId) {
    redirect("/calls/new?error=" + encodeURIComponent("Neighbor is required"));
  }

  const call_date = str(formData.get("call_date"));
  if (!call_date) {
    redirect("/calls/new?error=" + encodeURIComponent("Date is required"));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const volunteerRaw = str(formData.get("volunteer_id"));
  const volunteer_id = volunteerRaw || user?.id || null;

  const { error } = await supabase.from("calls").insert({
    chapter_id: chapterId,
    neighbor_id: neighborId,
    call_date,
    summary: str(formData.get("summary")),
    volunteer_id,
  });

  if (error) {
    redirect("/calls/new?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/calls");
  revalidatePath(`/neighbors/${neighborId}/calls`);
  revalidatePath(`/neighbors/${neighborId}`);
  revalidatePath("/dashboard");
  redirect("/calls");
}
