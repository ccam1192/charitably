export function VolunteerSelect({
  volunteers,
  name = "volunteer_id",
  label = "Volunteer",
  defaultValue = "",
  htmlId,
}: {
  volunteers: { id: string; full_name: string | null }[];
  name?: string;
  label?: string;
  /** Selected volunteer id, or "" for “Default (you)”. */
  defaultValue?: string;
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
        className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-accent focus:ring-2"
        defaultValue={defaultValue}
      >
        <option value="">Default (you)</option>
        {volunteers.map((v) => (
          <option key={v.id} value={v.id}>
            {v.full_name?.trim() || "Unnamed"}
          </option>
        ))}
      </select>
    </div>
  );
}
