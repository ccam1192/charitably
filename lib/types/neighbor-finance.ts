export type NeighborFinanceType = "income" | "expense";

export type NeighborFinanceFrequency = "weekly" | "biweekly" | "monthly" | "one-time";

export type NeighborFinanceRow = {
  id: string;
  chapter_id: string;
  neighbor_id: string;
  type: NeighborFinanceType;
  category: string;
  amount: number;
  frequency: NeighborFinanceFrequency;
  source: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type NeighborFinanceMonthlySummary = {
  total_monthly_income: number;
  total_monthly_expenses: number;
  net_monthly_balance: number;
};
