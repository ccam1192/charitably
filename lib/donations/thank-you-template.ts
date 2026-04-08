export type ThankYouTemplateInput = {
  donorName: string | null;
  donorEmail: string | null;
  amount: number;
  currency: string;
  donationDate: string;
  conferenceName: string;
  notes: string | null;
};

const money = (amount: number, currency: string) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency || "USD",
  }).format(amount);

/**
 * Simple thank-you copy for a one-time gift (used for preview / future email send).
 */
export function buildThankYouEmail(input: ThankYouTemplateInput): { subject: string; body: string } {
  const displayName = input.donorName?.trim() || "Friend";
  const amt = money(input.amount, input.currency);
  const subject = `Thank you for supporting ${input.conferenceName}`;

  const lines = [
    `Dear ${displayName},`,
    "",
    `On behalf of ${input.conferenceName} and St. Vincent de Paul, thank you for your gift of ${amt} received on ${input.donationDate}.`,
    "",
    "Your generosity helps neighbors in need in our community. We are grateful for your trust and partnership.",
    "",
  ];

  if (input.notes?.trim()) {
    lines.push(`We noted the following with your gift: ${input.notes.trim()}`);
    lines.push("");
  }

  lines.push("With gratitude,");
  lines.push(input.conferenceName);

  if (input.donorEmail?.trim()) {
    lines.push("");
    lines.push(`(This message would be sent to ${input.donorEmail.trim()}.)`);
  }

  return { subject, body: lines.join("\n") };
}
