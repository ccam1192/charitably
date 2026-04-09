import { redirect } from "next/navigation";

/** Legacy URL: pick a neighbor, then use their Assistance tab to add a record. */
export default function AssistanceNewRedirectPage() {
  redirect("/neighbors");
}
