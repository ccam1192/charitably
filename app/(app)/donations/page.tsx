import Link from "next/link";
import { getDonationsForConference } from "@/lib/data/donations";

function toAmount(v: number | string): number {
  if (typeof v === "number") return v;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

export default async function DonationsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const rows = await getDonationsForConference();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Donations</h2>
          <p className="mt-1 text-sm text-muted">
            Record gifts to your conference and keep donor contact information for follow-up.
          </p>
        </div>
        <Link
          href="/donations/new"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
        >
          Add donation
        </Link>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-stone-50 text-xs font-medium uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Donor</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3 text-right" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted">
                    No donations yet.{" "}
                    <Link href="/donations/new" className="text-accent underline-offset-2 hover:underline">
                      Add the first one
                    </Link>
                    .
                  </td>
                </tr>
              ) : (
                rows.map((d) => (
                  <tr key={d.id} className="transition hover:bg-stone-50/80">
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-foreground">
                      {d.donation_date}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">
                      <Link href={`/donations/${d.id}`} className="text-accent hover:underline">
                        {d.donor_name?.trim() || "—"}
                      </Link>
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-muted">
                      {d.donor_email ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-medium tabular-nums text-foreground">
                      {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: d.currency || "USD",
                      }).format(toAmount(d.amount))}
                    </td>
                    <td className="max-w-[200px] truncate px-4 py-3 text-muted">
                      {d.notes ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Link
                        href={`/donations/${d.id}`}
                        className="text-xs font-medium text-accent hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
