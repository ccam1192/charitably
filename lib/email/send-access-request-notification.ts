/**
 * Sends an email when someone submits the landing-page “Request access” form.
 * Uses the official Resend SDK (https://resend.com). Server-only.
 *
 * In `.env.local`, set `RESEND_API_KEY` — replace `re_xxxxxxxxx` with your real key from the Resend dashboard.
 */

import { Resend } from "resend";

type AccessRequestPayload = {
  name: string;
  email: string;
  organization: string;
  message: string | null;
};

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function sendAccessRequestNotification(data: AccessRequestPayload): Promise<{
  sent: boolean;
  skipped: boolean;
}> {
  const apiKey = process.env.RESEND_API_KEY;
  const toRaw = process.env.CONTACT_NOTIFICATION_EMAIL;
  const from =
    process.env.RESEND_FROM_EMAIL?.trim() || "onboarding@resend.dev";

  if (!apiKey || !toRaw?.trim()) {
    console.warn(
      "[access-request-email] Skipping send: set RESEND_API_KEY and CONTACT_NOTIFICATION_EMAIL",
    );
    return { sent: false, skipped: true };
  }

  const to = toRaw
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (to.length === 0) {
    console.warn("[access-request-email] Skipping send: CONTACT_NOTIFICATION_EMAIL is empty");
    return { sent: false, skipped: true };
  }

  const text = [
    "New access request — Charitably landing page",
    "",
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    `Organization / conference: ${data.organization}`,
    "",
    data.message && data.message.length > 0
      ? `Message:\n${data.message}`
      : "Message: (none)",
  ].join("\n");

  const safe = {
    name: escapeHtml(data.name),
    email: escapeHtml(data.email),
    org: escapeHtml(data.organization),
    message:
      data.message && data.message.length > 0
        ? escapeHtml(data.message).replace(/\n/g, "<br />")
        : null,
  };

  const html = `
    <p><strong>New access request</strong> — Charitably landing page</p>
    <p><strong>Name:</strong> ${safe.name}<br />
    <strong>Email:</strong> ${safe.email}<br />
    <strong>Organization:</strong> ${safe.org}</p>
    <p><strong>Message</strong></p>
    <p>${safe.message ?? "(none)"}</p>
  `.trim();

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from,
    to,
    subject: `Charitably access request: ${data.organization}`,
    text,
    html,
  });

  if (error) {
    console.error("[access-request-email] Resend failed", error);
    return { sent: false, skipped: false };
  }

  return { sent: true, skipped: false };
}
