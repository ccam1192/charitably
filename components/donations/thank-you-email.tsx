"use client";

import { useState } from "react";
import { simulateSendThankYouEmail } from "@/app/(app)/donations/actions";

export function ThankYouEmailPanel({ donationId }: { donationId: string }) {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<{ subject: string; body: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSend() {
    setLoading(true);
    setError(null);
    setPreview(null);
    const result = await simulateSendThankYouEmail(donationId);
    setLoading(false);
    if (result.ok) {
      setPreview({ subject: result.subject, body: result.body });
    } else {
      setError(result.error);
    }
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
      <h3 className="text-sm font-medium text-foreground">Thank-you message</h3>
      <p className="mt-1 text-xs text-muted">
        Preview only—no email is sent yet. A future integration can use the same template.
      </p>
      <button
        type="button"
        disabled={loading}
        onClick={() => void handleSend()}
        className="mt-4 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground hover:bg-stone-50 disabled:opacity-50"
      >
        {loading ? "Preparing…" : "Send Thank You Email"}
      </button>
      {error ? (
        <p className="mt-3 text-sm text-red-700">{error}</p>
      ) : null}
      {preview ? (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50/80 p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-800">Simulated send</p>
          <p className="mt-2 text-sm font-semibold text-foreground">{preview.subject}</p>
          <pre className="mt-3 max-h-80 overflow-auto whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
            {preview.body}
          </pre>
        </div>
      ) : null}
    </div>
  );
}
