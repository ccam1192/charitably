import Link from "next/link";
import { updateNeighborFinanceEntry } from "@/app/(app)/neighbors/actions";
import { NeighborFinanceForm } from "@/components/neighbors/neighbor-finance-form";
import { getNeighborFinanceEntry } from "@/lib/data/neighbor-finances";
import { resolveCategoryPreset } from "@/lib/neighbor-finance-categories";
import { fromMonthlyEquivalent } from "@/lib/neighbor-finance-amounts";
import { getNeighborById } from "@/lib/data/neighbors";
import { notFound } from "next/navigation";

export default async function NeighborEditFinancePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; entryId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id, entryId } = await params;
  const { error } = await searchParams;

  const [neighbor, entry] = await Promise.all([
    getNeighborById(id),
    getNeighborFinanceEntry(id, entryId),
  ]);
  if (!neighbor || !entry) notFound();

  const amountStored =
    typeof entry.amount === "number" ? entry.amount : parseFloat(String(entry.amount));
  const amountEntered = fromMonthlyEquivalent(
    Number.isFinite(amountStored) ? amountStored : 0,
    entry.frequency,
  );
  const { preset, custom } = resolveCategoryPreset(entry.category, entry.type);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href={`/neighbors/${id}/finances`} className="text-sm text-muted hover:text-foreground">
          ← Finances
        </Link>
        <h3 className="mt-2 text-sm font-medium text-foreground">Edit entry</h3>
        <p className="mt-1 text-sm text-muted">Update this finance line for {neighbor.full_name}.</p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <NeighborFinanceForm
        neighborId={id}
        action={updateNeighborFinanceEntry.bind(null, id, entryId)}
        submitLabel="Save changes"
        initialValues={{
          type: entry.type,
          categoryPreset: preset,
          categoryCustom: custom ?? undefined,
          amountEntered: amountEntered.toFixed(2),
          frequency: entry.frequency,
          source: entry.source ?? "",
          notes: entry.notes ?? "",
        }}
      />
    </div>
  );
}
