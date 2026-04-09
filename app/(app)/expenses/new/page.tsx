import Link from "next/link";
import { redirect } from "next/navigation";
import { AddExpenseForm } from "@/components/expenses/add-expense-form";
import { createClient } from "@/lib/supabase/server";
import { getNeighborOptions } from "@/lib/data/neighbors";

export default async function NewExpensePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

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

  const neighbors = await getNeighborOptions();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <Link href="/expenses" className="text-sm text-muted hover:text-foreground">
          ← Expenses
        </Link>
        <h2 className="mt-2 text-xl font-semibold text-foreground">Add expense</h2>
        <p className="mt-1 text-sm text-muted">
          Link the expense to a neighbor for assistance, or choose a conference expense.
        </p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      ) : null}

      <AddExpenseForm neighbors={neighbors} today={today} />
    </div>
  );
}
