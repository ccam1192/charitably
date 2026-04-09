"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { parseAssistanceCategory } from "@/lib/financial-assistance";
import { toMonthlyEquivalent } from "@/lib/neighbor-finance-amounts";
import { isNeedsCategory, isReferralSource } from "@/lib/neighbor-profile";
import type { NeighborFinanceFrequency, NeighborFinanceType } from "@/lib/types/neighbor-finance";

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

function intOrNull(v: FormDataEntryValue | null): number | null {
  if (v == null || typeof v !== "string") return null;
  const t = v.trim();
  if (!t.length) return null;
  const n = parseInt(t, 10);
  if (!Number.isFinite(n) || n < 0) return null;
  return n;
}

function referralSourceFromForm(formData: FormData): string | null {
  const raw = str(formData.get("referral_source"));
  if (!raw) return null;
  return isReferralSource(raw) ? raw : null;
}

function referralSourceOtherFromForm(
  formData: FormData,
  referralSource: string | null,
): string | null {
  if (referralSource !== "other") return null;
  return str(formData.get("referral_source_other"));
}

function needsCategoryFromForm(formData: FormData): string | null {
  const raw = str(formData.get("needs_category"));
  if (!raw) return null;
  return isNeedsCategory(raw) ? raw : null;
}

function neighborProfilePayload(formData: FormData) {
  const referral_source = referralSourceFromForm(formData);
  return {
    phone: str(formData.get("phone")),
    email: str(formData.get("email")),
    address: str(formData.get("address")),
    notes: str(formData.get("notes")),
    household_size: intOrNull(formData.get("household_size")),
    adults_count: intOrNull(formData.get("adults_count")),
    children_count: intOrNull(formData.get("children_count")),
    dependents_count: intOrNull(formData.get("dependents_count")),
    composition_notes: str(formData.get("composition_notes")),
    referral_source,
    referral_source_other: referralSourceOtherFromForm(formData, referral_source),
    needs_summary: str(formData.get("needs_summary")),
    needs_category: needsCategoryFromForm(formData),
  };
}

export async function createNeighbor(formData: FormData) {
  const chapterId = await getMyChapterId();
  if (!chapterId) redirect("/login");

  const full_name = str(formData.get("full_name"));
  if (!full_name) {
    redirect("/neighbors/new?error=" + encodeURIComponent("Name is required"));
  }

  const supabase = await createClient();
  const { error } = await supabase.from("neighbors").insert({
    chapter_id: chapterId,
    full_name,
    ...neighborProfilePayload(formData),
  });

  if (error) {
    redirect("/neighbors/new?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/neighbors");
  redirect("/neighbors");
}

export async function updateNeighbor(neighborId: string, formData: FormData) {
  const chapterId = await getMyChapterId();
  if (!chapterId) redirect("/login");

  const full_name = str(formData.get("full_name"));
  if (!full_name) {
    redirect(`/neighbors/${neighborId}?error=` + encodeURIComponent("Name is required"));
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("neighbors")
    .update({
      full_name,
      ...neighborProfilePayload(formData),
    })
    .eq("id", neighborId)
    .eq("chapter_id", chapterId);

  if (error) {
    redirect(`/neighbors/${neighborId}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath("/neighbors");
  revalidatePath(`/neighbors/${neighborId}`);
  redirect(`/neighbors/${neighborId}`);
}

export async function createVisit(neighborId: string, formData: FormData) {
  const chapterId = await getMyChapterId();
  if (!chapterId) redirect("/login");

  const visit_date = str(formData.get("visit_date"));
  if (!visit_date) {
    redirect(
      `/neighbors/${neighborId}/visits/new?error=` + encodeURIComponent("Date is required"),
    );
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
    redirect(`/neighbors/${neighborId}/visits/new?error=` + encodeURIComponent(error.message));
  }

  revalidatePath(`/neighbors/${neighborId}/visits`);
  revalidatePath(`/neighbors/${neighborId}`);
  revalidatePath("/visits");
  revalidatePath("/dashboard");
  redirect(`/neighbors/${neighborId}/visits`);
}

export async function createCall(neighborId: string, formData: FormData) {
  const chapterId = await getMyChapterId();
  if (!chapterId) redirect("/login");

  const call_date = str(formData.get("call_date"));
  if (!call_date) {
    redirect(
      `/neighbors/${neighborId}/calls/new?error=` + encodeURIComponent("Date is required"),
    );
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
    redirect(`/neighbors/${neighborId}/calls/new?error=` + encodeURIComponent(error.message));
  }

  revalidatePath(`/neighbors/${neighborId}/calls`);
  revalidatePath(`/neighbors/${neighborId}`);
  revalidatePath("/calls");
  revalidatePath("/dashboard");
  redirect(`/neighbors/${neighborId}/calls`);
}

export async function createFinancialAssistance(neighborId: string, formData: FormData) {
  const chapterId = await getMyChapterId();
  if (!chapterId) redirect("/login");

  const amountRaw = str(formData.get("amount"));
  const assistance_date = str(formData.get("assistance_date"));
  const category = parseAssistanceCategory(formData.get("category"));
  if (!amountRaw || !assistance_date || !category) {
    redirect(
      `/neighbors/${neighborId}/assistance/new?error=` +
        encodeURIComponent("Amount, date, and category are required"),
    );
  }

  const amount = parseFloat(amountRaw);
  if (!Number.isFinite(amount) || amount < 0) {
    redirect(
      `/neighbors/${neighborId}/assistance/new?error=` + encodeURIComponent("Invalid amount"),
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("expenses").insert({
    chapter_id: chapterId,
    neighbor_id: neighborId,
    amount,
    expense_date: assistance_date,
    category,
    check_number: str(formData.get("check_number")),
    notes: str(formData.get("notes")),
    recorded_by: user.id,
  });

  if (error) {
    redirect(`/neighbors/${neighborId}/assistance/new?error=` + encodeURIComponent(error.message));
  }

  revalidatePath(`/neighbors/${neighborId}/assistance`);
  revalidatePath(`/neighbors/${neighborId}`);
  revalidatePath("/neighbors");
  revalidatePath("/expenses");
  revalidatePath("/finances");
  revalidatePath("/dashboard");
  redirect(`/neighbors/${neighborId}/assistance`);
}

export async function updateVisit(neighborId: string, visitId: string, formData: FormData) {
  const chapterId = await getMyChapterId();
  if (!chapterId) redirect("/login");

  const visit_date = str(formData.get("visit_date"));
  if (!visit_date) {
    redirect(
      `/neighbors/${neighborId}/visits/${visitId}/edit?error=` +
        encodeURIComponent("Date is required"),
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const volunteerRaw = str(formData.get("volunteer_id"));
  const volunteer_id = volunteerRaw || user?.id || null;

  const { error } = await supabase
    .from("visits")
    .update({
      visit_date,
      notes: str(formData.get("notes")),
      next_steps: str(formData.get("next_steps")),
      volunteer_id,
    })
    .eq("id", visitId)
    .eq("neighbor_id", neighborId);

  if (error) {
    redirect(
      `/neighbors/${neighborId}/visits/${visitId}/edit?error=` + encodeURIComponent(error.message),
    );
  }

  revalidatePath(`/neighbors/${neighborId}/visits`);
  revalidatePath(`/neighbors/${neighborId}`);
  revalidatePath("/visits");
  revalidatePath("/dashboard");
  redirect(`/neighbors/${neighborId}/visits`);
}

export async function updateCall(neighborId: string, callId: string, formData: FormData) {
  const chapterId = await getMyChapterId();
  if (!chapterId) redirect("/login");

  const call_date = str(formData.get("call_date"));
  if (!call_date) {
    redirect(
      `/neighbors/${neighborId}/calls/${callId}/edit?error=` +
        encodeURIComponent("Date is required"),
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const volunteerRaw = str(formData.get("volunteer_id"));
  const volunteer_id = volunteerRaw || user?.id || null;

  const { error } = await supabase
    .from("calls")
    .update({
      call_date,
      summary: str(formData.get("summary")),
      volunteer_id,
    })
    .eq("id", callId)
    .eq("neighbor_id", neighborId);

  if (error) {
    redirect(
      `/neighbors/${neighborId}/calls/${callId}/edit?error=` + encodeURIComponent(error.message),
    );
  }

  revalidatePath(`/neighbors/${neighborId}/calls`);
  revalidatePath(`/neighbors/${neighborId}`);
  revalidatePath("/calls");
  revalidatePath("/dashboard");
  redirect(`/neighbors/${neighborId}/calls`);
}

export async function updateFinancialAssistance(
  neighborId: string,
  assistanceId: string,
  formData: FormData,
) {
  const chapterId = await getMyChapterId();
  if (!chapterId) redirect("/login");

  const amountRaw = str(formData.get("amount"));
  const assistance_date = str(formData.get("assistance_date"));
  const category = parseAssistanceCategory(formData.get("category"));
  if (!amountRaw || !assistance_date || !category) {
    redirect(
      `/neighbors/${neighborId}/assistance/${assistanceId}/edit?error=` +
        encodeURIComponent("Amount, date, and category are required"),
    );
  }

  const amount = parseFloat(amountRaw);
  if (!Number.isFinite(amount) || amount < 0) {
    redirect(
      `/neighbors/${neighborId}/assistance/${assistanceId}/edit?error=` +
        encodeURIComponent("Invalid amount"),
    );
  }

  const currencyRaw = str(formData.get("currency"));
  const currency = currencyRaw && currencyRaw.length <= 8 ? currencyRaw : "USD";

  const supabase = await createClient();
  const { error } = await supabase
    .from("expenses")
    .update({
      amount,
      expense_date: assistance_date,
      category,
      check_number: str(formData.get("check_number")),
      notes: str(formData.get("notes")),
      currency,
    })
    .eq("id", assistanceId)
    .eq("neighbor_id", neighborId);

  if (error) {
    redirect(
      `/neighbors/${neighborId}/assistance/${assistanceId}/edit?error=` +
        encodeURIComponent(error.message),
    );
  }

  revalidatePath(`/neighbors/${neighborId}/assistance`);
  revalidatePath(`/neighbors/${neighborId}`);
  revalidatePath("/neighbors");
  revalidatePath("/expenses");
  revalidatePath("/finances");
  revalidatePath("/dashboard");
  redirect(`/neighbors/${neighborId}/assistance`);
}

const FINANCE_FREQUENCIES: NeighborFinanceFrequency[] = [
  "weekly",
  "biweekly",
  "monthly",
  "one-time",
];

type ParsedNeighborFinance = {
  type: NeighborFinanceType;
  category: string;
  amountMonthly: number;
  frequency: NeighborFinanceFrequency;
  source: string | null;
  notes: string | null;
};

function parseNeighborFinanceForm(
  formData: FormData,
): { ok: true; value: ParsedNeighborFinance } | { ok: false; message: string } {
  const typeRaw = str(formData.get("type"));
  const frequencyRaw = str(formData.get("frequency"));
  const amountRaw = str(formData.get("amount"));
  const categoryPreset = str(formData.get("category_preset"));
  const categoryCustom = str(formData.get("category_custom"));

  if (!typeRaw || !frequencyRaw || !amountRaw || !categoryPreset) {
    return { ok: false, message: "Type, category, amount, and frequency are required" };
  }

  if (typeRaw !== "income" && typeRaw !== "expense") {
    return { ok: false, message: "Invalid type" };
  }
  const type = typeRaw as NeighborFinanceType;

  if (!FINANCE_FREQUENCIES.includes(frequencyRaw as NeighborFinanceFrequency)) {
    return { ok: false, message: "Invalid frequency" };
  }
  const frequency = frequencyRaw as NeighborFinanceFrequency;

  let category: string;
  if (categoryPreset === "other") {
    if (!categoryCustom) {
      return { ok: false, message: "Please describe the category when Other is selected" };
    }
    category = categoryCustom;
  } else {
    category = categoryPreset;
  }

  const entered = parseFloat(amountRaw);
  if (!Number.isFinite(entered) || entered < 0) {
    return { ok: false, message: "Invalid amount" };
  }

  const amountMonthly = toMonthlyEquivalent(entered, frequency);

  return {
    ok: true,
    value: {
      type,
      category,
      amountMonthly,
      frequency,
      source: str(formData.get("source")),
      notes: str(formData.get("notes")),
    },
  };
}

export async function createNeighborFinanceEntry(neighborId: string, formData: FormData) {
  const chapterId = await getMyChapterId();
  if (!chapterId) redirect("/login");

  const parsed = parseNeighborFinanceForm(formData);
  if (!parsed.ok) {
    redirect(`/neighbors/${neighborId}/finances/new?error=` + encodeURIComponent(parsed.message));
  }
  const v = parsed.value;

  const supabase = await createClient();
  const { error } = await supabase.from("neighbor_finances").insert({
    chapter_id: chapterId,
    neighbor_id: neighborId,
    type: v.type,
    category: v.category,
    amount: v.amountMonthly,
    frequency: v.frequency,
    source: v.source,
    notes: v.notes,
  });

  if (error) {
    redirect(`/neighbors/${neighborId}/finances/new?error=` + encodeURIComponent(error.message));
  }

  revalidatePath(`/neighbors/${neighborId}/finances`);
  revalidatePath(`/neighbors/${neighborId}/finances/new`);
  revalidatePath(`/neighbors/${neighborId}`);
  redirect(`/neighbors/${neighborId}/finances`);
}

export async function updateNeighborFinanceEntry(
  neighborId: string,
  entryId: string,
  formData: FormData,
) {
  const chapterId = await getMyChapterId();
  if (!chapterId) redirect("/login");

  const parsed = parseNeighborFinanceForm(formData);
  if (!parsed.ok) {
    redirect(
      `/neighbors/${neighborId}/finances/${entryId}/edit?error=` + encodeURIComponent(parsed.message),
    );
  }
  const v = parsed.value;

  const supabase = await createClient();
  const { error } = await supabase
    .from("neighbor_finances")
    .update({
      type: v.type,
      category: v.category,
      amount: v.amountMonthly,
      frequency: v.frequency,
      source: v.source,
      notes: v.notes,
    })
    .eq("id", entryId)
    .eq("neighbor_id", neighborId);

  if (error) {
    redirect(
      `/neighbors/${neighborId}/finances/${entryId}/edit?error=` + encodeURIComponent(error.message),
    );
  }

  revalidatePath(`/neighbors/${neighborId}/finances`);
  revalidatePath(`/neighbors/${neighborId}/finances/${entryId}/edit`);
  revalidatePath(`/neighbors/${neighborId}`);
  redirect(`/neighbors/${neighborId}/finances`);
}

export async function deleteNeighbor(neighborId: string) {
  const chapterId = await getMyChapterId();
  if (!chapterId) redirect("/login");

  const supabase = await createClient();
  const { error } = await supabase.from("neighbors").delete().eq("id", neighborId);

  if (error) {
    redirect(`/neighbors/${neighborId}?error=` + encodeURIComponent(error.message));
  }

  revalidatePath("/neighbors");
  redirect("/neighbors");
}
