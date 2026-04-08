import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type ProfileRow = {
  id: string;
  chapter_id: string;
  full_name: string | null;
  email: string | null;
  role: string;
};

export const getProfileByUserId = cache(async function getProfileByUserId(
  userId: string,
): Promise<ProfileRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("id, chapter_id, full_name, email, role")
    .eq("id", userId)
    .maybeSingle();

  if (error || !data) return null;
  return data as ProfileRow;
});
