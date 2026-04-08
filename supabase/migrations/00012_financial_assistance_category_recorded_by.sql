-- Financial assistance: rename purpose → category (controlled vocabulary), check #, recorded_by, RLS + trigger.

-- -----------------------------------------------------------------------------
-- 1. Schema: rename + new columns
-- -----------------------------------------------------------------------------
alter table public.financial_assistance rename column purpose to category;

alter table public.financial_assistance
  add column if not exists check_number text,
  add column if not exists recorded_by uuid references public.users (id) on delete set null;

comment on column public.financial_assistance.check_number is 'Check # / Invoice #';
comment on column public.financial_assistance.recorded_by is 'User who created this record (set automatically)';

create index if not exists financial_assistance_recorded_by_idx
  on public.financial_assistance (recorded_by)
  where recorded_by is not null;

-- -----------------------------------------------------------------------------
-- 2. Backfill: map every row to canonical category strings (CHECK is exact-match).
--    Legacy "purpose" text often differed by case (e.g. Rent vs rent); rows that
--    normalized to a known value but were left unchanged would violate CHECK.
-- -----------------------------------------------------------------------------
update public.financial_assistance fa
set
  category = case lower(trim(fa.category::text))
    when 'rent' then 'rent'
    when 'utilities' then 'utilities'
    when 'food' then 'food'
    when 'transportation' then 'transportation'
    when 'car repair' then 'car repair'
    when 'medical' then 'medical'
    when 'prescription' then 'prescription'
    when 'burial' then 'burial'
    when 'emergency lodging' then 'emergency lodging'
    when 'employment assistance' then 'employment assistance'
    when 'other' then 'other'
    else 'other'
  end,
  notes = case
    when lower(trim(fa.category::text)) in (
      'rent',
      'utilities',
      'food',
      'transportation',
      'car repair',
      'medical',
      'prescription',
      'burial',
      'emergency lodging',
      'employment assistance',
      'other'
    ) then fa.notes
    when fa.category is not null and btrim(fa.category::text) <> '' then
      concat_ws(E'\n', nullif(trim(fa.notes), ''), 'Previous category: ' || fa.category)
    else fa.notes
  end;

alter table public.financial_assistance alter column category set not null;

alter table public.financial_assistance drop constraint if exists financial_assistance_category_check;
alter table public.financial_assistance add constraint financial_assistance_category_check
  check (
    category in (
      'rent',
      'utilities',
      'food',
      'transportation',
      'car repair',
      'medical',
      'prescription',
      'burial',
      'emergency lodging',
      'employment assistance',
      'other'
    )
  );

-- -----------------------------------------------------------------------------
-- 3. Chapter integrity: neighbor_finances uses a narrow trigger (no recorded_by column)
-- -----------------------------------------------------------------------------
create or replace function public.enforce_neighbor_financial_line_chapter()
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

drop trigger if exists neighbor_finances_enforce_chapter on public.neighbor_finances;
create trigger neighbor_finances_enforce_chapter
  before insert or update on public.neighbor_finances
  for each row execute function public.enforce_neighbor_financial_line_chapter();

-- financial_assistance: neighbor chapter + recorded_by user in same chapter
create or replace function public.enforce_financial_assistance_chapter()
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

  if new.recorded_by is not null then
    select chapter_id into u_chapter from public.users where id = new.recorded_by;
    if u_chapter is null then
      raise exception 'recorded_by is invalid';
    end if;
    if new.chapter_id is distinct from u_chapter then
      raise exception 'chapter_id must match recorded_by user chapter_id';
    end if;
  end if;

  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 4. Set recorded_by on insert; preserve on update (audit)
-- -----------------------------------------------------------------------------
create or replace function public.financial_assistance_set_recorded_by()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    new.recorded_by := auth.uid();
  elsif tg_op = 'UPDATE' then
    new.recorded_by := old.recorded_by;
  end if;
  return new;
end;
$$;

drop trigger if exists a_financial_assistance_set_recorded_by on public.financial_assistance;
create trigger a_financial_assistance_set_recorded_by
  before insert or update on public.financial_assistance
  for each row execute function public.financial_assistance_set_recorded_by();

-- -----------------------------------------------------------------------------
-- 5. RLS: chapter-scoped + insert must be attributed to current user
-- -----------------------------------------------------------------------------
drop policy if exists "financial_assistance_all_in_chapter" on public.financial_assistance;

create policy "financial_assistance_select_in_chapter"
  on public.financial_assistance for select
  using (chapter_id = public.current_chapter_id());

create policy "financial_assistance_insert_in_chapter"
  on public.financial_assistance for insert
  with check (
    chapter_id = public.current_chapter_id()
    and recorded_by = auth.uid()
  );

create policy "financial_assistance_update_in_chapter"
  on public.financial_assistance for update
  using (chapter_id = public.current_chapter_id())
  with check (chapter_id = public.current_chapter_id());

create policy "financial_assistance_delete_in_chapter"
  on public.financial_assistance for delete
  using (chapter_id = public.current_chapter_id());

-- -----------------------------------------------------------------------------
-- 6. Dashboard RPCs: purpose → category
-- -----------------------------------------------------------------------------
drop function if exists public.dashboard_recent_assistance(integer);

create or replace function public.dashboard_recent_assistance(p_limit int default 10)
returns table (
  id uuid,
  assistance_date date,
  amount numeric,
  currency text,
  category text,
  neighbor_name text,
  neighbor_id uuid
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    fa.id,
    fa.assistance_date,
    fa.amount,
    fa.currency,
    fa.category,
    n.full_name as neighbor_name,
    n.id as neighbor_id
  from public.financial_assistance fa
  inner join public.neighbors n on n.id = fa.neighbor_id
  where fa.chapter_id = public.current_chapter_id()
  order by fa.assistance_date desc, fa.created_at desc
  limit greatest(1, least(p_limit, 100));
$$;

grant execute on function public.dashboard_recent_assistance(int) to authenticated;

drop function if exists public.dashboard_recent_activity(integer);

create or replace function public.dashboard_recent_activity(p_limit int default 15)
returns table (
  activity_type text,
  occurred_at timestamptz,
  title text,
  detail text,
  neighbor_name text,
  record_id uuid,
  neighbor_id uuid
)
language sql
stable
security invoker
set search_path = public
as $$
  select * from (
    select
      'visit'::text as activity_type,
      v.created_at as occurred_at,
      'Visit'::text as title,
      left(
        coalesce(to_char(v.visit_date, 'Mon DD, YYYY') || ' — ', '') || coalesce(v.notes, ''),
        160
      ) as detail,
      n.full_name as neighbor_name,
      v.id as record_id,
      n.id as neighbor_id
    from public.visits v
    inner join public.neighbors n on n.id = v.neighbor_id
    where v.chapter_id = public.current_chapter_id()

    union all

    select
      'call'::text,
      c.created_at,
      'Call'::text,
      left(
        coalesce(to_char(c.call_date, 'Mon DD, YYYY') || ' — ', '') || coalesce(c.summary, ''),
        160
      ),
      n.full_name,
      c.id,
      n.id
    from public.calls c
    inner join public.neighbors n on n.id = c.neighbor_id
    where c.chapter_id = public.current_chapter_id()

    union all

    select
      'assistance'::text,
      fa.created_at,
      'Financial assistance'::text,
      trim(
        coalesce(fa.currency || ' ', '') ||
        coalesce(fa.amount::text, '0') ||
        coalesce(' — ' || nullif(fa.category, ''), '')
      ),
      n.full_name,
      fa.id,
      n.id
    from public.financial_assistance fa
    inner join public.neighbors n on n.id = fa.neighbor_id
    where fa.chapter_id = public.current_chapter_id()
  ) x
  order by x.occurred_at desc
  limit greatest(1, least(p_limit, 100));
$$;

grant execute on function public.dashboard_recent_activity(int) to authenticated;
