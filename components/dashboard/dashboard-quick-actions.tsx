import Link from "next/link";

const actions = [
  { href: "/neighbors/new", label: "Add Neighbor" },
  { href: "/visits/new", label: "Record a Visit" },
  { href: "/calls/new", label: "Log a Call" },
] as const;

export function DashboardQuickActions() {
  return (
    <section aria-label="Quick actions">
      <h2 className="text-sm font-medium uppercase tracking-wide text-muted">Quick actions</h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-3">
        {actions.map(({ href, label }) => (
          <li key={href}>
            <Link
              href={href}
              className="flex min-h-[3.25rem] items-center justify-center rounded-lg border border-border bg-card px-4 py-3 text-center text-sm font-medium text-foreground shadow-sm transition-colors hover:border-accent/40 hover:bg-stone-50/80"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
