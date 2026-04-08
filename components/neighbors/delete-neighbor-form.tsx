"use client";

import { deleteNeighbor } from "@/app/(app)/neighbors/actions";

export function DeleteNeighborForm({ neighborId }: { neighborId: string }) {
  return (
    <form
      action={deleteNeighbor.bind(null, neighborId)}
      className="mt-4"
      onSubmit={(e) => {
        if (!confirm("Delete this neighbor permanently?")) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
      >
        Delete neighbor
      </button>
    </form>
  );
}
