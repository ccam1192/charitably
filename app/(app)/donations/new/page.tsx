import Link from "next/link";
import { createDonation } from "@/app/(app)/donations/actions";
import { DonationForm } from "@/components/donations/donation-form";

export default async function NewDonationPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href="/donations" className="text-sm text-muted hover:text-foreground">
          ← Donations
        </Link>
        <h2 className="mt-2 text-xl font-semibold text-foreground">Add donation</h2>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <DonationForm action={createDonation} submitLabel="Save donation" />
      </div>
    </div>
  );
}
