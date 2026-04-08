import Link from "next/link";
import { updateCall } from "@/app/(app)/neighbors/actions";
import { FormField } from "@/components/neighbors/form-field";
import { SubmitButton } from "@/components/submit-button";
import { VolunteerSelect } from "@/components/neighbors/volunteer-select";
import { getCallForNeighborEdit, getConferenceUsers, getNeighborById } from "@/lib/data/neighbors";
import { notFound } from "next/navigation";

export default async function EditNeighborCallPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; callId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id, callId } = await params;
  const { error } = await searchParams;
  const [neighbor, call, volunteers] = await Promise.all([
    getNeighborById(id),
    getCallForNeighborEdit(id, callId),
    getConferenceUsers(),
  ]);
  if (!neighbor || !call) notFound();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href={`/neighbors/${id}/calls`} className="text-sm text-muted hover:text-foreground">
          ← Calls
        </Link>
        <h3 className="mt-2 text-sm font-medium text-foreground">Edit call</h3>
        <p className="mt-1 text-sm text-muted">Update this call for {neighbor.full_name}.</p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <form
        action={updateCall.bind(null, id, callId)}
        className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <FormField
          label="Date"
          name="call_date"
          type="date"
          required
          defaultValue={call.call_date}
        />
        <VolunteerSelect
          volunteers={volunteers}
          defaultValue={call.volunteer_id ?? ""}
          htmlId="volunteer_id_edit_call"
        />
        <FormField label="Summary" name="summary" rows={4} defaultValue={call.summary ?? ""} />
        <div className="flex flex-wrap gap-3 pt-2">
          <SubmitButton
            pendingLabel="Saving…"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Save changes
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
