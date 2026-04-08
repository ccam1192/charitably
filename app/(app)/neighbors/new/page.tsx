import Link from "next/link";
import { createNeighbor } from "@/app/(app)/neighbors/actions";
import { NeighborProfileFields } from "@/components/neighbors/neighbor-profile-fields";
import { SubmitButton } from "@/components/submit-button";

export default async function NewNeighborPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <Link href="/neighbors" className="text-sm text-muted hover:text-foreground">
          ← Neighbors
        </Link>
        <h2 className="mt-2 text-xl font-semibold text-foreground">Add neighbor</h2>
        <p className="mt-1 text-sm text-muted">
          Enter what you know now; you can add more detail on the overview later.
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <form action={createNeighbor} className="space-y-6">
        <NeighborProfileFields />

        <div className="flex flex-wrap gap-3 pt-2">
          <SubmitButton
            pendingLabel="Saving…"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Save
          </SubmitButton>
          <Link
            href="/neighbors"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-stone-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
