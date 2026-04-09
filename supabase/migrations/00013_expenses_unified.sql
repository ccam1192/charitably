-- Unified expenses table (replaces financial_assistance). Admin sees all; volunteers see neighbor-linked rows only.

-- -----------------------------------------------------------------------------
-- 0. neighbor_finances: use a trigger that does not reference financial_assistance-only columns
-- -----------------------------------------------------------------------------
create or replace function public.enforce_neighbor_finance_chapter()
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
  for each row execute function public.enforce_neighbor_finance_chapter();

-- -----------------------------------------------------------------------------
-- 1. Helpers for RLS
-- -----------------------------------------------------------------------------
create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users u
    where u.id = auth.uid() and u.role = 'admin'
  );
$$;

grant execute on function public.current_user_is_admin() to authenticated;

-- -----------------------------------------------------------------------------
-- 2. expenses table
-- -----------------------------------------------------------------------------
create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters (id) on delete cascade,
  neighbor_id uuid references public.neighbors (id) on delete restrict,
  category text not null,
  amount numeric(14, 2) not null check (amount >= 0),
  expense_date date not null default (current_date),
  currency text not null default 'USD',
  check_number text,
  notes text,
  recorded_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint expenses_category_by_neighbor check (
    (
      neighbor_id is null
      and category in (
        'bank fees',
        'office supplies',
        'postage',
        'printing',
        'technology/software',
        'event expenses',
        'training',
        'travel',
        'miscellaneous'
      )
    )
    or (
      neighbor_id is not null
      and category in (
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
    )
  )
);

comment on table public.expenses is 'Conference expenses: neighbor-linked (assistance) or conference-only (neighbor_id null).';
comment on column public.expenses.expense_date is 'When the expense occurred (legacy: financial_assistance.assistance_date).';
comment on column public.expenses.check_number is 'Check # / Invoice #';

create index expenses_chapter_id_idx on public.expenses (chapter_id);
create index expenses_neighbor_id_idx on public.expenses (neighbor_id) where neighbor_id is not null;
create index expenses_expense_date_idx on public.expenses (chapter_id, expense_date desc);
create index expenses_recorded_by_idx on public.expenses (recorded_by) where recorded_by is not null;

create trigger expenses_set_updated_at
  before update on public.expenses
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- 3. Chapter integrity + recorded_by user chapter
-- -----------------------------------------------------------------------------
create or replace function public.enforce_expenses_chapter()
returns trigger
language plpgsql
as $$
declare
  n_chapter uuid;
  u_chapter uuid;
begin
  if new.neighbor_id is not null then
    select chapter_id into n_chapter from public.neighbors where id = new.neighbor_id;
    if n_chapter is null then
      raise exception 'neighbor_id is invalid';
    end if;
    if new.chapter_id is distinct from n_chapter then
      raise exception 'chapter_id must match neighbor chapter_id';
    end if;
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

drop trigger if exists expenses_enforce_chapter on public.expenses;
create trigger expenses_enforce_chapter
  before insert or update on public.expenses
  for each row execute function public.enforce_expenses_chapter();

create or replace function public.expenses_set_recorded_by()
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

drop trigger if exists a_expenses_set_recorded_by on public.expenses;
create trigger a_expenses_set_recorded_by
  before insert or update on public.expenses
  for each row execute function public.expenses_set_recorded_by();

-- -----------------------------------------------------------------------------
-- 4. Migrate financial_assistance → expenses (preserve ids)
-- -----------------------------------------------------------------------------
insert into public.expenses (
  id,
  chapter_id,
  neighbor_id,
  category,
  amount,
  expense_date,
  currency,
  check_number,
  notes,
  recorded_by,
  created_at,
  updated_at
)
select
  fa.id,
  fa.chapter_id,
  fa.neighbor_id,
  fa.category,
  fa.amount,
  fa.assistance_date,
  fa.currency,
  fa.check_number,
  fa.notes,
  fa.recorded_by,
  fa.created_at,
  fa.updated_at
from public.financial_assistance fa;

-- -----------------------------------------------------------------------------
-- 5. Drop financial_assistance
-- -----------------------------------------------------------------------------
drop trigger if exists a_financial_assistance_set_recorded_by on public.financial_assistance;
drop trigger if exists financial_assistance_enforce_chapter on public.financial_assistance;
drop trigger if exists financial_assistance_set_updated_at on public.financial_assistance;

drop policy if exists "financial_assistance_select_in_chapter" on public.financial_assistance;
drop policy if exists "financial_assistance_insert_in_chapter" on public.financial_assistance;
drop policy if exists "financial_assistance_update_in_chapter" on public.financial_assistance;
drop policy if exists "financial_assistance_delete_in_chapter" on public.financial_assistance;
drop policy if exists "financial_assistance_all_in_chapter" on public.financial_assistance;

drop table if exists public.financial_assistance;

drop function if exists public.financial_assistance_set_recorded_by();
drop function if exists public.enforce_financial_assistance_chapter();

-- -----------------------------------------------------------------------------
-- 6. RLS on expenses
-- -----------------------------------------------------------------------------
alter table public.expenses enable row level security;

create policy "expenses_select_admin"
  on public.expenses for select
  using (
    chapter_id = public.current_chapter_id()
    and public.current_user_is_admin()
  );

create policy "expenses_select_volunteer"
  on public.expenses for select
  using (
    chapter_id = public.current_chapter_id()
    and not public.current_user_is_admin()
    and neighbor_id is not null
  );

create policy "expenses_insert_admin"
  on public.expenses for insert
  with check (
    chapter_id = public.current_chapter_id()
    and public.current_user_is_admin()
    and recorded_by = auth.uid()
  );

create policy "expenses_insert_volunteer"
  on public.expenses for insert
  with check (
    chapter_id = public.current_chapter_id()
    and not public.current_user_is_admin()
    and neighbor_id is not null
    and recorded_by = auth.uid()
  );

create policy "expenses_update_admin"
  on public.expenses for update
  using (chapter_id = public.current_chapter_id() and public.current_user_is_admin())
  with check (chapter_id = public.current_chapter_id() and public.current_user_is_admin());

create policy "expenses_update_volunteer"
  on public.expenses for update
  using (
    chapter_id = public.current_chapter_id()
    and not public.current_user_is_admin()
    and neighbor_id is not null
  )
  with check (
    chapter_id = public.current_chapter_id()
    and not public.current_user_is_admin()
    and neighbor_id is not null
  );

create policy "expenses_delete_admin"
  on public.expenses for delete
  using (chapter_id = public.current_chapter_id() and public.current_user_is_admin());

create policy "expenses_delete_volunteer"
  on public.expenses for delete
  using (
    chapter_id = public.current_chapter_id()
    and not public.current_user_is_admin()
    and neighbor_id is not null
  );

-- -----------------------------------------------------------------------------
-- 7. RPC: neighbor assistance sum
-- -----------------------------------------------------------------------------
drop function if exists public.sum_financial_assistance_for_neighbor(uuid);

create or replace function public.sum_expenses_for_neighbor(p_neighbor_id uuid)
returns numeric(14, 2)
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(sum(e.amount), 0)::numeric(14, 2)
  from public.expenses e
  where e.neighbor_id = p_neighbor_id;
$$;

grant execute on function public.sum_expenses_for_neighbor(uuid) to authenticated;

comment on function public.sum_expenses_for_neighbor(uuid) is
  'Sum of neighbor-linked expenses (RLS applies).';

-- -----------------------------------------------------------------------------
-- 8. Dashboard RPCs (financial_assistance → expenses)
-- -----------------------------------------------------------------------------
drop function if exists public.dashboard_financial_stats();

create or replace function public.dashboard_financial_stats()
returns table (
  expenses_this_month numeric,
  expenses_all_time numeric,
  donations_all_time numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    coalesce(
      (
        select sum(e.amount)
        from public.expenses e
        where e.chapter_id = public.current_chapter_id()
          and e.expense_date >= date_trunc('month', current_date::timestamp)::date
          and e.expense_date < (date_trunc('month', current_date::timestamp) + interval '1 month')::date
      ),
      0::numeric
    ) as expenses_this_month,
    coalesce(
      (
        select sum(e.amount)
        from public.expenses e
        where e.chapter_id = public.current_chapter_id()
      ),
      0::numeric
    ) as expenses_all_time,
    coalesce(
      (
        select sum(d.amount)
        from public.donations d
        where d.chapter_id = public.current_chapter_id()
      ),
      0::numeric
    ) as donations_all_time;
$$;

grant execute on function public.dashboard_financial_stats() to authenticated;

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
    e.id,
    e.expense_date as assistance_date,
    e.amount,
    e.currency,
    e.category,
    n.full_name as neighbor_name,
    n.id as neighbor_id
  from public.expenses e
  inner join public.neighbors n on n.id = e.neighbor_id
  where e.chapter_id = public.current_chapter_id()
  order by e.expense_date desc, e.created_at desc
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
      case when e.neighbor_id is null then 'expense'::text else 'assistance'::text end,
      e.created_at,
      case when e.neighbor_id is null then 'Expense'::text else 'Financial assistance'::text end,
      trim(
        coalesce(e.currency || ' ', '') ||
        coalesce(e.amount::text, '0') ||
        coalesce(' — ' || nullif(e.category, ''), '')
      ),
      coalesce(n.full_name, 'Conference'),
      e.id,
      e.neighbor_id
    from public.expenses e
    left join public.neighbors n on n.id = e.neighbor_id
    where e.chapter_id = public.current_chapter_id()
  ) x
  order by x.occurred_at desc
  limit greatest(1, least(p_limit, 100));
$$;

grant execute on function public.dashboard_recent_activity(int) to authenticated;

comment on function public.dashboard_financial_stats() is 'Chapter-scoped sums; uses current_chapter_id() and RLS.';
comment on function public.dashboard_recent_assistance(int) is 'Latest neighbor-linked expenses for the chapter.';
comment on function public.dashboard_recent_activity(int) is 'Unified recent visits, calls, and expenses.';

-- -----------------------------------------------------------------------------
-- 9. Conference finances dashboard metrics (admin UI; RLS still applies)
-- -----------------------------------------------------------------------------
create or replace function public.dashboard_conference_finance_metrics()
returns table (
  donations_month numeric,
  donations_year numeric,
  donations_all_time numeric,
  expenses_month numeric,
  expenses_year numeric,
  expenses_all_time numeric,
  assistance_expenses_month numeric,
  assistance_expenses_year numeric,
  assistance_expenses_all_time numeric,
  conference_expenses_month numeric,
  conference_expenses_year numeric,
  conference_expenses_all_time numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  with bounds as (
    select
      date_trunc('month', current_date::timestamp)::date as month_start,
      (date_trunc('month', current_date::timestamp) + interval '1 month')::date as month_end,
      date_trunc('year', current_date::timestamp)::date as year_start,
      (date_trunc('year', current_date::timestamp) + interval '1 year')::date as year_end
  )
  select
    coalesce((select sum(d.amount) from public.donations d, bounds b where d.chapter_id = public.current_chapter_id() and d.donation_date >= b.month_start and d.donation_date < b.month_end), 0::numeric),
    coalesce((select sum(d.amount) from public.donations d, bounds b where d.chapter_id = public.current_chapter_id() and d.donation_date >= b.year_start and d.donation_date < b.year_end), 0::numeric),
    coalesce((select sum(d.amount) from public.donations d where d.chapter_id = public.current_chapter_id()), 0::numeric),
    coalesce((select sum(e.amount) from public.expenses e, bounds b where e.chapter_id = public.current_chapter_id() and e.expense_date >= b.month_start and e.expense_date < b.month_end), 0::numeric),
    coalesce((select sum(e.amount) from public.expenses e, bounds b where e.chapter_id = public.current_chapter_id() and e.expense_date >= b.year_start and e.expense_date < b.year_end), 0::numeric),
    coalesce((select sum(e.amount) from public.expenses e where e.chapter_id = public.current_chapter_id()), 0::numeric),
    coalesce((select sum(e.amount) from public.expenses e, bounds b where e.chapter_id = public.current_chapter_id() and e.neighbor_id is not null and e.expense_date >= b.month_start and e.expense_date < b.month_end), 0::numeric),
    coalesce((select sum(e.amount) from public.expenses e, bounds b where e.chapter_id = public.current_chapter_id() and e.neighbor_id is not null and e.expense_date >= b.year_start and e.expense_date < b.year_end), 0::numeric),
    coalesce((select sum(e.amount) from public.expenses e where e.chapter_id = public.current_chapter_id() and e.neighbor_id is not null), 0::numeric),
    coalesce((select sum(e.amount) from public.expenses e, bounds b where e.chapter_id = public.current_chapter_id() and e.neighbor_id is null and e.expense_date >= b.month_start and e.expense_date < b.month_end), 0::numeric),
    coalesce((select sum(e.amount) from public.expenses e, bounds b where e.chapter_id = public.current_chapter_id() and e.neighbor_id is null and e.expense_date >= b.year_start and e.expense_date < b.year_end), 0::numeric),
    coalesce((select sum(e.amount) from public.expenses e where e.chapter_id = public.current_chapter_id() and e.neighbor_id is null), 0::numeric);
$$;

grant execute on function public.dashboard_conference_finance_metrics() to authenticated;

comment on function public.dashboard_conference_finance_metrics() is 'Donation/expense splits for conference finances dashboard (RLS applies).';
