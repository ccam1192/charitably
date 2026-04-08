import Link from "next/link";
import { notFound } from "next/navigation";
import { updateDonation } from "@/app/(app)/donations/actions";
import { DonationForm } from "@/components/donations/donation-form";
import { DeleteDonationForm } from "@/components/donations/delete-donation-form";
import { ThankYouEmailPanel } from "@/components/donations/thank-you-email";
import { getDonationById } from "@/lib/data/donations";

function toAmountString(v: number | string): string {
  if (typeof v === "number") return String(v);
  const n = parseFloat(v);
  return Number.isFinite(n) ? String(n) : "";
}

export default async function EditDonationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const donation = await getDonationById(id);
  if (!donation) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link href="/donations" className="text-sm text-muted hover:text-foreground">
          ← Donations
        </Link>
        <h2 className="mt-2 text-xl font-semibold text-foreground">Edit donation</h2>
        <p className="mt-1 text-sm text-muted">
          Logged {donation.donation_date} ·{" "}
          <span className="tabular-nums">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: donation.currency || "USD",
            }).format(typeof donation.amount === "string" ? parseFloat(donation.amount) : donation.amount)}
          </span>
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <section className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <h3 className="text-sm font-medium text-foreground">Donor &amp; gift details</h3>
        <div className="mt-4">
          <DonationForm
            action={updateDonation.bind(null, id)}
            submitLabel="Save changes"
            defaults={{
              donor_name: donation.donor_name,
              donor_email: donation.donor_email,
              amount: toAmountString(donation.amount),
              currency: donation.currency,
              donation_date: donation.donation_date,
              notes: donation.notes,
            }}
          />
        </div>
      </section>

      <ThankYouEmailPanel donationId={id} />

      <DeleteDonationForm donationId={id} />
    </div>
  );
}
