export function AssigneeSelect({
  volunteers,
  name = "assigned_to",
  label = "Assigned to",
  defaultValue = "",
  htmlId,
}: {
  volunteers: { id: string; full_name: string | null }[];
  name?: string;
  label?: string;
  defaultValue?: string | null;
  /** Unique DOM id when multiple selects share the same name on one page. */
  htmlId?: string;
}) {
  const domId = htmlId ?? name;
  return (
    <div>
      <label htmlFor={domId} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <select
        id={domId}
        name={name}
        defaultValue={defaultValue ?? ""}
        className="mt-1 w-full min-w-[10rem] rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-accent focus:ring-2"
      >
        <option value="">Unassigned</option>
        {volunteers.map((v) => (
          <option key={v.id} value={v.id}>
            {v.full_name?.trim() || "Unnamed"}
          </option>
        ))}
      </select>
    </div>
  );
}
