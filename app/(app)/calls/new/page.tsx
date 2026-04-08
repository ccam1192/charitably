import Link from "next/link";
import { createCallFromGlobalForm } from "@/app/(app)/calls/actions";
import { VolunteerSelect } from "@/components/neighbors/volunteer-select";
import { FormField } from "@/components/neighbors/form-field";
import { SubmitButton } from "@/components/submit-button";
import { getConferenceUsers, getNeighborOptions } from "@/lib/data/neighbors";

export default async function NewCallPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const [volunteers, neighbors] = await Promise.all([getConferenceUsers(), getNeighborOptions()]);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href="/calls" className="text-sm text-muted hover:text-foreground">
          ← Calls
        </Link>
        <h2 className="mt-2 text-xl font-semibold text-foreground">Record call</h2>
        <p className="mt-1 text-sm text-muted">Choose a neighbor and log a phone call.</p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <form
        action={createCallFromGlobalForm}
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
        <FormField label="Date" name="call_date" type="date" required defaultValue={today} />
        <VolunteerSelect volunteers={volunteers} />
        <FormField label="Summary" name="summary" rows={4} />
        <div className="flex flex-wrap gap-3 pt-2">
          <SubmitButton
            pendingLabel="Saving…"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Save call
          </SubmitButton>
          <Link
            href="/calls"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-stone-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
