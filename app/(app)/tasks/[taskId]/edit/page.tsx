import Link from "next/link";
import { updateTask } from "@/app/(app)/tasks/actions";
import { AssigneeSelect } from "@/components/tasks/assignee-select";
import { FormField } from "@/components/neighbors/form-field";
import { SubmitButton } from "@/components/submit-button";
import { getConferenceUsers, getNeighborOptions } from "@/lib/data/neighbors";
import { getTaskForEdit } from "@/lib/data/tasks";
import { notFound } from "next/navigation";

export default async function EditTaskPage({
  params,
  searchParams,
}: {
  params: Promise<{ taskId: string }>;
  searchParams: Promise<{ error?: string; returnTo?: string }>;
}) {
  const { taskId } = await params;
  const { error, returnTo } = await searchParams;
  const [task, volunteers, neighbors] = await Promise.all([
    getTaskForEdit(taskId),
    getConferenceUsers(),
    getNeighborOptions(),
  ]);
  if (!task) notFound();

  const backHref =
    returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//") ? returnTo : "/tasks";

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href={backHref} className="text-sm text-muted hover:text-foreground">
          ← Back
        </Link>
        <h2 className="mt-2 text-xl font-semibold text-foreground">Edit task</h2>
        <p className="mt-1 text-sm text-muted">Update type, status, assignment, and details.</p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <form
        action={updateTask.bind(null, taskId)}
        className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <input type="hidden" name="return_to" value={backHref} />
        <div>
          <label htmlFor="task_type_edit" className="text-sm font-medium text-foreground">
            Type
          </label>
          <select
            id="task_type_edit"
            name="task_type"
            required
            className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-accent focus:ring-2"
            defaultValue={task.task_type}
          >
            <option value="visit">Visit</option>
            <option value="call">Call</option>
            <option value="follow_up">Follow-up</option>
          </select>
        </div>
        <div>
          <label htmlFor="status_edit" className="text-sm font-medium text-foreground">
            Status
          </label>
          <select
            id="status_edit"
            name="status"
            required
            className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-accent focus:ring-2"
            defaultValue={task.status}
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        <AssigneeSelect
          volunteers={volunteers}
          defaultValue={task.assigned_to ?? ""}
          htmlId="assigned_to_edit"
        />
        <div>
          <label htmlFor="related_neighbor_id_edit" className="text-sm font-medium text-foreground">
            Related neighbor
          </label>
          <select
            id="related_neighbor_id_edit"
            name="related_neighbor_id"
            className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-accent focus:ring-2"
            defaultValue={task.related_neighbor_id ?? ""}
          >
            <option value="">None</option>
            {neighbors.map((n) => (
              <option key={n.id} value={n.id}>
                {n.full_name}
              </option>
            ))}
          </select>
        </div>
        <FormField
          label="Due date"
          name="due_date"
          type="date"
          defaultValue={task.due_date ?? ""}
        />
        <FormField label="Notes" name="notes" rows={3} defaultValue={task.notes ?? ""} />
        <div className="flex flex-wrap gap-3 pt-2">
          <SubmitButton
            pendingLabel="Saving…"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Save changes
          </SubmitButton>
          <Link
            href={backHref}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-stone-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
