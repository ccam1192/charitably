-- Dashboard aggregates (chapter-scoped via current_chapter_id + RLS)

-- -----------------------------------------------------------------------------
-- Financial totals: assistance this month, assistance all-time, donations all-time
-- "This month" uses the database session calendar month (UTC on Supabase).
-- -----------------------------------------------------------------------------
create or replace function public.dashboard_financial_stats()
returns table (
  assistance_this_month numeric,
  assistance_all_time numeric,
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
        select sum(fa.amount)
        from public.financial_assistance fa
        where fa.chapter_id = public.current_chapter_id()
          and fa.assistance_date >= date_trunc('month', current_date::timestamp)::date
          and fa.assistance_date < (date_trunc('month', current_date::timestamp) + interval '1 month')::date
      ),
      0::numeric
    ) as assistance_this_month,
    coalesce(
      (
        select sum(fa.amount)
        from public.financial_assistance fa
        where fa.chapter_id = public.current_chapter_id()
      ),
      0::numeric
    ) as assistance_all_time,
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

-- -----------------------------------------------------------------------------
-- Recent assistance rows (for dashboard table)
-- -----------------------------------------------------------------------------
create or replace function public.dashboard_recent_assistance(p_limit int default 10)
returns table (
  id uuid,
  assistance_date date,
  amount numeric,
  currency text,
  purpose text,
  neighbor_name text
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
    n.full_name as neighbor_name
  from public.financial_assistance fa
  inner join public.neighbors n on n.id = fa.neighbor_id
  where fa.chapter_id = public.current_chapter_id()
  order by fa.assistance_date desc, fa.created_at desc
  limit greatest(1, least(p_limit, 100));
$$;

grant execute on function public.dashboard_recent_assistance(int) to authenticated;

-- -----------------------------------------------------------------------------
-- Mixed recent activity: visits, calls, assistance (newest first)
-- -----------------------------------------------------------------------------
create or replace function public.dashboard_recent_activity(p_limit int default 15)
returns table (
  activity_type text,
  occurred_at timestamptz,
  title text,
  detail text,
  neighbor_name text
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
      n.full_name as neighbor_name
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
      n.full_name
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
      n.full_name
    from public.financial_assistance fa
    inner join public.neighbors n on n.id = fa.neighbor_id
    where fa.chapter_id = public.current_chapter_id()
  ) x
  order by x.occurred_at desc
  limit greatest(1, least(p_limit, 100));
$$;

grant execute on function public.dashboard_recent_activity(int) to authenticated;

comment on function public.dashboard_financial_stats() is 'Chapter-scoped sums; uses current_chapter_id().';
comment on function public.dashboard_recent_assistance(int) is 'Latest financial assistance rows for the signed-in user chapter.';
comment on function public.dashboard_recent_activity(int) is 'Unified recent visits, calls, and assistance for the chapter.';
