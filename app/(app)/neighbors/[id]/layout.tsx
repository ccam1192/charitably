import { Suspense } from "react";
import { NeighborDetailShellSkeleton } from "@/components/neighbors/neighbor-detail-skeleton";
import { NeighborDetailShell } from "./neighbor-detail-shell";

export default function NeighborDetailLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<NeighborDetailShellSkeleton />}>
      <NeighborDetailShell params={params}>{children}</NeighborDetailShell>
    </Suspense>
  );
}
