import Link from "next/link";
import { notFound } from "next/navigation";
import { NeighborTabs } from "@/components/neighbors/neighbor-tabs";
import { getNeighborById } from "@/lib/data/neighbors";

export async function NeighborDetailShell({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const neighbor = await getNeighborById(id);
  if (!neighbor) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/neighbors" className="text-sm text-muted hover:text-foreground">
          ← Neighbors
        </Link>
        <div className="mt-2 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-semibold text-foreground">{neighbor.full_name}</h2>
        </div>
      </div>

      <NeighborTabs neighborId={id} />
      <div className="pt-2">{children}</div>
    </div>
  );
}
