import type { ActivityRow } from "@/lib/data/dashboard";

/** Path to the neighbor sub-page for this activity row. */
export function activityViewHref(a: ActivityRow): string | null {
  switch (a.activity_type) {
    case "visit":
      if (!a.neighbor_id) return null;
      return `/neighbors/${a.neighbor_id}/visits`;
    case "call":
      if (!a.neighbor_id) return null;
      return `/neighbors/${a.neighbor_id}/calls`;
    case "assistance":
      if (!a.neighbor_id) return null;
      return `/neighbors/${a.neighbor_id}/assistance`;
    case "expense":
      return "/expenses";
    default:
      if (!a.neighbor_id) return null;
      return `/neighbors/${a.neighbor_id}`;
  }
}
