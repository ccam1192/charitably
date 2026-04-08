"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { SubmitButton } from "@/components/submit-button";
import {
  EXPENSE_CATEGORY_OPTIONS,
  INCOME_CATEGORY_OPTIONS,
} from "@/lib/neighbor-finance-categories";
import type { NeighborFinanceFrequency, NeighborFinanceType } from "@/lib/types/neighbor-finance";

const baseField =
  "mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-accent focus:ring-2";

export type NeighborFinanceFormInitialValues = {
  type: NeighborFinanceType;
  categoryPreset: string;
  categoryCustom?: string;
  amountEntered: string;
  frequency: NeighborFinanceFrequency;
  source: string;
  notes: string;
};

export function NeighborFinanceForm({
  neighborId,
  action,
  submitLabel = "Add entry",
  initialValues,
}: {
  neighborId: string;
  action: (formData: FormData) => Promise<void>;
  submitLabel?: string;
  initialValues?: NeighborFinanceFormInitialValues;
}) {
  const [type, setType] = useState<NeighborFinanceType>(initialValues?.type ?? "income");
  const [category, setCategory] = useState(() => {
    if (initialValues?.categoryPreset) return initialValues.categoryPreset;
    return INCOME_CATEGORY_OPTIONS[0].value;
  });

  const categoryOptions = useMemo(
    () => (type === "income" ? INCOME_CATEGORY_OPTIONS : EXPENSE_CATEGORY_OPTIONS),
    [type],
  );

  return (
    <form action={action} className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm">
      <div>
        <label htmlFor="finance-type" className="text-sm font-medium text-foreground">
          Type<span className="text-red-600"> *</span>
        </label>
        <select
          id="finance-type"
          name="type"
          required
          value={type}
          className={baseField}
          onChange={(e) => {
            const next = e.target.value as NeighborFinanceType;
            setType(next);
            setCategory(next === "income" ? INCOME_CATEGORY_OPTIONS[0].value : EXPENSE_CATEGORY_OPTIONS[0].value);
          }}
        >
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div>
        <label htmlFor="finance-category" className="text-sm font-medium text-foreground">
          Category<span className="text-red-600"> *</span>
        </label>
        <select
          id="finance-category"
          name="category_preset"
          required
          value={category}
          className={baseField}
          onChange={(e) => setCategory(e.target.value)}
        >
          {categoryOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      {category === "other" ? (
        <div>
          <label htmlFor="category-custom" className="text-sm font-medium text-foreground">
            Describe category<span className="text-red-600"> *</span>
          </label>
          <input
            id="category-custom"
            name="category_custom"
            required
            defaultValue={initialValues?.categoryCustom ?? ""}
            placeholder="e.g. Side income, pet care"
            className={baseField}
          />
        </div>
      ) : null}

      <div>
        <label htmlFor="finance-amount" className="text-sm font-medium text-foreground">
          Amount (as entered)<span className="text-red-600"> *</span>
        </label>
        <input
          id="finance-amount"
          name="amount"
          type="number"
          required
          min="0"
          step="0.01"
          placeholder="0.00"
          defaultValue={initialValues?.amountEntered ?? ""}
          className={baseField}
        />
        <p className="mt-1 text-xs text-muted">
          Saved as a monthly equivalent (one-time amounts stay as entered but do not count toward the monthly
          summary).
        </p>
      </div>

      <div>
        <label htmlFor="finance-frequency" className="text-sm font-medium text-foreground">
          Frequency<span className="text-red-600"> *</span>
        </label>
        <select
          id="finance-frequency"
          name="frequency"
          required
          className={baseField}
          defaultValue={initialValues?.frequency ?? "monthly"}
        >
          <option value="monthly">Monthly</option>
          <option value="weekly">Weekly</option>
          <option value="biweekly">Biweekly</option>
          <option value="one-time">One-time</option>
        </select>
      </div>

      <div>
        <label htmlFor="finance-source" className="text-sm font-medium text-foreground">
          Source
        </label>
        <input
          id="finance-source"
          name="source"
          type="text"
          className={baseField}
          placeholder="Optional"
          defaultValue={initialValues?.source ?? ""}
        />
      </div>

      <div>
        <label htmlFor="finance-notes" className="text-sm font-medium text-foreground">
          Notes
        </label>
        <textarea
          id="finance-notes"
          name="notes"
          rows={3}
          className={baseField + " resize-y"}
          defaultValue={initialValues?.notes ?? ""}
        />
      </div>

      <div className="flex flex-wrap gap-3 pt-2">
        <SubmitButton
          pendingLabel="Saving…"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
        >
          {submitLabel}
        </SubmitButton>
        <Link
          href={`/neighbors/${neighborId}/finances`}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-stone-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
