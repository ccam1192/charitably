/** @deprecated Use lib/expenses.ts — kept for gradual import migration. */
export {
  ASSISTANCE_EXPENSE_CATEGORY_VALUES as FINANCIAL_ASSISTANCE_CATEGORY_VALUES,
  type AssistanceExpenseCategory as FinancialAssistanceCategory,
  ASSISTANCE_EXPENSE_CATEGORY_OPTIONS as FINANCIAL_ASSISTANCE_CATEGORY_OPTIONS,
  formatExpenseCategoryLabel as formatAssistanceCategoryLabel,
  parseAssistanceExpenseCategory as parseAssistanceCategory,
} from "@/lib/expenses";
