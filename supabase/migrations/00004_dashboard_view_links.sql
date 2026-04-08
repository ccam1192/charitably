-- Extend dashboard RPCs with ids for deep links (run after 00003)
-- PG requires DROP when OUT parameters change (cannot replace return type).

drop function if exists public.dashboard_recent_assistance(integer);
drop function if exists public.dashboard_recent_activity(integer);

create or replace function public.dashboard_recent_assistance(p_limit int default 10)
returns table (
  id uuid,
  assistance_date date,
  amount numeric,
  currency text,
  purpose text,
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
    fa.purpose,
    n.full_name as neighbor_name,
    n.id as neighbor_id
  from public.financial_assistance fa
  inner join public.neighbors n on n.id = fa.neighbor_id
  where fa.chapter_id = public.current_chapter_id()
  order by fa.assistance_date desc, fa.created_at desc
  limit greatest(1, least(p_limit, 100));
$$;

grant execute on function public.dashboard_recent_assistance(int) to authenticated;

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
        coalesce(' — ' || nullif(fa.purpose, ''), '')
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
