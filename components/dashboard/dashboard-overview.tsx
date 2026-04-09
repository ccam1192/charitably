import Link from "next/link";
import type { ActivityRow, AssistanceRow } from "@/lib/data/dashboard";
import { activityViewHref } from "@/components/dashboard/activity-links";
import { ActivityDot } from "@/components/dashboard/activity-dot";
import { DashboardQuickActions } from "@/components/dashboard/dashboard-quick-actions";
import { StatWidget } from "@/components/dashboard/stat-widget";
import { MyTasksWidget } from "@/components/dashboard/my-tasks-widget";
import type { TaskListRow } from "@/lib/data/tasks";
import { formatAssistanceCategoryLabel } from "@/lib/financial-assistance";

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateTime = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

function toAmount(v: number | string): number {
  if (typeof v === "number") return v;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : 0;
}

type Props = {
  activity: ActivityRow[];
  assistanceRows: AssistanceRow[];
  rpcMissing: boolean;
  neighborCount: number;
  myTasks: TaskListRow[];
  myOpenTaskCount: number;
};

export function DashboardOverview({
  activity,
  assistanceRows,
  rpcMissing,
  neighborCount,
  myTasks,
  myOpenTaskCount,
}: Props) {
  return (
    <div className="space-y-10">
      {rpcMissing ? (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Dashboard totals require SQL functions. Run{" "}
          <code className="rounded bg-amber-100/80 px-1 font-mono text-xs">
            supabase/migrations/00003_dashboard_rpcs.sql
          </code>{" "}
          in the Supabase SQL Editor.
        </p>
      ) : null}

      <DashboardQuickActions />

      <section>
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted">Overview</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <StatWidget
            label="Active neighbors"
            value={String(neighborCount)}
            viewAllHref="/neighbors"
          />
          <StatWidget
            label="My open tasks"
            value={String(myOpenTaskCount)}
            viewAllHref="/tasks"
          />
        </div>
      </section>

      <MyTasksWidget tasks={myTasks} />

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
            Recent activity
          </h2>
          <p className="mt-1 text-xs text-muted">
            Latest logged visits, calls, and assistance for your conference.
          </p>
          <ul className="mt-4 divide-y divide-border rounded-lg border border-border bg-card">
            {rpcMissing ? (
              <li className="px-4 py-6 text-center text-sm text-muted">—</li>
            ) : activity.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-muted">No activity yet.</li>
            ) : (
              activity.map((a, i) => {
                const viewHref = activityViewHref(a);
                return (
                  <li
                    key={`${a.record_id ?? a.activity_type}-${a.occurred_at}-${i}`}
                    className="flex items-start gap-3 px-4 py-3"
                  >
                    <ActivityDot type={a.activity_type} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {a.title}{" "}
                        <span className="font-normal text-muted">· {a.neighbor_name}</span>
                      </p>
                      {a.detail ? (
                        <p className="mt-0.5 truncate text-xs text-muted">{a.detail}</p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
                      <time
                        className="text-xs tabular-nums text-muted"
                        dateTime={a.occurred_at}
                      >
                        {dateTime.format(new Date(a.occurred_at))}
                      </time>
                      {viewHref ? (
                        <Link
                          href={viewHref}
                          className="text-xs font-medium text-accent hover:underline"
                        >
                          View
                        </Link>
                      ) : null}
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </section>

        <section>
          <div>
            <h2 className="text-sm font-medium uppercase tracking-wide text-muted">
              Recent assistance
            </h2>
            <p className="mt-1 text-xs text-muted">Newest neighbor assistance expenses.</p>
          </div>
          <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-stone-50 text-xs font-medium text-muted">
                <tr>
                  <th className="px-3 py-2">Date</th>
                  <th className="px-3 py-2">Neighbor</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="hidden px-3 py-2 sm:table-cell">Category</th>
                  <th className="px-3 py-2 text-right" aria-label="Actions" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rpcMissing ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-muted">
                      —
                    </td>
                  </tr>
                ) : assistanceRows.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-8 text-center text-muted">
                      No assistance recorded.
                    </td>
                  </tr>
                ) : (
                  assistanceRows.map((r) => (
                    <tr key={r.id}>
                      <td className="whitespace-nowrap px-3 py-2.5 tabular-nums text-foreground">
                        {r.assistance_date}
                      </td>
                      <td className="max-w-[140px] truncate px-3 py-2.5 text-muted">
                        {r.neighbor_name}
                      </td>
                      <td className="px-3 py-2.5 text-right font-medium tabular-nums text-foreground">
                        {money.format(toAmount(r.amount))}
                      </td>
                      <td className="hidden max-w-[120px] truncate px-3 py-2.5 text-muted sm:table-cell">
                        {formatAssistanceCategoryLabel(r.category)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 text-right">
                        {r.neighbor_id ? (
                          <Link
                            href={`/neighbors/${r.neighbor_id}/assistance`}
                            className="text-xs font-medium text-accent hover:underline"
                          >
                            View
                          </Link>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
