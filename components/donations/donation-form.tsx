import { FormField } from "@/components/neighbors/form-field";
import { SubmitButton } from "@/components/submit-button";

type Defaults = {
  donor_name?: string | null;
  donor_email?: string | null;
  amount?: string;
  currency?: string;
  donation_date?: string;
  notes?: string | null;
};

export function DonationForm({
  action,
  defaults,
  submitLabel,
}: {
  action: (formData: FormData) => void | Promise<void>;
  defaults?: Defaults;
  submitLabel: string;
}) {
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={action} className="space-y-4">
      <FormField
        label="Donor name"
        name="donor_name"
        defaultValue={defaults?.donor_name ?? ""}
      />
      <FormField
        label="Donor email"
        name="donor_email"
        type="email"
        defaultValue={defaults?.donor_email ?? ""}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Amount"
          name="amount"
          type="number"
          required
          min="0"
          step="0.01"
          defaultValue={defaults?.amount ?? ""}
        />
        <div>
          <label htmlFor="currency" className="text-sm font-medium text-foreground">
            Currency
          </label>
          <select
            id="currency"
            name="currency"
            defaultValue={defaults?.currency ?? "USD"}
            className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-accent focus:ring-2"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
          </select>
        </div>
      </div>
      <FormField
        label="Donation date"
        name="donation_date"
        type="date"
        required
        defaultValue={defaults?.donation_date ?? today}
      />
      <FormField label="Notes" name="notes" rows={4} defaultValue={defaults?.notes ?? ""} />
      <SubmitButton
        pendingLabel="Saving…"
        className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
      >
        {submitLabel}
      </SubmitButton>
    </form>
  );
}
