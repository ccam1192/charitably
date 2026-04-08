import Link from "next/link";
import { createFinancialAssistance } from "@/app/(app)/neighbors/actions";
import { FormField } from "@/components/neighbors/form-field";
import { SubmitButton } from "@/components/submit-button";
import { getNeighborById } from "@/lib/data/neighbors";
import { FINANCIAL_ASSISTANCE_CATEGORY_OPTIONS } from "@/lib/financial-assistance";
import { notFound } from "next/navigation";

export default async function NeighborNewAssistancePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const neighbor = await getNeighborById(id);
  if (!neighbor) notFound();

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link
          href={`/neighbors/${id}/assistance`}
          className="text-sm text-muted hover:text-foreground"
        >
          ← Assistance
        </Link>
        <h3 className="mt-2 text-sm font-medium text-foreground">Add assistance</h3>
        <p className="mt-1 text-sm text-muted">Record financial assistance for {neighbor.full_name}.</p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <form
        action={createFinancialAssistance.bind(null, id)}
        className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <FormField
          label="Category"
          name="category"
          required
          options={[
            { value: "", label: "— Select category —" },
            ...FINANCIAL_ASSISTANCE_CATEGORY_OPTIONS,
          ]}
        />
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
          name="assistance_date"
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
            Add record
          </SubmitButton>
          <Link
            href={`/neighbors/${id}/assistance`}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-stone-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
