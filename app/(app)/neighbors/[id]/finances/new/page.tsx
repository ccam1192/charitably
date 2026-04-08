import Link from "next/link";
import { createNeighborFinanceEntry } from "@/app/(app)/neighbors/actions";
import { NeighborFinanceForm } from "@/components/neighbors/neighbor-finance-form";
import { getNeighborById } from "@/lib/data/neighbors";
import { notFound } from "next/navigation";

export default async function NeighborNewFinancePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;
  const neighbor = await getNeighborById(id);
  if (!neighbor) notFound();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href={`/neighbors/${id}/finances`} className="text-sm text-muted hover:text-foreground">
          ← Finances
        </Link>
        <h3 className="mt-2 text-sm font-medium text-foreground">Add entry</h3>
        <p className="mt-1 text-sm text-muted">
          Record income or expenses for {neighbor.full_name}. Amounts are converted to a monthly figure before
          saving (weekly × 4.33, biweekly × 2.17).
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <NeighborFinanceForm neighborId={id} action={createNeighborFinanceEntry.bind(null, id)} />
    </div>
  );
}
