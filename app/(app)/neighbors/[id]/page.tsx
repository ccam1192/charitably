import { updateNeighbor } from "@/app/(app)/neighbors/actions";
import { NeighborProfileFields } from "@/components/neighbors/neighbor-profile-fields";
import { SubmitButton } from "@/components/submit-button";
import { getNeighborById } from "@/lib/data/neighbors";
import { notFound } from "next/navigation";

export default async function NeighborOverviewPage({
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

  const updateWithId = updateNeighbor.bind(null, id);

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h3 className="text-sm font-medium uppercase tracking-wide text-muted">Neighbor profile</h3>
        <p className="mt-1 text-sm text-muted">
          Contact, household, referral, and needs. Save when you are done editing.
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <form action={updateWithId} className="space-y-6">
        <NeighborProfileFields neighbor={neighbor} />

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <SubmitButton
            pendingLabel="Saving…"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Save changes
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
