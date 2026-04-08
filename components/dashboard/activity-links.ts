import type { ActivityRow } from "@/lib/data/dashboard";

/** Path to the neighbor sub-page for this activity row. */
export function activityViewHref(a: ActivityRow): string | null {
  if (!a.neighbor_id) return null;
  const base = `/neighbors/${a.neighbor_id}`;
  switch (a.activity_type) {
    case "visit":
      return `${base}/visits`;
    case "call":
      return `${base}/calls`;
    case "assistance":
      return `${base}/assistance`;
    default:
      return base;
  }
}
