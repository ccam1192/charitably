/** Stored values for financial_assistance.category (must match DB check constraint). */
export const FINANCIAL_ASSISTANCE_CATEGORY_VALUES = [
  "rent",
  "utilities",
  "food",
  "transportation",
  "car repair",
  "medical",
  "prescription",
  "burial",
  "emergency lodging",
  "employment assistance",
  "other",
] as const;

export type FinancialAssistanceCategory = (typeof FINANCIAL_ASSISTANCE_CATEGORY_VALUES)[number];

export const FINANCIAL_ASSISTANCE_CATEGORY_OPTIONS: { value: FinancialAssistanceCategory; label: string }[] =
  [
    { value: "rent", label: "Rent" },
    { value: "utilities", label: "Utilities" },
    { value: "food", label: "Food" },
    { value: "transportation", label: "Transportation" },
    { value: "car repair", label: "Car repair" },
    { value: "medical", label: "Medical" },
    { value: "prescription", label: "Prescription" },
    { value: "burial", label: "Burial" },
    { value: "emergency lodging", label: "Emergency lodging" },
    { value: "employment assistance", label: "Employment assistance" },
    { value: "other", label: "Other" },
  ];

const categoryLabelMap = new Map(
  FINANCIAL_ASSISTANCE_CATEGORY_OPTIONS.map((o) => [o.value, o.label]),
);

/** Display label for a stored category value. */
export function formatAssistanceCategoryLabel(category: string | null | undefined): string {
  if (category == null || category === "") return "—";
  return categoryLabelMap.get(category as FinancialAssistanceCategory) ?? category;
}

export function parseAssistanceCategory(
  raw: FormDataEntryValue | null | undefined,
): FinancialAssistanceCategory | null {
  if (raw == null || typeof raw !== "string") return null;
  const t = raw.trim();
  if (!t) return null;
  return (FINANCIAL_ASSISTANCE_CATEGORY_VALUES as readonly string[]).includes(t)
    ? (t as FinancialAssistanceCategory)
    : null;
}

export type FinancialAssistanceListItem = {
  id: string;
  assistance_date: string;
  category: string;
  amount: number | string;
  currency: string;
  check_number: string | null;
  notes: string | null;
  recorded_by_name: string | null;
};
