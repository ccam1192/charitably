"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { NeighborRow } from "@/lib/data/neighbors";

export type NeighborListRow = NeighborRow & { assistance_total: number };

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const inputClass =
  "w-full min-w-0 rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-accent focus:ring-2";

function formatNeedsCategoryLabel(slug: string): string {
  return slug
    .split(/[\s_]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

function matchesSearch(row: NeighborListRow, q: string): boolean {
  if (!q) return true;
  const hay = [
    row.full_name,
    row.phone,
    row.email,
    row.address,
    row.needs_summary,
  ]
    .map((s) => (s ?? "").toLowerCase());
  return hay.some((h) => h.includes(q));
}

export function NeighborsListSection({ rows }: { rows: NeighborListRow[] }) {
  const [query, setQuery] = useState("");
  const [needsCategory, setNeedsCategory] = useState("");

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    for (const r of rows) {
      if (r.needs_category) set.add(r.needs_category);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((n) => {
      if (needsCategory && n.needs_category !== needsCategory) return false;
      return matchesSearch(n, q);
    });
  }, [rows, query, needsCategory]);

  if (rows.length === 0) {
    return (
      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-stone-50 text-xs font-medium uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3 text-right">Assistance</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted">
                  No neighbors yet.{" "}
                  <Link href="/neighbors/new" className="text-accent underline-offset-2 hover:underline">
                    Add the first one
                  </Link>
                  .
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-0 flex-1 sm:max-w-md">
          <label htmlFor="neighbor-search" className="text-xs font-medium uppercase tracking-wide text-muted">
            Search
          </label>
          <div className="relative mt-1">
            <input
              id="neighbor-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Name, phone, email, address…"
              autoComplete="off"
              className={query ? `${inputClass} pr-16` : inputClass}
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded px-1.5 text-xs text-muted hover:text-foreground"
                aria-label="Clear search"
              >
                Clear
              </button>
            ) : null}
          </div>
        </div>
        {categoryOptions.length > 0 ? (
          <div className="w-full min-w-[12rem] sm:w-auto">
            <label htmlFor="neighbor-needs-filter" className="text-xs font-medium uppercase tracking-wide text-muted">
              Primary need
            </label>
            <select
              id="neighbor-needs-filter"
              value={needsCategory}
              onChange={(e) => setNeedsCategory(e.target.value)}
              className={`${inputClass} mt-1`}
            >
              <option value="">All</option>
              {categoryOptions.map((c) => (
                <option key={c} value={c}>
                  {formatNeedsCategoryLabel(c)}
                </option>
              ))}
            </select>
          </div>
        ) : null}
      </div>

      <p className="text-xs text-muted">
        Showing {filtered.length} of {rows.length} neighbor{rows.length === 1 ? "" : "s"}
        {query.trim() || needsCategory ? " (filtered)" : ""}
      </p>

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-border bg-stone-50 text-xs font-medium uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3 text-right">Assistance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-muted">
                    No neighbors match your search. Try different words or clear filters.
                  </td>
                </tr>
              ) : (
                filtered.map((n) => (
                  <tr key={n.id} className="transition hover:bg-stone-50/80">
                    <td className="px-4 py-3 font-medium text-foreground">
                      <Link
                        href={`/neighbors/${n.id}`}
                        className="text-accent hover:underline"
                      >
                        {n.full_name}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-muted">{n.phone ?? "—"}</td>
                    <td
                      className="max-w-[220px] truncate px-4 py-3 text-muted"
                      title={n.address ?? undefined}
                    >
                      {n.address?.trim() ? n.address : "—"}
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums text-foreground">
                      {money.format(n.assistance_total)}
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
