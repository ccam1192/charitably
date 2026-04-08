import Link from "next/link";
import { createAssistanceFromGlobalForm } from "@/app/(app)/assistance/actions";
import { FormField } from "@/components/neighbors/form-field";
import { SubmitButton } from "@/components/submit-button";
import { getNeighborOptions } from "@/lib/data/neighbors";
import { FINANCIAL_ASSISTANCE_CATEGORY_OPTIONS } from "@/lib/financial-assistance";

export default async function NewAssistancePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const neighbors = await getNeighborOptions();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href="/assistance" className="text-sm text-muted hover:text-foreground">
          ← Assistance
        </Link>
        <h2 className="mt-2 text-xl font-semibold text-foreground">Record assistance</h2>
        <p className="mt-1 text-sm text-muted">Log a grant or aid entry for a neighbor.</p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <form
        action={createAssistanceFromGlobalForm}
        className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <div>
          <label htmlFor="neighbor_id" className="text-sm font-medium text-foreground">
            Neighbor
          </label>
          <select
            id="neighbor_id"
            name="neighbor_id"
            required
            className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-accent focus:ring-2"
            defaultValue=""
          >
            <option value="" disabled>
              Select neighbor
            </option>
            {neighbors.map((n) => (
              <option key={n.id} value={n.id}>
                {n.full_name}
              </option>
            ))}
          </select>
        </div>
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
            Save record
          </SubmitButton>
          <Link
            href="/assistance"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-stone-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
