export function FormField({
  label,
  name,
  type = "text",
  defaultValue,
  required,
  rows,
  placeholder,
  min,
  step,
  options,
  wrapperClassName,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | null;
  required?: boolean;
  rows?: number;
  placeholder?: string;
  min?: string;
  step?: string;
  options?: { value: string; label: string }[];
  wrapperClassName?: string;
}) {
  const base =
    "mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-accent focus:ring-2";

  return (
    <div className={wrapperClassName}>
      <label htmlFor={name} className="text-sm font-medium text-foreground">
        {label}
        {required ? <span className="text-red-600"> *</span> : null}
      </label>
      {options?.length ? (
        <select
          id={name}
          name={name}
          defaultValue={defaultValue ?? ""}
          required={required}
          className={base}
        >
          {!required ? <option value="">— Select —</option> : null}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : rows ? (
        <textarea
          id={name}
          name={name}
          rows={rows}
          required={required}
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          className={base + " resize-y"}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          required={required}
          defaultValue={defaultValue ?? ""}
          placeholder={placeholder}
          min={min}
          step={step}
          className={base}
        />
      )}
    </div>
  );
}
