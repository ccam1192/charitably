-- Charitably — normalized multi-tenant schema (chapter-scoped)
-- Run in Supabase SQL Editor on a fresh project, or reset the DB first.

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- updated_at helper
-- -----------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- chapters
-- -----------------------------------------------------------------------------
create table public.chapters (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  parish_name text,
  city text,
  state text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger chapters_set_updated_at
  before update on public.chapters
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- users (1:1 with auth.users; volunteers / chapter staff)
-- -----------------------------------------------------------------------------
create table public.users (
  id uuid primary key references auth.users (id) on delete cascade,
  chapter_id uuid not null references public.chapters (id) on delete restrict,
  full_name text,
  email text,
  role text not null default 'volunteer'
    check (role in ('volunteer', 'coordinator', 'president')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index users_chapter_id_idx on public.users (chapter_id);
create index users_email_idx on public.users (email) where email is not null;

create trigger users_set_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- neighbors
-- -----------------------------------------------------------------------------
create table public.neighbors (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters (id) on delete cascade,
  full_name text not null,
  phone text,
  email text,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index neighbors_chapter_id_idx on public.neighbors (chapter_id);
create index neighbors_chapter_full_name_idx on public.neighbors (chapter_id, full_name);
create index neighbors_phone_idx on public.neighbors (phone) where phone is not null;

create trigger neighbors_set_updated_at
  before update on public.neighbors
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- visits
-- -----------------------------------------------------------------------------
create table public.visits (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters (id) on delete cascade,
  neighbor_id uuid not null references public.neighbors (id) on delete restrict,
  volunteer_id uuid references public.users (id) on delete set null,
  visit_date date not null default (current_date),
  notes text,
  next_steps text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index visits_chapter_id_idx on public.visits (chapter_id);
create index visits_neighbor_id_idx on public.visits (neighbor_id);
create index visits_volunteer_id_idx on public.visits (volunteer_id);
create index visits_visit_date_idx on public.visits (chapter_id, visit_date desc);

create trigger visits_set_updated_at
  before update on public.visits
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- calls
-- -----------------------------------------------------------------------------
create table public.calls (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters (id) on delete cascade,
  neighbor_id uuid not null references public.neighbors (id) on delete restrict,
  volunteer_id uuid references public.users (id) on delete set null,
  call_date date not null default (current_date),
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index calls_chapter_id_idx on public.calls (chapter_id);
create index calls_neighbor_id_idx on public.calls (neighbor_id);
create index calls_volunteer_id_idx on public.calls (volunteer_id);
create index calls_call_date_idx on public.calls (chapter_id, call_date desc);

create trigger calls_set_updated_at
  before update on public.calls
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- financial_assistance
-- -----------------------------------------------------------------------------
create table public.financial_assistance (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters (id) on delete cascade,
  neighbor_id uuid not null references public.neighbors (id) on delete restrict,
  amount numeric(14, 2) not null check (amount >= 0),
  currency text not null default 'USD',
  assistance_date date not null default (current_date),
  purpose text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index financial_assistance_chapter_id_idx on public.financial_assistance (chapter_id);
create index financial_assistance_neighbor_id_idx on public.financial_assistance (neighbor_id);
create index financial_assistance_date_idx on public.financial_assistance (chapter_id, assistance_date desc);

create trigger financial_assistance_set_updated_at
  before update on public.financial_assistance
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- donations
-- -----------------------------------------------------------------------------
create table public.donations (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters (id) on delete cascade,
  donor_name text,
  donor_email text,
  amount numeric(14, 2) not null check (amount >= 0),
  currency text not null default 'USD',
  donation_date date not null default (current_date),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index donations_chapter_id_idx on public.donations (chapter_id);
create index donations_donation_date_idx on public.donations (chapter_id, donation_date desc);
create index donations_donor_email_idx on public.donations (donor_email) where donor_email is not null;

create trigger donations_set_updated_at
  before update on public.donations
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- tasks
-- -----------------------------------------------------------------------------
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters (id) on delete cascade,
  assigned_to uuid references public.users (id) on delete set null,
  related_neighbor_id uuid references public.neighbors (id) on delete set null,
  task_type text not null default 'other'
    check (task_type in ('call', 'visit', 'follow_up', 'other')),
  due_date date,
  status text not null default 'open'
    check (status in ('open', 'in_progress', 'completed', 'cancelled')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_chapter_id_idx on public.tasks (chapter_id);
create index tasks_assigned_to_idx on public.tasks (assigned_to) where assigned_to is not null;
create index tasks_related_neighbor_id_idx on public.tasks (related_neighbor_id) where related_neighbor_id is not null;
create index tasks_due_status_idx on public.tasks (chapter_id, due_date, status);

create trigger tasks_set_updated_at
  before update on public.tasks
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Tenant integrity: chapter_id must match neighbor / user chapters
-- -----------------------------------------------------------------------------
create or replace function public.enforce_visit_call_assistance_chapter()
returns trigger
language plpgsql
as $$
declare
  n_chapter uuid;
  u_chapter uuid;
begin
  select chapter_id into n_chapter from public.neighbors where id = new.neighbor_id;
  if n_chapter is null then
    raise exception 'neighbor_id is invalid';
  end if;
  if new.chapter_id is distinct from n_chapter then
    raise exception 'chapter_id must match neighbor chapter_id';
  end if;

  if new.volunteer_id is not null then
    select chapter_id into u_chapter from public.users where id = new.volunteer_id;
    if u_chapter is null then
      raise exception 'volunteer_id is invalid';
    end if;
    if new.chapter_id is distinct from u_chapter then
      raise exception 'chapter_id must match volunteer chapter_id';
    end if;
  end if;

  return new;
end;
$$;

create trigger visits_enforce_chapter
  before insert or update on public.visits
  for each row execute function public.enforce_visit_call_assistance_chapter();

create trigger calls_enforce_chapter
  before insert or update on public.calls
  for each row execute function public.enforce_visit_call_assistance_chapter();

create or replace function public.enforce_financial_assistance_chapter()
returns trigger
language plpgsql
as $$
declare
  n_chapter uuid;
begin
  select chapter_id into n_chapter from public.neighbors where id = new.neighbor_id;
  if n_chapter is null then
    raise exception 'neighbor_id is invalid';
  end if;
  if new.chapter_id is distinct from n_chapter then
    raise exception 'chapter_id must match neighbor chapter_id';
  end if;
  return new;
end;
$$;

create trigger financial_assistance_enforce_chapter
  before insert or update on public.financial_assistance
  for each row execute function public.enforce_financial_assistance_chapter();

create or replace function public.enforce_tasks_chapter()
returns trigger
language plpgsql
as $$
declare
  n_chapter uuid;
  u_chapter uuid;
begin
  if new.related_neighbor_id is not null then
    select chapter_id into n_chapter from public.neighbors where id = new.related_neighbor_id;
    if n_chapter is null then
      raise exception 'related_neighbor_id is invalid';
    end if;
    if new.chapter_id is distinct from n_chapter then
      raise exception 'chapter_id must match related neighbor chapter_id';
    end if;
  end if;

  if new.assigned_to is not null then
    select chapter_id into u_chapter from public.users where id = new.assigned_to;
    if u_chapter is null then
      raise exception 'assigned_to is invalid';
    end if;
    if new.chapter_id is distinct from u_chapter then
      raise exception 'chapter_id must match assignee chapter_id';
    end if;
  end if;

  return new;
end;
$$;

create trigger tasks_enforce_chapter
  before insert or update on public.tasks
  for each row execute function public.enforce_tasks_chapter();

-- -----------------------------------------------------------------------------
-- RLS helpers
-- -----------------------------------------------------------------------------
create or replace function public.current_chapter_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select chapter_id from public.users where id = auth.uid();
$$;

grant execute on function public.current_chapter_id() to authenticated;

create or replace function public.chapter_exists(target uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.chapters c where c.id = target);
$$;

grant execute on function public.chapter_exists(uuid) to authenticated;

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.chapters enable row level security;
alter table public.users enable row level security;
alter table public.neighbors enable row level security;
alter table public.visits enable row level security;
alter table public.calls enable row level security;
alter table public.financial_assistance enable row level security;
alter table public.donations enable row level security;
alter table public.tasks enable row level security;

create policy "chapters_select_own"
  on public.chapters for select
  using (id = public.current_chapter_id());

create policy "users_select_same_chapter"
  on public.users for select
  using (chapter_id = public.current_chapter_id());

create policy "users_update_self"
  on public.users for update
  using (id = auth.uid())
  with check (chapter_id = public.current_chapter_id());

create policy "users_insert_self_once"
  on public.users for insert
  with check (
    id = auth.uid()
    and public.chapter_exists(chapter_id)
  );

create policy "neighbors_all_in_chapter"
  on public.neighbors for all
  using (chapter_id = public.current_chapter_id())
  with check (chapter_id = public.current_chapter_id());

create policy "visits_all_in_chapter"
  on public.visits for all
  using (chapter_id = public.current_chapter_id())
  with check (chapter_id = public.current_chapter_id());

create policy "calls_all_in_chapter"
  on public.calls for all
  using (chapter_id = public.current_chapter_id())
  with check (chapter_id = public.current_chapter_id());

create policy "financial_assistance_all_in_chapter"
  on public.financial_assistance for all
  using (chapter_id = public.current_chapter_id())
  with check (chapter_id = public.current_chapter_id());

create policy "donations_all_in_chapter"
  on public.donations for all
  using (chapter_id = public.current_chapter_id())
  with check (chapter_id = public.current_chapter_id());

create policy "tasks_all_in_chapter"
  on public.tasks for all
  using (chapter_id = public.current_chapter_id())
  with check (chapter_id = public.current_chapter_id());

-- -----------------------------------------------------------------------------
-- Auth: bootstrap user row from signup metadata
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  cid uuid;
begin
  cid := (new.raw_user_meta_data->>'chapter_id')::uuid;
  if cid is not null then
    insert into public.users (id, chapter_id, full_name, email)
    values (
      new.id,
      cid,
      coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
      new.email
    );
  end if;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

comment on table public.chapters is 'SVdP chapter (tenant).';
comment on table public.users is 'Chapter member; id matches auth.users.';
comment on column public.financial_assistance.amount is 'Currency units (e.g. USD dollars), not cents.';
comment on column public.donations.amount is 'Currency units (e.g. USD dollars), not cents.';
