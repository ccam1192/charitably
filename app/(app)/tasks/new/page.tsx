import Link from "next/link";
import { createTask } from "@/app/(app)/tasks/actions";
import { AssigneeSelect } from "@/components/tasks/assignee-select";
import { FormField } from "@/components/neighbors/form-field";
import { SubmitButton } from "@/components/submit-button";
import { getConferenceUsers, getNeighborOptions } from "@/lib/data/neighbors";

export default async function NewTaskPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const [volunteers, neighbors] = await Promise.all([getConferenceUsers(), getNeighborOptions()]);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href="/tasks" className="text-sm text-muted hover:text-foreground">
          ← Tasks
        </Link>
        <h2 className="mt-2 text-xl font-semibold text-foreground">New task</h2>
        <p className="mt-1 text-sm text-muted">
          Assign follow-ups to volunteers; optionally link a neighbor.
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <form
        action={createTask}
        className="space-y-4 rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <div>
          <label htmlFor="task_type" className="text-sm font-medium text-foreground">
            Type
          </label>
          <select
            id="task_type"
            name="task_type"
            required
            className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-accent focus:ring-2"
            defaultValue="visit"
          >
            <option value="visit">Visit</option>
            <option value="call">Call</option>
            <option value="follow_up">Follow-up</option>
          </select>
        </div>
        <AssigneeSelect volunteers={volunteers} htmlId="assigned_to_new" />
        <div>
          <label htmlFor="related_neighbor_id" className="text-sm font-medium text-foreground">
            Related neighbor
          </label>
          <select
            id="related_neighbor_id"
            name="related_neighbor_id"
            className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-accent focus:ring-2"
            defaultValue=""
          >
            <option value="">None</option>
            {neighbors.map((n) => (
              <option key={n.id} value={n.id}>
                {n.full_name}
              </option>
            ))}
          </select>
        </div>
        <FormField label="Due date" name="due_date" type="date" defaultValue={today} />
        <FormField label="Notes" name="notes" rows={3} />
        <div className="flex flex-wrap gap-3 pt-2">
          <SubmitButton
            pendingLabel="Creating…"
            className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90"
          >
            Create task
          </SubmitButton>
          <Link
            href="/tasks"
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-stone-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
