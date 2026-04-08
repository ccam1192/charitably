import Link from "next/link";
import { createCall } from "@/app/(app)/neighbors/actions";
import { FormField } from "@/components/neighbors/form-field";
import { SubmitButton } from "@/components/submit-button";
import { VolunteerSelect } from "@/components/neighbors/volunteer-select";
import { getConferenceUsers, getNeighborById } from "@/lib/data/neighbors";
import { notFound } from "next/navigation";

export default async function NeighborNewCallPage({
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

  const volunteers = await getConferenceUsers();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href={`/neighbors/${id}/calls`} className="text-sm text-muted hover:text-foreground">
          ← Calls
        </Link>
        <h3 className="mt-2 text-sm font-medium text-foreground">Log a call</h3>
        <p className="mt-1 text-sm text-muted">Record a call for {neighbor.full_name}.</p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <form
        action={createCall.bind(null, id)}
        className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <FormField label="Date" name="call_date" type="date" required defaultValue={today} />
        <VolunteerSelect volunteers={volunteers} />
        <FormField label="Summary" name="summary" rows={4} />
        <div className="flex flex-wrap gap-3 pt-2">
          <SubmitButton
            pendingLabel="Saving…"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Add call
          </SubmitButton>
          <Link
            href={`/neighbors/${id}/calls`}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-stone-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
