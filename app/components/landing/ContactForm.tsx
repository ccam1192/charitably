"use client";

import { useMemo, useState } from "react";
import { Container, Section } from "./Section";

type FormState = {
  name: string;
  email: string;
  organization: string;
  message: string;
};

const initialState: FormState = {
  name: "",
  email: "",
  organization: "",
  message: "",
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="text-sm font-medium">{label}</div>
      <div className="mt-2">{children}</div>
    </label>
  );
}

export function ContactForm() {
  const [form, setForm] = useState<FormState>(initialState);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    const emailOk = /^\S+@\S+\.\S+$/.test(form.email.trim());
    return form.name.trim().length > 1 && emailOk && form.organization.trim().length > 1;
  }, [form.email, form.name, form.organization]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    try {
      const res = await fetch("/api/request-access", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(data?.error ?? "Request failed");
      }

      console.log("Request access submitted", form);
      setStatus("success");
      setForm(initialState);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <Section id="contact" className="pb-20">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="max-w-xl">
            <h2 className="text-balance text-3xl font-semibold tracking-tight">Request access</h2>
            <p className="mt-3 text-pretty text-muted">
              Tell us a bit about your conference. We’ll follow up with next steps and access details.
            </p>

            <div className="mt-7 rounded-2xl border border-border bg-white p-6 shadow-sm">
              <div className="text-sm font-semibold">What happens next</div>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                <li className="flex gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-stone-300" aria-hidden="true" />
                  We’ll confirm your conference and onboarding needs.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-stone-300" aria-hidden="true" />
                  You’ll get a private workspace for your conference.
                </li>
                <li className="flex gap-2">
                  <span className="mt-1 size-1.5 shrink-0 rounded-full bg-stone-300" aria-hidden="true" />
                  We’ll help you import or start fresh—whichever is easier.
                </li>
              </ul>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-white p-6 shadow-[0_20px_60px_-35px_rgba(0,0,0,0.25)]">
            <form onSubmit={onSubmit} className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Field label="Name">
                  <input
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                    className="h-11 w-full rounded-md border border-border bg-white px-3 text-sm shadow-sm outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-200/40"
                    placeholder="Your name"
                    required
                  />
                </Field>

                <Field label="Email">
                  <input
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                    className="h-11 w-full rounded-md border border-border bg-white px-3 text-sm shadow-sm outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-200/40"
                    placeholder="you@conference.org"
                    type="email"
                    required
                  />
                </Field>
              </div>

              <Field label="Organization / Conference Name">
                <input
                  value={form.organization}
                  onChange={(e) => setForm((p) => ({ ...p, organization: e.target.value }))}
                  className="h-11 w-full rounded-md border border-border bg-white px-3 text-sm shadow-sm outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-200/40"
                  placeholder="St. Vincent de Paul — Your Conference"
                  required
                />
              </Field>

              <Field label="Message">
                <textarea
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  className="min-h-28 w-full resize-none rounded-md border border-border bg-white px-3 py-2 text-sm shadow-sm outline-none transition focus:border-amber-300 focus:ring-4 focus:ring-amber-200/40"
                  placeholder="Anything you'd like us to know (optional)."
                />
              </Field>

              <div className="pt-1">
                <button
                  type="submit"
                  disabled={!canSubmit || status === "submitting"}
                  className="inline-flex w-full items-center justify-center rounded-md bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground shadow-sm shadow-amber-900/10 transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {status === "submitting" ? "Sending..." : "Request Access"}
                </button>

                <div className="mt-3 text-xs text-muted">
                  By submitting, you agree to be contacted about Charitably access. No spam.
                </div>

                {status === "success" ? (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    Thanks — we got your request. We’ll follow up soon.
                  </div>
                ) : null}
                {status === "error" ? (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-900">
                    {error ?? "Something went wrong. Please try again."}
                  </div>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      </Container>
    </Section>
  );
}

