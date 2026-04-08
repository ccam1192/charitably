import Link from "next/link";
import { updateFinancialAssistance } from "@/app/(app)/neighbors/actions";
import { FormField } from "@/components/neighbors/form-field";
import { SubmitButton } from "@/components/submit-button";
import { getAssistanceForNeighborEdit, getNeighborById } from "@/lib/data/neighbors";
import { FINANCIAL_ASSISTANCE_CATEGORY_OPTIONS } from "@/lib/financial-assistance";
import { notFound } from "next/navigation";

function amountInputValue(amount: number | string): string {
  if (typeof amount === "number") return String(amount);
  const n = parseFloat(amount);
  return Number.isFinite(n) ? String(n) : "";
}

export default async function EditNeighborAssistancePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; assistanceId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id, assistanceId } = await params;
  const { error } = await searchParams;
  const [neighbor, row] = await Promise.all([
    getNeighborById(id),
    getAssistanceForNeighborEdit(id, assistanceId),
  ]);
  if (!neighbor || !row) notFound();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link
          href={`/neighbors/${id}/assistance`}
          className="text-sm text-muted hover:text-foreground"
        >
          ← Assistance
        </Link>
        <h3 className="mt-2 text-sm font-medium text-foreground">Edit assistance</h3>
        <p className="mt-1 text-sm text-muted">Update this record for {neighbor.full_name}.</p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <form
        action={updateFinancialAssistance.bind(null, id, assistanceId)}
        className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <FormField
          label="Category"
          name="category"
          required
          options={FINANCIAL_ASSISTANCE_CATEGORY_OPTIONS}
          defaultValue={row.category}
        />
        <FormField
          label="Amount"
          name="amount"
          type="number"
          required
          placeholder="0.00"
          min="0"
          step="0.01"
          defaultValue={amountInputValue(row.amount)}
        />
        <FormField
          label="Currency (ISO code)"
          name="currency"
          defaultValue={row.currency || "USD"}
          placeholder="USD"
        />
        <FormField
          label="Date"
          name="assistance_date"
          type="date"
          required
          defaultValue={row.assistance_date}
        />
        <FormField
          label="Check # / Invoice #"
          name="check_number"
          defaultValue={row.check_number ?? ""}
          placeholder="Optional"
        />
        <FormField label="Notes" name="notes" rows={3} defaultValue={row.notes ?? ""} />
        <div className="flex flex-wrap gap-3 pt-2">
          <SubmitButton
            pendingLabel="Saving…"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Save changes
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
