import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SubmitButton } from "@/components/submit-button";
import { CONFERENCE_EXPENSE_CATEGORY_OPTIONS } from "@/lib/expenses";
import { updateConferenceExpense } from "@/app/(app)/expenses/actions";

export default async function EditConferenceExpensePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error: qError } = await searchParams;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") {
    redirect("/dashboard");
  }

  const { data: row, error } = await supabase
    .from("expenses")
    .select("id, neighbor_id, amount, currency, expense_date, category, check_number, notes")
    .eq("id", id)
    .maybeSingle();

  if (error || !row || row.neighbor_id != null) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href="/expenses" className="text-sm font-medium text-accent hover:underline">
          ← Expenses
        </Link>
        <h2 className="mt-2 text-xl font-semibold text-foreground">Edit conference expense</h2>
      </div>

      {qError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {qError}
        </div>
      ) : null}

      <form action={updateConferenceExpense.bind(null, id)} className="space-y-4">
        <div>
          <label htmlFor="category" className="text-sm font-medium text-foreground">
            Category
          </label>
          <select
            id="category"
            name="category"
            required
            defaultValue={row.category}
            className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
          >
            {CONFERENCE_EXPENSE_CATEGORY_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="amount" className="text-sm font-medium text-foreground">
            Amount
          </label>
          <input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={String(row.amount)}
            className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="expense_date" className="text-sm font-medium text-foreground">
            Date
          </label>
          <input
            id="expense_date"
            name="expense_date"
            type="date"
            required
            defaultValue={row.expense_date}
            className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="check_number" className="text-sm font-medium text-foreground">
            Check # / Invoice #
          </label>
          <input
            id="check_number"
            name="check_number"
            type="text"
            defaultValue={row.check_number ?? ""}
            className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="notes" className="text-sm font-medium text-foreground">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            defaultValue={row.notes ?? ""}
            className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="currency" className="text-sm font-medium text-foreground">
            Currency
          </label>
          <input
            id="currency"
            name="currency"
            type="text"
            maxLength={8}
            defaultValue={row.currency ?? "USD"}
            className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm"
          />
        </div>
        <SubmitButton className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:opacity-90">
          Save
        </SubmitButton>
      </form>
    </div>
  );
}
