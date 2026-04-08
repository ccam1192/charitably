"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function getSessionProfile(): Promise<{
  user: { id: string; email?: string | null } | null;
  profile: { id: string; chapter_id: string; role: string } | null;
}> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("users")
    .select("id, chapter_id, role")
    .eq("id", user.id)
    .maybeSingle();

  return {
    user,
    profile: profile as { id: string; chapter_id: string; role: string } | null,
  };
}

function str(v: FormDataEntryValue | null): string | null {
  if (v == null || typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

export async function updateMyProfile(formData: FormData) {
  const { user, profile } = await getSessionProfile();
  if (!user || !profile) redirect("/login");

  const full_name = str(formData.get("full_name"));

  const supabase = await createClient();
  const { error } = await supabase
    .from("users")
    .update({
      full_name: full_name ?? null,
    })
    .eq("id", user.id);

  if (error) {
    redirect("/settings?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  redirect("/settings");
}

export async function updateConferenceName(formData: FormData) {
  const { user, profile } = await getSessionProfile();
  if (!user || !profile) redirect("/login");
  if (profile.role !== "admin") {
    redirect("/settings?error=" + encodeURIComponent("Only admins can update the conference name."));
  }

  const name = str(formData.get("conference_name"));
  if (!name) {
    redirect("/settings?error=" + encodeURIComponent("Conference name is required."));
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("chapters")
    .update({ name })
    .eq("id", profile.chapter_id);

  if (error) {
    redirect("/settings?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/dashboard", "layout");
  revalidatePath("/settings");
  redirect("/settings");
}

export async function adminUpdateVolunteer(volunteerId: string, formData: FormData) {
  const { user, profile } = await getSessionProfile();
  if (!user || !profile) redirect("/login");
  if (profile.role !== "admin") {
    redirect("/settings?error=" + encodeURIComponent("Only admins can update volunteers."));
  }
  if (volunteerId === user.id) {
    redirect("/settings?error=" + encodeURIComponent("Use your profile form to change your own name."));
  }

  const role = str(formData.get("role"));
  if (role !== "admin" && role !== "volunteer") {
    redirect("/settings?error=" + encodeURIComponent("Invalid role."));
  }

  const supabase = await createClient();

  const { data: admins } = await supabase
    .from("users")
    .select("id")
    .eq("chapter_id", profile.chapter_id)
    .eq("role", "admin");

  const adminCount = admins?.length ?? 0;

  const { data: target } = await supabase
    .from("users")
    .select("role")
    .eq("id", volunteerId)
    .eq("chapter_id", profile.chapter_id)
    .maybeSingle();

  if (!target) {
    redirect("/settings?error=" + encodeURIComponent("Volunteer not found."));
  }

  if (target.role === "admin" && role === "volunteer" && adminCount <= 1) {
    redirect(
      "/settings?error=" + encodeURIComponent("Keep at least one admin in the conference."),
    );
  }

  const full_name = str(formData.get("full_name"));
  const email = str(formData.get("email"));

  const { error } = await supabase
    .from("users")
    .update({
      full_name: full_name ?? null,
      email: email ?? null,
      role,
    })
    .eq("id", volunteerId)
    .eq("chapter_id", profile.chapter_id);

  if (error) {
    redirect("/settings?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  redirect("/settings");
}
