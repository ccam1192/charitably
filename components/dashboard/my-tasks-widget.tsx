import Link from "next/link";
import type { TaskListRow } from "@/lib/data/tasks";

const typeLabel: Record<string, string> = {
  visit: "Visit",
  call: "Call",
  follow_up: "Follow-up",
};

const dueFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

function formatDue(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso + "T12:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return dueFmt.format(d);
}

export function MyTasksWidget({ tasks }: { tasks: TaskListRow[] }) {
  return (
    <section>
      <div>
        <h2 className="text-sm font-medium uppercase tracking-wide text-muted">My tasks</h2>
        <p className="mt-1 text-xs text-muted">Pending work assigned to you (up to five, soonest due first).</p>
      </div>
      <div className="mt-4 overflow-hidden rounded-lg border border-border bg-card">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-stone-50 text-xs font-medium uppercase tracking-wide text-muted">
            <tr>
              <th className="px-4 py-3">Task</th>
              <th className="whitespace-nowrap px-4 py-3">Due</th>
              <th className="whitespace-nowrap px-4 py-3 text-right" aria-label="Open task" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-muted">
                  No pending tasks.{" "}
                  <Link href="/tasks/new" className="text-accent underline-offset-2 hover:underline">
                    Create one
                  </Link>
                  .
                </td>
              </tr>
            ) : (
              tasks.map((t) => (
                <tr key={t.id}>
                  <td className="max-w-[min(100%,28rem)] px-4 py-3">
                    <p className="font-medium text-foreground">
                      <span className="text-muted">{typeLabel[t.task_type] ?? t.task_type}</span>
                      {t.neighbor_name ? (
                        <span className="font-normal text-muted"> · {t.neighbor_name}</span>
                      ) : null}
                    </p>
                    {t.notes ? (
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted">{t.notes}</p>
                    ) : null}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted">
                    {t.due_date ? (
                      <time dateTime={t.due_date}>{formatDue(t.due_date)}</time>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link
                      href={`/tasks#task-${t.id}`}
                      className="text-xs font-medium text-accent hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
