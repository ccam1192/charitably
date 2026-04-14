import { Container, Section } from "./Section";

type Step = {
  title: string;
  description: string;
  icon: React.ReactNode;
};

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid size-10 place-items-center rounded-xl border border-border bg-white shadow-sm">
      <div className="grid size-7 place-items-center rounded-lg bg-amber-100 text-amber-900">{children}</div>
    </div>
  );
}

const steps: Step[] = [
  {
    title: "Add neighbors",
    description: "Create a simple profile with household, contact info, and notes.",
    icon: (
      <Icon>
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="3" />
        </svg>
      </Icon>
    ),
  },
  {
    title: "Track visits and assistance",
    description: "Log calls, visits, and help provided with dates and follow-ups.",
    icon: (
      <Icon>
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 7V3M16 7V3M4 11h16" />
          <path d="M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
        </svg>
      </Icon>
    ),
  },
  {
    title: "Stay organized as a team",
    description: "Keep everyone aligned with tasks, notes, and consistent records.",
    icon: (
      <Icon>
        <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 11l3 3L22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      </Icon>
    ),
  },
];

export function HowItWorks() {
  return (
    <Section id="how">
      <Container>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
          <div className="max-w-xl">
            <h2 className="text-balance text-3xl font-semibold tracking-tight">How it works</h2>
            <p className="mt-3 text-pretty text-muted">
              Three simple steps that match how conferences already serve neighbors—just with better organization.
            </p>
          </div>

          <ol className="space-y-4">
            {steps.map((step, idx) => (
              <li
                key={step.title}
                className="rounded-2xl border border-border bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start gap-4">
                  <div className="flex items-center gap-3">
                    <div className="grid size-9 place-items-center rounded-xl border border-border bg-background text-sm font-semibold text-muted shadow-sm">
                      {idx + 1}
                    </div>
                    {step.icon}
                  </div>
                  <div className="pt-1">
                    <div className="text-base font-semibold">{step.title}</div>
                    <div className="mt-1 text-sm leading-relaxed text-muted">{step.description}</div>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </Section>
  );
}

