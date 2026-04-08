-- Performance: RPC for neighbor assistance totals + supporting indexes for common query patterns (RLS-aware).

-- -----------------------------------------------------------------------------
-- Single round-trip sum of financial assistance per neighbor (replaces full-row fetch + JS reduce)
-- -----------------------------------------------------------------------------
create or replace function public.sum_financial_assistance_for_neighbor(p_neighbor_id uuid)
returns numeric(14, 2)
language sql
stable
security invoker
set search_path = public
as $$
  select coalesce(sum(fa.amount), 0)::numeric(14, 2)
  from public.financial_assistance fa
  where fa.neighbor_id = p_neighbor_id;
$$;

grant execute on function public.sum_financial_assistance_for_neighbor(uuid) to authenticated;

comment on function public.sum_financial_assistance_for_neighbor(uuid) is
  'Chapter-scoped via RLS on financial_assistance; used for neighbor assistance totals.';

-- -----------------------------------------------------------------------------
-- Tasks: “my pending” list (assigned_to + status + due_date ordering)
-- -----------------------------------------------------------------------------
create index if not exists tasks_assigned_status_due_idx
  on public.tasks (assigned_to, status, due_date desc nulls last)
  where assigned_to is not null and status = 'pending';

-- Conference task board: newest first within chapter
create index if not exists tasks_chapter_created_at_idx
  on public.tasks (chapter_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Neighbor finances: list by neighbor, newest first (matches app ordering)
-- -----------------------------------------------------------------------------
create index if not exists neighbor_finances_neighbor_created_at_idx
  on public.neighbor_finances (neighbor_id, created_at desc);
