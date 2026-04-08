import Link from "next/link";
import { updateVisit } from "@/app/(app)/neighbors/actions";
import { FormField } from "@/components/neighbors/form-field";
import { SubmitButton } from "@/components/submit-button";
import { VolunteerSelect } from "@/components/neighbors/volunteer-select";
import { getConferenceUsers, getNeighborById, getVisitForNeighborEdit } from "@/lib/data/neighbors";
import { notFound } from "next/navigation";

export default async function EditNeighborVisitPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; visitId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id, visitId } = await params;
  const { error } = await searchParams;
  const [neighbor, visit, volunteers] = await Promise.all([
    getNeighborById(id),
    getVisitForNeighborEdit(id, visitId),
    getConferenceUsers(),
  ]);
  if (!neighbor || !visit) notFound();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href={`/neighbors/${id}/visits`} className="text-sm text-muted hover:text-foreground">
          ← Visits
        </Link>
        <h3 className="mt-2 text-sm font-medium text-foreground">Edit visit</h3>
        <p className="mt-1 text-sm text-muted">Update this visit for {neighbor.full_name}.</p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <form
        action={updateVisit.bind(null, id, visitId)}
        className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <FormField
          label="Date"
          name="visit_date"
          type="date"
          required
          defaultValue={visit.visit_date}
        />
        <VolunteerSelect
          volunteers={volunteers}
          defaultValue={visit.volunteer_id ?? ""}
          htmlId="volunteer_id_edit_visit"
        />
        <FormField label="Notes" name="notes" rows={3} defaultValue={visit.notes ?? ""} />
        <FormField
          label="Next steps"
          name="next_steps"
          rows={2}
          defaultValue={visit.next_steps ?? ""}
        />
        <div className="flex flex-wrap gap-3 pt-2">
          <SubmitButton
            pendingLabel="Saving…"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Save changes
          </SubmitButton>
          <Link
            href={`/neighbors/${id}/visits`}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-stone-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
