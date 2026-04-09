import { AppSidebar } from "@/components/app-sidebar";

export function AppShell({
  conferenceName,
  userEmail,
  isAdmin,
  children,
}: {
  conferenceName: string;
  userEmail: string | null;
  isAdmin: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar conferenceName={conferenceName} userEmail={userEmail} isAdmin={isAdmin} />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-b border-border bg-card px-6 py-4">
          <h1 className="text-lg font-semibold text-foreground">Operations</h1>
          <p className="text-sm text-muted">
            Coordinate visits, calls, and assistance for your neighbors in need.
          </p>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
