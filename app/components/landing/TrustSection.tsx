import { Container, Section } from "./Section";

function TestimonialPlaceholder() {
  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="size-10 rounded-full bg-stone-100" aria-hidden="true" />
        <div className="min-w-0">
          <div className="h-2.5 w-40 rounded bg-stone-200" />
          <div className="mt-2 h-2 w-28 rounded bg-stone-100" />
        </div>
      </div>
      <div className="mt-5 space-y-2">
        <div className="h-2 w-full rounded bg-stone-100" />
        <div className="h-2 w-11/12 rounded bg-stone-100" />
        <div className="h-2 w-9/12 rounded bg-stone-100" />
      </div>
    </div>
  );
}

export function TrustSection() {
  return (
    <Section id="trust" className="border-y border-border/60 bg-white">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="max-w-xl">
            <h2 className="text-balance text-3xl font-semibold tracking-tight">
              Built specifically for St. Vincent de Paul volunteers
            </h2>
            <p className="mt-3 text-pretty text-muted">
              Charitably is designed around the way conferences actually work—neighbors, visits, calls, assistance, and
              follow-ups.
            </p>

            <div className="mt-7 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-background p-5 shadow-sm">
                <div className="text-sm font-semibold">Clear records</div>
                <div className="mt-1 text-sm text-muted">Keep consistent notes and histories without hunting through spreadsheets.</div>
              </div>
              <div className="rounded-2xl border border-border bg-background p-5 shadow-sm">
                <div className="text-sm font-semibold">Volunteer-friendly</div>
                <div className="mt-1 text-sm text-muted">Simple UI with the right structure—fast to learn, easy to use.</div>
              </div>
            </div>
          </div>

          <div>
            <div className="grid gap-4 sm:grid-cols-2">
              <TestimonialPlaceholder />
              <TestimonialPlaceholder />
              <TestimonialPlaceholder />
              <TestimonialPlaceholder />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

