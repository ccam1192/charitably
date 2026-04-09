"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  parseConferenceExpenseCategory,
  parseExpenseCategoryForForm,
} from "@/lib/expenses";
import { createClient } from "@/lib/supabase/server";

async function getMyChapterId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("users")
    .select("chapter_id, role")
    .eq("id", user.id)
    .maybeSingle();
  return data?.chapter_id ?? null;
}

function str(v: FormDataEntryValue | null): string | null {
  if (v == null || typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

export async function createExpenseFromForm(formData: FormData) {
  const chapterId = await getMyChapterId();
  if (!chapterId) redirect("/login");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();
  const isAdmin = profile?.role === "admin";

  const neighborRaw = str(formData.get("neighbor_id"));
  const neighbor_id = neighborRaw && neighborRaw.length ? neighborRaw : null;

  const mode = neighbor_id ? "assistance" : "conference";
  if (!isAdmin && mode === "conference") {
    redirect("/expenses/new?error=" + encodeURIComponent("Only admins can add conference expenses."));
  }

  const category = parseExpenseCategoryForForm(formData.get("category"), mode);
  const expense_date = str(formData.get("expense_date"));
  const amountRaw = str(formData.get("amount"));

  if (!amountRaw || !expense_date || !category) {
    redirect("/expenses/new?error=" + encodeURIComponent("Amount, date, and category are required"));
  }

  const amount = parseFloat(amountRaw);
  if (!Number.isFinite(amount) || amount < 0) {
    redirect("/expenses/new?error=" + encodeURIComponent("Invalid amount"));
  }

  const { error } = await supabase.from("expenses").insert({
    chapter_id: chapterId,
    neighbor_id,
    amount,
    expense_date,
    category,
    check_number: str(formData.get("check_number")),
    notes: str(formData.get("notes")),
    recorded_by: user.id,
  });

  if (error) {
    redirect("/expenses/new?error=" + encodeURIComponent(error.message));
  }

  revalidatePath("/expenses");
  revalidatePath("/dashboard");
  revalidatePath("/finances");
  if (neighbor_id) {
    revalidatePath(`/neighbors/${neighbor_id}/assistance`);
    revalidatePath(`/neighbors/${neighbor_id}`);
  }
  redirect("/expenses");
}

export async function updateConferenceExpense(expenseId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: existing } = await supabase
    .from("expenses")
    .select("neighbor_id")
    .eq("id", expenseId)
    .maybeSingle();

  if (!existing || existing.neighbor_id != null) {
    redirect("/expenses?error=" + encodeURIComponent("Not a conference expense."));
  }

  const category = parseConferenceExpenseCategory(formData.get("category"));
  const expense_date = str(formData.get("expense_date"));
  const amountRaw = str(formData.get("amount"));
  if (!category || !expense_date || !amountRaw) {
    redirect(`/expenses/${expenseId}/edit?error=` + encodeURIComponent("Required fields missing"));
  }

  const amount = parseFloat(amountRaw);
  if (!Number.isFinite(amount) || amount < 0) {
    redirect(`/expenses/${expenseId}/edit?error=` + encodeURIComponent("Invalid amount"));
  }

  const currencyRaw = str(formData.get("currency"));
  const currency = currencyRaw && currencyRaw.length <= 8 ? currencyRaw : "USD";

  const { error } = await supabase
    .from("expenses")
    .update({
      amount,
      expense_date,
      category,
      check_number: str(formData.get("check_number")),
      notes: str(formData.get("notes")),
      currency,
    })
    .eq("id", expenseId)
    .is("neighbor_id", null);

  if (error) {
    redirect(`/expenses/${expenseId}/edit?error=` + encodeURIComponent(error.message));
  }

  revalidatePath("/expenses");
  revalidatePath("/finances");
  revalidatePath("/dashboard");
  redirect("/expenses");
}
