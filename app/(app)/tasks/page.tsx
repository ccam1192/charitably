import Link from "next/link";
import { completeTask, updateTaskAssignment } from "@/app/(app)/tasks/actions";
import { SubmitButton } from "@/components/submit-button";
import { TasksHashScroll } from "@/components/tasks/tasks-hash-scroll";
import { AssigneeSelect } from "@/components/tasks/assignee-select";
import { getConferenceUsers } from "@/lib/data/neighbors";
import { getTasksForConference } from "@/lib/data/tasks";

const typeLabel: Record<string, string> = {
  visit: "Visit",
  call: "Call",
  follow_up: "Follow-up",
};

const statusLabel: Record<string, string> = {
  pending: "Pending",
  completed: "Completed",
};

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const [tasks, volunteers] = await Promise.all([getTasksForConference(), getConferenceUsers()]);

  return (
    <div className="space-y-6">
      <TasksHashScroll />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Tasks</h2>
          <p className="mt-1 text-sm text-muted">
            Assign follow-ups to volunteers; optionally link a neighbor.
          </p>
        </div>
        <Link
          href="/tasks/new"
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
        >
          New task
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
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Neighbor</th>
                <th className="px-4 py-3">Due</th>
                <th className="px-4 py-3">Notes</th>
                <th className="px-4 py-3">Assignment</th>
                <th className="px-4 py-3 text-right" aria-label="Actions" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted">
                    No tasks yet.{" "}
                    <Link href="/tasks/new" className="text-accent underline-offset-2 hover:underline">
                      Create one
                    </Link>
                    .
                  </td>
                </tr>
              ) : (
                tasks.map((t) => (
                  <tr
                    key={t.id}
                    id={`task-${t.id}`}
                    className="scroll-mt-6 align-top hover:bg-stone-50/80"
                  >
                    <td className="whitespace-nowrap px-4 py-3 text-foreground">
                      {typeLabel[t.task_type] ?? t.task_type}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-muted">
                      {statusLabel[t.status] ?? t.status}
                    </td>
                    <td className="max-w-[140px] px-4 py-3 text-muted">
                      {t.related_neighbor_id && t.neighbor_name ? (
                        <Link
                          href={`/neighbors/${t.related_neighbor_id}`}
                          className="text-accent hover:underline"
                        >
                          {t.neighbor_name}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted">
                      {t.due_date ?? "—"}
                    </td>
                    <td className="max-w-[200px] px-4 py-3 text-muted">{t.notes ?? "—"}</td>
                    <td className="min-w-[220px] px-4 py-3">
                      <form
                        action={updateTaskAssignment.bind(null, t.id)}
                        className="flex flex-wrap items-end gap-2"
                      >
                        <AssigneeSelect
                          volunteers={volunteers}
                          defaultValue={t.assigned_to ?? ""}
                          htmlId={`assigned_to_${t.id}`}
                        />
                        <SubmitButton
                          pendingLabel="Saving…"
                          className="rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-stone-50"
                        >
                          Save
                        </SubmitButton>
                      </form>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <div className="flex flex-col items-end gap-2">
                        <Link
                          href={`/tasks/${t.id}/edit`}
                          className="text-xs font-medium text-accent hover:underline"
                        >
                          Edit
                        </Link>
                        {t.status === "pending" ? (
                          <form action={completeTask.bind(null, t.id)}>
                            <SubmitButton
                              pendingLabel="Completing…"
                              className="text-xs font-medium text-accent hover:underline"
                            >
                              Mark complete
                            </SubmitButton>
                          </form>
                        ) : (
                          <span className="text-xs text-muted">—</span>
                        )}
                      </div>
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
