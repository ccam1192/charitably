import Link from "next/link";
import { createTaskForNeighbor } from "@/app/(app)/tasks/actions";
import { AssigneeSelect } from "@/components/tasks/assignee-select";
import { FormField } from "@/components/neighbors/form-field";
import { SubmitButton } from "@/components/submit-button";
import { getConferenceUsers, getNeighborById } from "@/lib/data/neighbors";
import { notFound } from "next/navigation";

export default async function NeighborNewTaskPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const neighbor = await getNeighborById(id);
  if (!neighbor) notFound();

  const volunteers = await getConferenceUsers();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href={`/neighbors/${id}/tasks`} className="text-sm text-muted hover:text-foreground">
          ← Tasks
        </Link>
        <h3 className="mt-2 text-sm font-medium text-foreground">New task</h3>
        <p className="mt-1 text-sm text-muted">
          This task will be linked to {neighbor.full_name}.
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <form
        action={createTaskForNeighbor.bind(null, id)}
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
        <AssigneeSelect volunteers={volunteers} htmlId="assigned_to_neighbor_new" />
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
            href={`/neighbors/${id}/tasks`}
            className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-stone-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
