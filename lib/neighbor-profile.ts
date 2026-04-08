/** Referral source and needs category values match DB check constraints (00011_neighbors_extended_profile). */

export const REFERRAL_SOURCE_VALUES = [
  "parish",
  "hotline",
  "walk_in",
  "friend_family",
  "social_worker",
  "hospital",
  "school",
  "online",
  "returning_neighbor",
  "other",
] as const;

export type ReferralSource = (typeof REFERRAL_SOURCE_VALUES)[number];

export const REFERRAL_SOURCE_OPTIONS: { value: ReferralSource; label: string }[] = [
  { value: "parish", label: "Parish" },
  { value: "hotline", label: "Hotline" },
  { value: "walk_in", label: "Walk-in" },
  { value: "friend_family", label: "Friend or family" },
  { value: "social_worker", label: "Social worker" },
  { value: "hospital", label: "Hospital" },
  { value: "school", label: "School" },
  { value: "online", label: "Online" },
  { value: "returning_neighbor", label: "Returning neighbor" },
  { value: "other", label: "Other" },
];

export const NEEDS_CATEGORY_VALUES = [
  "housing",
  "utilities",
  "food",
  "transportation",
  "medical",
  "employment",
  "emergency",
  "other",
] as const;

export type NeedsCategory = (typeof NEEDS_CATEGORY_VALUES)[number];

export const NEEDS_CATEGORY_OPTIONS: { value: NeedsCategory; label: string }[] = [
  { value: "housing", label: "Housing" },
  { value: "utilities", label: "Utilities" },
  { value: "food", label: "Food" },
  { value: "transportation", label: "Transportation" },
  { value: "medical", label: "Medical" },
  { value: "employment", label: "Employment" },
  { value: "emergency", label: "Emergency" },
  { value: "other", label: "Other" },
];

export function isReferralSource(v: string | null | undefined): v is ReferralSource {
  return v != null && (REFERRAL_SOURCE_VALUES as readonly string[]).includes(v);
}

export function isNeedsCategory(v: string | null | undefined): v is NeedsCategory {
  return v != null && (NEEDS_CATEGORY_VALUES as readonly string[]).includes(v);
}
