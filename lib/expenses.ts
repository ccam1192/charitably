/** Stored category values — must match DB check constraint on public.expenses. */

export const ASSISTANCE_EXPENSE_CATEGORY_VALUES = [
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

export const CONFERENCE_EXPENSE_CATEGORY_VALUES = [
  "bank fees",
  "office supplies",
  "postage",
  "printing",
  "technology/software",
  "event expenses",
  "training",
  "travel",
  "miscellaneous",
] as const;

export type AssistanceExpenseCategory = (typeof ASSISTANCE_EXPENSE_CATEGORY_VALUES)[number];
export type ConferenceExpenseCategory = (typeof CONFERENCE_EXPENSE_CATEGORY_VALUES)[number];
export type ExpenseCategory = AssistanceExpenseCategory | ConferenceExpenseCategory;

export const ASSISTANCE_EXPENSE_CATEGORY_OPTIONS: { value: AssistanceExpenseCategory; label: string }[] =
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

export const CONFERENCE_EXPENSE_CATEGORY_OPTIONS: {
  value: ConferenceExpenseCategory;
  label: string;
}[] = [
  { value: "bank fees", label: "Bank fees" },
  { value: "office supplies", label: "Office supplies" },
  { value: "postage", label: "Postage" },
  { value: "printing", label: "Printing" },
  { value: "technology/software", label: "Technology / software" },
  { value: "event expenses", label: "Event expenses" },
  { value: "training", label: "Training" },
  { value: "travel", label: "Travel" },
  { value: "miscellaneous", label: "Miscellaneous" },
];

const labelMap = new Map<string, string>();
for (const o of [...ASSISTANCE_EXPENSE_CATEGORY_OPTIONS, ...CONFERENCE_EXPENSE_CATEGORY_OPTIONS]) {
  labelMap.set(o.value, o.label);
}

/** Display label for a stored category value. */
export function formatExpenseCategoryLabel(category: string | null | undefined): string {
  if (category == null || category === "") return "—";
  return labelMap.get(category) ?? category;
}

export function parseAssistanceExpenseCategory(
  raw: FormDataEntryValue | null | undefined,
): AssistanceExpenseCategory | null {
  if (raw == null || typeof raw !== "string") return null;
  const t = raw.trim();
  if (!t) return null;
  return (ASSISTANCE_EXPENSE_CATEGORY_VALUES as readonly string[]).includes(t)
    ? (t as AssistanceExpenseCategory)
    : null;
}

export function parseConferenceExpenseCategory(
  raw: FormDataEntryValue | null | undefined,
): ConferenceExpenseCategory | null {
  if (raw == null || typeof raw !== "string") return null;
  const t = raw.trim();
  if (!t) return null;
  return (CONFERENCE_EXPENSE_CATEGORY_VALUES as readonly string[]).includes(t)
    ? (t as ConferenceExpenseCategory)
    : null;
}

export function parseExpenseCategoryForForm(
  raw: FormDataEntryValue | null | undefined,
  mode: "assistance" | "conference",
): ExpenseCategory | null {
  return mode === "assistance"
    ? parseAssistanceExpenseCategory(raw)
    : parseConferenceExpenseCategory(raw);
}
