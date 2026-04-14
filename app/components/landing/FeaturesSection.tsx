import Image from "next/image";
import { Container, Section } from "./Section";

type Feature = {
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    title: "Neighbor Management",
    description: "Keep track of families, needs, and history in one place",
  },
  {
    title: "Visit & Call Tracking",
    description: "Log visits and calls with notes and follow-ups",
  },
  {
    title: "Assistance Tracking",
    description: "Record financial and material assistance with full history",
  },
  {
    title: "Task Management",
    description: "Assign and track calls, visits, and follow-ups",
  },
];

function FeatureMock() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      <div className="border-b border-border bg-stone-50 px-4 py-3">
        <div className="h-2.5 w-28 rounded bg-stone-200" />
      </div>
      <div className="space-y-3 p-4">
        <div className="h-9 rounded-lg border border-border bg-stone-50" />
        <div className="h-9 rounded-lg border border-border bg-stone-50" />
        <div className="h-9 rounded-lg border border-border bg-stone-50" />
        <div className="grid grid-cols-3 gap-2 pt-1">
          <div className="h-12 rounded-lg border border-border bg-white" />
          <div className="h-12 rounded-lg border border-border bg-white" />
          <div className="h-12 rounded-lg border border-border bg-white" />
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-amber-200/15 via-transparent to-transparent" />
    </div>
  );
}

function AssistanceScreenshot() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      <div className="border-b border-border bg-stone-50 px-4 py-3">
        <div className="h-2.5 w-32 rounded bg-stone-200" />
      </div>
      <div className="relative">
        <Image
          src="/feature-assistance.png"
          alt="Assistance tracking: totals and assistance records table"
          width={1024}
          height={539}
          className="h-auto w-full"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-amber-200/10 via-transparent to-transparent" />
      </div>
    </div>
  );
}

function NeighborManagementScreenshot() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      <div className="border-b border-border bg-stone-50 px-4 py-3">
        <div className="h-2.5 w-36 rounded bg-stone-200" />
      </div>
      <div className="relative">
        <Image
          src="/feature-neighbors.png"
          alt="Neighbor management: searchable neighbor list with primary need and assistance totals"
          width={1024}
          height={654}
          className="h-auto w-full"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-amber-200/10 via-transparent to-transparent" />
      </div>
    </div>
  );
}

function VisitsCallsScreenshot() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      <div className="border-b border-border bg-stone-50 px-4 py-3">
        <div className="h-2.5 w-36 rounded bg-stone-200" />
      </div>
      <div className="relative">
        <Image
          src="/feature-visits-calls.png"
          alt="Visit and call tracking: visit history with notes and next steps"
          width={1024}
          height={400}
          className="h-auto w-full"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-amber-200/10 via-transparent to-transparent" />
      </div>
    </div>
  );
}

function TaskManagementScreenshot() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-white shadow-sm">
      <div className="border-b border-border bg-stone-50 px-4 py-3">
        <div className="h-2.5 w-32 rounded bg-stone-200" />
      </div>
      <div className="relative">
        <Image
          src="/feature-tasks.png"
          alt="Task management: tasks list with assignment and due dates"
          width={1024}
          height={544}
          className="h-auto w-full"
          sizes="(max-width: 768px) 100vw, 50vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-amber-200/10 via-transparent to-transparent" />
      </div>
    </div>
  );
}

export function FeaturesSection() {
  return (
    <Section id="features" className="border-y border-border/60 bg-white">
      <Container>
        <div className="max-w-2xl">
          <h2 className="text-balance text-3xl font-semibold tracking-tight">Everything your conference needs to stay organized</h2>
          <p className="mt-3 text-pretty text-muted">
            Designed for real SVdP workflows—simple enough for any volunteer, structured enough for consistent record keeping.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-2xl border border-border bg-background p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-6">
                <div>
                  <h3 className="text-lg font-semibold tracking-tight">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{feature.description}</p>
                </div>
                <div className="hidden size-10 shrink-0 rounded-xl border border-border bg-white shadow-sm md:grid md:place-items-center">
                  <div className="size-5 rounded-md bg-amber-100" />
                </div>
              </div>

              <div className="mt-6">
                {feature.title === "Neighbor Management" ? (
                  <NeighborManagementScreenshot />
                ) : feature.title === "Visit & Call Tracking" ? (
                  <VisitsCallsScreenshot />
                ) : feature.title === "Assistance Tracking" ? (
                  <AssistanceScreenshot />
                ) : feature.title === "Task Management" ? (
                  <TaskManagementScreenshot />
                ) : (
                  <FeatureMock />
                )}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
}

