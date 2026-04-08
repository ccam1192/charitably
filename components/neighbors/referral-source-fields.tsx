"use client";

import { useState } from "react";
import { REFERRAL_SOURCE_OPTIONS } from "@/lib/neighbor-profile";

const inputClass =
  "mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground outline-none ring-accent focus:ring-2";

export function ReferralSourceFields({
  defaultSource,
  defaultOther,
}: {
  defaultSource: string | null;
  defaultOther: string | null;
}) {
  const [source, setSource] = useState(defaultSource ?? "");

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="referral_source" className="text-sm font-medium text-foreground">
          Referral source
        </label>
        <select
          id="referral_source"
          name="referral_source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className={inputClass}
        >
          <option value="">— Select —</option>
          {REFERRAL_SOURCE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      {source === "other" ? (
        <div>
          <label htmlFor="referral_source_other" className="text-sm font-medium text-foreground">
            Specify source
          </label>
          <input
            id="referral_source_other"
            name="referral_source_other"
            type="text"
            defaultValue={defaultOther ?? ""}
            className={inputClass}
            placeholder="How did they hear about us?"
          />
        </div>
      ) : null}
    </div>
  );
}
