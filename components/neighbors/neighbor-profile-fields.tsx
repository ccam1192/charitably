import type { ReactNode } from "react";
import type { NeighborRow } from "@/lib/data/neighbors";
import { NEEDS_CATEGORY_OPTIONS } from "@/lib/neighbor-profile";
import { FormField } from "@/components/neighbors/form-field";
import { ReferralSourceFields } from "@/components/neighbors/referral-source-fields";

function numFieldDefault(v: number | null | undefined): string {
  return v != null && Number.isFinite(v) ? String(v) : "";
}

function NeighborCard({
  title,
  children,
  className,
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-lg border border-border bg-card p-6 shadow-sm ${className ?? ""}`}
    >
      <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

type Defaults = Partial<NeighborRow> | null | undefined;

export function NeighborProfileFields({ neighbor }: { neighbor?: Defaults }) {
  const n = neighbor ?? {};

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <NeighborCard title="Basic information">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            label="Full name"
            name="full_name"
            required
            defaultValue={n.full_name ?? ""}
          />
          <FormField label="Phone" name="phone" type="tel" defaultValue={n.phone} />
          <FormField label="Email" name="email" type="email" defaultValue={n.email} />
          <FormField
            label="Address"
            name="address"
            rows={3}
            wrapperClassName="md:col-span-2"
            defaultValue={n.address}
            placeholder="Street, city, state, ZIP"
          />
        </div>
      </NeighborCard>

      <NeighborCard title="Household">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            label="Total household size"
            name="household_size"
            type="number"
            min="0"
            step="1"
            defaultValue={numFieldDefault(n.household_size)}
          />
          <FormField
            label="Number of adults"
            name="adults_count"
            type="number"
            min="0"
            step="1"
            defaultValue={numFieldDefault(n.adults_count)}
          />
          <FormField
            label="Number of children"
            name="children_count"
            type="number"
            min="0"
            step="1"
            defaultValue={numFieldDefault(n.children_count)}
          />
          <FormField
            label="Number of dependents"
            name="dependents_count"
            type="number"
            min="0"
            step="1"
            defaultValue={numFieldDefault(n.dependents_count)}
          />
          <FormField
            label="Household notes"
            name="composition_notes"
            rows={3}
            wrapperClassName="md:col-span-2"
            defaultValue={n.composition_notes}
            placeholder="Living situation, family composition, etc."
          />
        </div>
      </NeighborCard>

      <NeighborCard title="Referral">
        <ReferralSourceFields
          defaultSource={n.referral_source ?? null}
          defaultOther={n.referral_source_other ?? null}
        />
      </NeighborCard>

      <NeighborCard title="Needs">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormField
            label="Primary needs category"
            name="needs_category"
            options={NEEDS_CATEGORY_OPTIONS}
            defaultValue={n.needs_category ?? ""}
          />
          <FormField
            label="Needs summary"
            name="needs_summary"
            rows={6}
            wrapperClassName="md:col-span-2"
            defaultValue={n.needs_summary}
            placeholder="How can we help this neighbor?"
          />
        </div>
      </NeighborCard>

      <NeighborCard title="Additional notes" className="lg:col-span-2">
        <FormField
          label="General notes"
          name="notes"
          rows={6}
          defaultValue={n.notes}
          placeholder="Anything else the conference should know"
        />
      </NeighborCard>
    </div>
  );
}
