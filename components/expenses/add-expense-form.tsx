"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { createExpenseFromForm } from "@/app/(app)/expenses/actions";
import { FormField } from "@/components/neighbors/form-field";
import { SubmitButton } from "@/components/submit-button";
import {
  ASSISTANCE_EXPENSE_CATEGORY_OPTIONS,
  CONFERENCE_EXPENSE_CATEGORY_OPTIONS,
} from "@/lib/expenses";

const selectClass =
  "mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-accent focus:ring-2";

export function AddExpenseForm({
  neighbors,
  today,
}: {
  neighbors: { id: string; full_name: string }[];
  today: string;
}) {
  const [relatedTo, setRelatedTo] = useState("");
  const isConference = relatedTo === "";

  const categoryOptions = useMemo(() => {
    const placeholder = { value: "", label: "— Select category —" };
    if (isConference) {
      return [placeholder, ...CONFERENCE_EXPENSE_CATEGORY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))];
    }
    return [placeholder, ...ASSISTANCE_EXPENSE_CATEGORY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))];
  }, [isConference]);

  return (
    <form
      action={createExpenseFromForm}
      className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm"
    >
      <div>
        <label htmlFor="neighbor_id" className="text-sm font-medium text-foreground">
          Expense related to
        </label>
        <select
          id="neighbor_id"
          name="neighbor_id"
          value={relatedTo}
          onChange={(e) => setRelatedTo(e.target.value)}
          className={selectClass}
        >
          <option value="">Conference Expense / No Neighbor</option>
          {neighbors.map((n) => (
            <option key={n.id} value={n.id}>
              {n.full_name}
            </option>
          ))}
        </select>
      </div>

      <div key={relatedTo}>
        <label htmlFor="category" className="text-sm font-medium text-foreground">
          Category <span className="text-red-600">*</span>
        </label>
        <select id="category" name="category" required className={selectClass} defaultValue="">
          {categoryOptions.map((o) => (
            <option key={o.value || "empty"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <FormField
        label="Amount (USD)"
        name="amount"
        type="number"
        required
        placeholder="0.00"
        min="0"
        step="0.01"
      />
      <FormField
        label="Date"
        name="expense_date"
        type="date"
        required
        defaultValue={today}
      />
      <FormField
        label="Check # / Invoice #"
        name="check_number"
        placeholder="Optional"
      />
      <FormField label="Notes" name="notes" rows={3} />
      <div className="flex flex-wrap gap-3 pt-2">
        <SubmitButton
          pendingLabel="Saving…"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
        >
          Save expense
        </SubmitButton>
        <Link
          href="/expenses"
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-stone-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
