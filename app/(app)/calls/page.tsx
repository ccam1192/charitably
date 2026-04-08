import Link from "next/link";
import { getCallsPage } from "@/lib/data/calls";

export default async function CallsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const pageRaw = params.page ? parseInt(params.page, 10) : 1;
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? pageRaw : 1;

  const { rows, totalCount, pageSize } = await getCallsPage(page);
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Calls</h2>
          <p className="mt-1 text-sm text-muted">
            All phone calls for your conference, newest first.
          </p>
        </div>
        <Link
          href="/calls/new"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
        >
          Record call
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="border-b border-border bg-stone-50 text-xs font-medium uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Volunteer</th>
                <th className="px-4 py-3">Neighbor</th>
                <th className="px-4 py-3">Summary</th>
                <th className="px-4 py-3 text-right" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted">
                    No calls yet.{" "}
                    <Link href="/calls/new" className="text-accent underline-offset-2 hover:underline">
                      Record the first call
                    </Link>
                    .
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="transition hover:bg-stone-50/80">
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-foreground">
                      {r.call_date}
                    </td>
                    <td className="px-4 py-3 text-muted">
                      {r.volunteer_name?.trim() || "—"}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{r.neighbor_name}</td>
                    <td className="max-w-[280px] truncate px-4 py-3 text-muted">
                      {r.summary ?? "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <Link
                        href={`/neighbors/${r.neighbor_id}/calls/${r.id}/edit`}
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

        {totalPages > 1 ? (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm">
            <p className="text-muted">
              Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} of{" "}
              {totalCount}
            </p>
            <div className="flex items-center gap-2">
              {page > 1 ? (
                <Link
                  href={page === 2 ? "/calls" : `/calls?page=${page - 1}`}
                  className="rounded-md border border-border px-3 py-1.5 font-medium text-foreground hover:bg-stone-50"
                >
                  Previous
                </Link>
              ) : (
                <span className="rounded-md border border-transparent px-3 py-1.5 text-muted">
                  Previous
                </span>
              )}
              <span className="tabular-nums text-muted">
                Page {page} of {totalPages}
              </span>
              {page < totalPages ? (
                <Link
                  href={`/calls?page=${page + 1}`}
                  className="rounded-md border border-border px-3 py-1.5 font-medium text-foreground hover:bg-stone-50"
                >
                  Next
                </Link>
              ) : (
                <span className="rounded-md border border-transparent px-3 py-1.5 text-muted">
                  Next
                </span>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
