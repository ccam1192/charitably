import Link from "next/link";
import { getNeighborById, getVisitsForNeighbor } from "@/lib/data/neighbors";
import { notFound } from "next/navigation";

export default async function NeighborVisitsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const [neighbor, visits] = await Promise.all([getNeighborById(id), getVisitsForNeighbor(id)]);
  if (!neighbor) notFound();

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h3 className="text-sm font-medium text-foreground">Visit history</h3>
          <Link
            href={`/neighbors/${id}/visits/new`}
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Add visit
          </Link>
        </div>
        <div className="mt-3 overflow-hidden rounded-lg border border-border bg-card shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-stone-50 text-xs font-medium uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Volunteer</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3">Next steps</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase text-muted">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {visits.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted">
                    No visits logged yet.
                  </td>
                </tr>
              ) : (
                visits.map((v) => (
                  <tr key={v.id} className="hover:bg-stone-50/80">
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-foreground">
                      {v.visit_date}
                    </td>
                    <td className="px-4 py-3 text-muted">{v.volunteer_name ?? "—"}</td>
                    <td className="max-w-xs px-4 py-3 text-muted">{v.notes ?? "—"}</td>
                    <td className="max-w-xs px-4 py-3 text-muted">{v.next_steps ?? "—"}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Link
                        href={`/neighbors/${id}/visits/${v.id}/edit`}
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
      </section>
    </div>
  );
}
