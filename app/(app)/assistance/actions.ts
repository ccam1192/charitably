"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { parseAssistanceCategory } from "@/lib/financial-assistance";
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

/** Record assistance from the global /assistance/new form. */
export async function createAssistanceFromGlobalForm(formData: FormData) {
  const chapterId = await getMyChapterId();
  if (!chapterId) redirect("/login");

  const neighborId = str(formData.get("neighbor_id"));
  if (!neighborId) {
    redirect("/assistance/new?error=" + encodeURIComponent("Neighbor is required"));
  }

  const amountRaw = str(formData.get("amount"));
  const assistance_date = str(formData.get("assistance_date"));
  const category = parseAssistanceCategory(formData.get("category"));
  if (!amountRaw || !assistance_date || !category) {
    redirect(
      "/assistance/new?error=" + encodeURIComponent("Amount, date, and category are required"),
    );
  }

  const amount = parseFloat(amountRaw);
  if (!Number.isFinite(amount) || amount < 0) {
    redirect("/assistance/new?error=" + encodeURIComponent("Invalid amount"));
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("financial_assistance").insert({
    chapter_id: chapterId,
    neighbor_id: neighborId,
    amount,
    assistance_date,
    category,
    check_number: str(formData.get("check_number")),
    notes: str(formData.get("notes")),
    recorded_by: user.id,
  });

  if (error) {
    redirect("/assistance/new?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/assistance");
  revalidatePath(`/neighbors/${neighborId}/assistance`);
  revalidatePath(`/neighbors/${neighborId}`);
  revalidatePath("/neighbors");
  revalidatePath("/dashboard");
  redirect("/assistance");
}
