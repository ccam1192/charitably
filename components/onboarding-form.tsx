"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function OnboardingForm() {
  const router = useRouter();
  const [conferenceId, setConferenceId] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      setError("Not signed in");
      return;
    }
    const { error: err } = await supabase.from("users").insert({
      id: user.id,
      chapter_id: conferenceId.trim(),
      full_name: fullName.trim() || null,
      email: user.email ?? null,
    });
    setLoading(false);
    if (err) {
      setError(err.message);
      return;
    }
    router.refresh();
    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto mt-8 max-w-md space-y-4 rounded-xl border border-border bg-card p-8 shadow-sm">
      <h1 className="text-lg font-semibold text-foreground">Complete your profile</h1>
      <p className="text-sm text-muted">
        Your account needs a conference. Enter the Conference ID from your coordinator.
      </p>
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p>
      )}
      <div>
        <label htmlFor="conferenceId" className="block text-sm font-medium text-foreground">
          Conference ID
        </label>
        <input
          id="conferenceId"
          type="text"
          required
          value={conferenceId}
          onChange={(e) => setConferenceId(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 font-mono text-sm outline-none ring-accent focus:ring-2"
        />
      </div>
      <div>
        <label htmlFor="fullName" className="block text-sm font-medium text-foreground">
          Full name
        </label>
        <input
          id="fullName"
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="mt-1 w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none ring-accent focus:ring-2"
        />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-accent py-2 text-sm font-medium text-accent-foreground disabled:opacity-50"
      >
        {loading ? "Saving…" : "Continue"}
      </button>
    </form>
  );
}
