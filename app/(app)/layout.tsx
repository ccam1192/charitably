import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/server";

/** Shared segment cache for authenticated list/detail pages (Supabase data stays request-scoped). */
export const revalidate = 60;

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: member } = await supabase
    .from("users")
    .select("chapter_id, role, chapters(name)")
    .eq("id", user.id)
    .maybeSingle();

  if (!member?.chapter_id) {
    redirect("/onboarding");
  }

  const embedded = member.chapters as
    | { name: string }
    | { name: string }[]
    | null
    | undefined;
  const chapter = Array.isArray(embedded) ? embedded[0] : embedded;
  const conferenceName = chapter?.name ?? "Your conference";
  const isAdmin = member.role === "admin";

  return (
    <AppShell
      conferenceName={conferenceName}
      userEmail={user.email ?? null}
      isAdmin={isAdmin}
    >
      {children}
    </AppShell>
  );
}
