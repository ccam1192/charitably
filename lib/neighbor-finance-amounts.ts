export type FinanceFrequency = "weekly" | "biweekly" | "monthly" | "one-time";

/** Converts entered amount to monthly equivalent for storage. */
export function toMonthlyEquivalent(amount: number, frequency: FinanceFrequency): number {
  let monthly: number;
  switch (frequency) {
    case "weekly":
      monthly = amount * 4.33;
      break;
    case "biweekly":
      monthly = amount * 2.17;
      break;
    case "monthly":
    case "one-time":
      monthly = amount;
      break;
    default:
      monthly = amount;
  }
  return Math.round(monthly * 100) / 100;
}

/** Reverses monthly storage to the amount the user originally entered (for editing). */
export function fromMonthlyEquivalent(monthly: number, frequency: FinanceFrequency): number {
  let entered: number;
  switch (frequency) {
    case "weekly":
      entered = monthly / 4.33;
      break;
    case "biweekly":
      entered = monthly / 2.17;
      break;
    case "monthly":
    case "one-time":
      entered = monthly;
      break;
    default:
      entered = monthly;
  }
  return Math.round(entered * 100) / 100;
}
