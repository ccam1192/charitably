"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createServiceRoleClient } from "@/lib/supabase/admin";
import { getSiteUrl } from "@/lib/supabase/site-url";

function str(v: FormDataEntryValue | null): string | null {
  if (v == null || typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function inviteVolunteer(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("users")
    .select("id, chapter_id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!me?.chapter_id) redirect("/onboarding");
  if (me.role !== "admin") {
    redirect("/settings?error=" + encodeURIComponent("Only admins can send invitations."));
  }

  const email = str(formData.get("invite_email"));
  if (!email || !isValidEmail(email)) {
    redirect("/settings?error=" + encodeURIComponent("Enter a valid email address."));
  }

  const full_name = str(formData.get("invite_name"));

  let admin: ReturnType<typeof createServiceRoleClient>;
  try {
    admin = createServiceRoleClient();
  } catch (e) {
    redirect(
      "/settings?error=" +
        encodeURIComponent(
          e instanceof Error ? e.message : "Server is not configured for invitations.",
        ),
    );
  }

  const { error } = await admin.auth.admin.inviteUserByEmail(email, {
    data: {
      chapter_id: me.chapter_id,
      full_name: full_name ?? undefined,
    },
    redirectTo: `${getSiteUrl()}/auth/callback`,
  });

  if (error) {
    const msg =
      error.message.toLowerCase().includes("already") || error.status === 422
        ? "That email is already registered. They can sign in, or remove the account in Supabase first."
        : error.message;
    redirect("/settings?error=" + encodeURIComponent(msg));
  }

  redirect("/settings?invited=" + encodeURIComponent(email));
}
