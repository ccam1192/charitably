"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = (id: string) =>
  [
    { href: `/neighbors/${id}`, label: "Overview" },
    { href: `/neighbors/${id}/finances`, label: "Finances" },
    { href: `/neighbors/${id}/visits`, label: "Visits" },
    { href: `/neighbors/${id}/calls`, label: "Calls" },
    { href: `/neighbors/${id}/assistance`, label: "Assistance" },
    { href: `/neighbors/${id}/tasks`, label: "Tasks" },
  ] as const;

export function NeighborTabs({ neighborId }: { neighborId: string }) {
  const pathname = usePathname();
  const items = tabs(neighborId);

  return (
    <nav className="flex gap-1 border-b border-border" aria-label="Neighbor sections">
      {items.map((tab) => {
        const active =
          tab.href === `/neighbors/${neighborId}`
            ? pathname === tab.href
            : pathname.startsWith(tab.href);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={
              active
                ? "border-b-2 border-accent px-4 py-2.5 text-sm font-medium text-accent"
                : "border-b-2 border-transparent px-4 py-2.5 text-sm font-medium text-muted hover:text-foreground"
            }
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
