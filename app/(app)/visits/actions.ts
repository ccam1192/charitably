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

/** Log a visit from the global /visits/new form (neighbor chosen in the form). */
export async function createVisitFromGlobalForm(formData: FormData) {
  const chapterId = await getMyChapterId();
  if (!chapterId) redirect("/login");

  const neighborId = str(formData.get("neighbor_id"));
  if (!neighborId) {
    redirect("/visits/new?error=" + encodeURIComponent("Neighbor is required"));
  }

  const visit_date = str(formData.get("visit_date"));
  if (!visit_date) {
    redirect("/visits/new?error=" + encodeURIComponent("Date is required"));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const volunteerRaw = str(formData.get("volunteer_id"));
  const volunteer_id = volunteerRaw || user?.id || null;

  const { error } = await supabase.from("visits").insert({
    chapter_id: chapterId,
    neighbor_id: neighborId,
    visit_date,
    notes: str(formData.get("notes")),
    next_steps: str(formData.get("next_steps")),
    volunteer_id,
  });

  if (error) {
    redirect("/visits/new?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/visits");
  revalidatePath(`/neighbors/${neighborId}/visits`);
  revalidatePath(`/neighbors/${neighborId}`);
  revalidatePath("/dashboard");
  redirect("/visits");
}
