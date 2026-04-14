import { Container, Section } from "./Section";

function MockScreenshotCard() {
  return (
    <div className="relative">
      <div className="absolute -inset-6 -z-10 rounded-3xl bg-gradient-to-b from-amber-200/35 via-transparent to-transparent blur-2xl" />

      <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-[0_20px_60px_-35px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between border-b border-border bg-stone-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="size-2 rounded-full bg-stone-300" />
            <div className="size-2 rounded-full bg-stone-300" />
            <div className="size-2 rounded-full bg-stone-300" />
          </div>
          <div className="text-xs font-medium text-muted">Charitably</div>
          <div className="text-xs text-muted">Demo</div>
        </div>

        <div className="p-4 sm:p-5">
          <div className="grid grid-cols-12 gap-3">
            <div className="col-span-5 rounded-lg border border-border bg-white p-3 shadow-sm">
              <div className="mb-2 h-2.5 w-24 rounded bg-stone-200" />
              <div className="space-y-2">
                <div className="h-2 w-full rounded bg-stone-100" />
                <div className="h-2 w-10/12 rounded bg-stone-100" />
                <div className="h-2 w-9/12 rounded bg-stone-100" />
              </div>
              <div className="mt-3 h-8 rounded-md bg-amber-100" />
            </div>

            <div className="col-span-7 rounded-lg border border-border bg-white p-3 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <div className="h-2.5 w-28 rounded bg-stone-200" />
                <div className="h-6 w-20 rounded-md bg-stone-100" />
              </div>
              <div className="space-y-2">
                <div className="h-10 rounded-md border border-border bg-stone-50" />
                <div className="h-10 rounded-md border border-border bg-stone-50" />
                <div className="h-10 rounded-md border border-border bg-stone-50" />
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="h-16 rounded-md border border-border bg-white" />
                <div className="h-16 rounded-md border border-border bg-white" />
                <div className="h-16 rounded-md border border-border bg-white" />
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-border bg-stone-50 p-3">
            <div className="mb-2 h-2.5 w-40 rounded bg-stone-200" />
            <div className="grid grid-cols-3 gap-2">
              <div className="h-9 rounded-md bg-white" />
              <div className="h-9 rounded-md bg-white" />
              <div className="h-9 rounded-md bg-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Hero() {
  return (
    <Section className="pt-14 sm:pt-16">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1 text-xs font-medium text-muted shadow-sm">
              Built for conference volunteers
              <span className="h-1 w-1 rounded-full bg-stone-300" />
              Simple, fast, organized
            </div>

            <h1 className="mt-5 text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Simple tools for St. Vincent de Paul conferences
            </h1>
            <p className="mt-4 max-w-xl text-pretty text-lg leading-relaxed text-muted">
              Manage neighbors, track visits, and stay organized—all in one place.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href="#contact"
                className="inline-flex items-center justify-center rounded-md bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-sm shadow-amber-900/10 transition hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Request Access
              </a>
              <a
                href="#features"
                className="inline-flex items-center justify-center rounded-md border border-border bg-white px-5 py-3 text-sm font-semibold text-foreground shadow-sm transition hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Learn More
              </a>
            </div>

            <dl className="mt-10 grid max-w-xl grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
                <dt className="text-xs font-medium text-muted">Neighbors</dt>
                <dd className="mt-1 text-sm font-semibold">Profiles & history</dd>
              </div>
              <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
                <dt className="text-xs font-medium text-muted">Visits & calls</dt>
                <dd className="mt-1 text-sm font-semibold">Notes + follow-ups</dd>
              </div>
              <div className="rounded-xl border border-border bg-white p-4 shadow-sm">
                <dt className="text-xs font-medium text-muted">Assistance</dt>
                <dd className="mt-1 text-sm font-semibold">Complete record</dd>
              </div>
            </dl>
          </div>

          <div className="lg:justify-self-end">
            <MockScreenshotCard />
          </div>
        </div>
      </Container>
    </Section>
  );
}

