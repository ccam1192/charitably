"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { buildThankYouEmail } from "@/lib/donations/thank-you-template";
import { getConferenceName, getDonationById } from "@/lib/data/donations";

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

function parseAmount(raw: string | null): number | null {
  if (raw == null || !raw.trim()) return null;
  const n = parseFloat(raw);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export async function createDonation(formData: FormData) {
  const chapterId = await getMyChapterId();
  if (!chapterId) redirect("/login");

  const amount = parseAmount(str(formData.get("amount")));
  const donation_date = str(formData.get("donation_date"));
  if (amount === null || !donation_date) {
    redirect("/donations/new?error=" + encodeURIComponent("Amount and date are required."));
  }

  const supabase = await createClient();
  const { error } = await supabase.from("donations").insert({
    chapter_id: chapterId,
    donor_name: str(formData.get("donor_name")),
    donor_email: str(formData.get("donor_email")),
    amount,
    currency: str(formData.get("currency")) ?? "USD",
    donation_date,
    notes: str(formData.get("notes")),
  });

  if (error) {
    redirect("/donations/new?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/donations");
  revalidatePath("/dashboard");
  redirect("/donations");
}

export async function updateDonation(donationId: string, formData: FormData) {
  const chapterId = await getMyChapterId();
  if (!chapterId) redirect("/login");

  const amount = parseAmount(str(formData.get("amount")));
  const donation_date = str(formData.get("donation_date"));
  if (amount === null || !donation_date) {
    redirect(`/donations/${donationId}?error=` + encodeURIComponent("Amount and date are required."));
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("donations")
    .update({
      donor_name: str(formData.get("donor_name")),
      donor_email: str(formData.get("donor_email")),
      amount,
      currency: str(formData.get("currency")) ?? "USD",
      donation_date,
      notes: str(formData.get("notes")),
    })
    .eq("id", donationId);

  if (error) {
    redirect(`/donations/${donationId}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath("/donations");
  revalidatePath("/dashboard");
  redirect(`/donations/${donationId}`);
}

export async function deleteDonation(donationId: string, formData?: FormData) {
  void formData;
  const supabase = await createClient();
  const { error } = await supabase.from("donations").delete().eq("id", donationId);

  if (error) {
    redirect(`/donations/${donationId}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath("/donations");
  revalidatePath("/dashboard");
  redirect("/donations");
}

export type SimulateThankYouResult =
  | { ok: true; subject: string; body: string }
  | { ok: false; error: string };

export async function simulateSendThankYouEmail(donationId: string): Promise<SimulateThankYouResult> {
  const donation = await getDonationById(donationId);
  if (!donation) {
    return { ok: false, error: "Donation not found." };
  }

  const conferenceName = (await getConferenceName(donation.chapter_id)) ?? "Your conference";
  const amount =
    typeof donation.amount === "string" ? parseFloat(donation.amount) : Number(donation.amount);
  if (!Number.isFinite(amount)) {
    return { ok: false, error: "Invalid amount." };
  }

  const { subject, body } = buildThankYouEmail({
    donorName: donation.donor_name,
    donorEmail: donation.donor_email,
    amount,
    currency: donation.currency,
    donationDate: donation.donation_date,
    conferenceName,
    notes: donation.notes,
  });

  await new Promise((r) => setTimeout(r, 450));

  return { ok: true, subject, body };
}
