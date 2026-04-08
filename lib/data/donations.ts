import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type DonationRow = {
  id: string;
  chapter_id: string;
  donor_name: string | null;
  donor_email: string | null;
  amount: number | string;
  currency: string;
  donation_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export async function getDonationsForConference(): Promise<DonationRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("donations")
    .select(
      "id, chapter_id, donor_name, donor_email, amount, currency, donation_date, notes, created_at, updated_at",
    )
    .order("donation_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as DonationRow[];
}

export const getDonationById = cache(async function getDonationById(
  id: string,
): Promise<DonationRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("donations")
    .select(
      "id, chapter_id, donor_name, donor_email, amount, currency, donation_date, notes, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return data as DonationRow;
});

export async function getConferenceName(chapterId: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("chapters").select("name").eq("id", chapterId).maybeSingle();
  return data?.name ?? null;
}
