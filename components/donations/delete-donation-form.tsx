"use client";

import { deleteDonation } from "@/app/(app)/donations/actions";
import { SubmitButton } from "@/components/submit-button";

export function DeleteDonationForm({ donationId }: { donationId: string }) {
  return (
    <form
      action={deleteDonation.bind(null, donationId)}
      className="mt-6 border-t border-border pt-6"
      onSubmit={(e) => {
        if (!confirm("Delete this donation record?")) e.preventDefault();
      }}
    >
      <SubmitButton
        pendingLabel="Deleting…"
        className="rounded-md border border-red-300 bg-white px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
      >
        Delete donation
      </SubmitButton>
    </form>
  );
}
