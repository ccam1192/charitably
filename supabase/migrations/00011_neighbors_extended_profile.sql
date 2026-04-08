-- Extended neighbor profile: household, referral source, needs (chapter-scoped via existing RLS).

alter table public.neighbors
  add column if not exists household_size integer,
  add column if not exists adults_count integer,
  add column if not exists children_count integer,
  add column if not exists dependents_count integer,
  add column if not exists composition_notes text,
  add column if not exists referral_source text,
  add column if not exists referral_source_other text,
  add column if not exists needs_summary text,
  add column if not exists needs_category text;

-- created_at / updated_at already exist on neighbors (00001_initial_schema)

alter table public.neighbors drop constraint if exists neighbors_referral_source_check;
alter table public.neighbors add constraint neighbors_referral_source_check
  check (
    referral_source is null
    or referral_source in (
      'parish',
      'hotline',
      'walk_in',
      'friend_family',
      'social_worker',
      'hospital',
      'school',
      'online',
      'returning_neighbor',
      'other'
    )
  );

alter table public.neighbors drop constraint if exists neighbors_needs_category_check;
alter table public.neighbors add constraint neighbors_needs_category_check
  check (
    needs_category is null
    or needs_category in (
      'housing',
      'utilities',
      'food',
      'transportation',
      'medical',
      'employment',
      'emergency',
      'other'
    )
  );

comment on column public.neighbors.household_size is 'Total people in household';
comment on column public.neighbors.adults_count is 'Number of adults';
comment on column public.neighbors.children_count is 'Number of children';
comment on column public.neighbors.dependents_count is 'Dependents (e.g. elderly, disabled)';
comment on column public.neighbors.composition_notes is 'Free-text household notes';
comment on column public.neighbors.referral_source is 'How the neighbor was referred (controlled vocabulary)';
comment on column public.neighbors.referral_source_other is 'Detail when referral_source is other';
comment on column public.neighbors.needs_summary is 'Narrative summary of needs';
comment on column public.neighbors.needs_category is 'Primary needs category (controlled vocabulary)';
