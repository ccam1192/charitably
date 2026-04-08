import type { NeighborFinanceType } from "@/lib/types/neighbor-finance";

export const INCOME_CATEGORY_OPTIONS = [
  { value: "wages", label: "Wages" },
  { value: "government_assistance", label: "Government assistance" },
  { value: "disability", label: "Disability" },
  { value: "unemployment", label: "Unemployment" },
  { value: "child_support", label: "Child support" },
  { value: "pension", label: "Pension" },
  { value: "other", label: "Other" },
] as const;

export const EXPENSE_CATEGORY_OPTIONS = [
  { value: "rent", label: "Rent" },
  { value: "mortgage", label: "Mortgage" },
  { value: "utilities", label: "Utilities" },
  { value: "food", label: "Food" },
  { value: "transportation", label: "Transportation" },
  { value: "medical", label: "Medical" },
  { value: "childcare", label: "Childcare" },
  { value: "debt_payments", label: "Debt payments" },
  { value: "other", label: "Other" },
] as const;

const incomePreset = new Set<string>(INCOME_CATEGORY_OPTIONS.map((o) => o.value));
const expensePreset = new Set<string>(EXPENSE_CATEGORY_OPTIONS.map((o) => o.value));

/** Maps stored category to dropdown preset + optional custom text (for "other"). */
export function resolveCategoryPreset(
  category: string,
  type: NeighborFinanceType,
): { preset: string; custom: string | null } {
  const set = type === "income" ? incomePreset : expensePreset;
  if (set.has(category)) return { preset: category, custom: null };
  return { preset: "other", custom: category };
}
