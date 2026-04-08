-- Neighbor finances: income/expense lines with monthly-normalized amounts (one-time excluded from monthly summary).

create table public.neighbor_finances (
  id uuid primary key default gen_random_uuid(),
  chapter_id uuid not null references public.chapters (id) on delete cascade,
  neighbor_id uuid not null references public.neighbors (id) on delete restrict,
  type text not null
    check (type in ('income', 'expense')),
  category text not null,
  amount numeric(14, 2) not null check (amount >= 0),
  frequency text not null
    check (frequency in ('weekly', 'biweekly', 'monthly', 'one-time')),
  source text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index neighbor_finances_chapter_id_idx on public.neighbor_finances (chapter_id);
create index neighbor_finances_neighbor_id_idx on public.neighbor_finances (neighbor_id);

create trigger neighbor_finances_set_updated_at
  before update on public.neighbor_finances
  for each row execute function public.set_updated_at();

create trigger neighbor_finances_enforce_chapter
  before insert or update on public.neighbor_finances
  for each row execute function public.enforce_financial_assistance_chapter();

alter table public.neighbor_finances enable row level security;

create policy "neighbor_finances_all_in_chapter"
  on public.neighbor_finances for all
  using (chapter_id = public.current_chapter_id())
  with check (chapter_id = public.current_chapter_id());

comment on table public.neighbor_finances is 'Per-neighbor income/expense; amount is monthly equivalent; one-time rows excluded from monthly summary aggregates.';
comment on column public.neighbor_finances.amount is 'Monthly equivalent (normalized from frequency at save time).';

-- Monthly summary: sums recurring rows only (excludes frequency = one-time). Respects RLS via SECURITY INVOKER.
create or replace function public.neighbor_finance_monthly_summary(p_neighbor_id uuid)
returns table (
  total_monthly_income numeric,
  total_monthly_expenses numeric,
  net_monthly_balance numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    coalesce(
      sum(amount) filter (where type = 'income' and frequency <> 'one-time'),
      0
    )::numeric(14, 2) as total_monthly_income,
    coalesce(
      sum(amount) filter (where type = 'expense' and frequency <> 'one-time'),
      0
    )::numeric(14, 2) as total_monthly_expenses,
    (
      coalesce(sum(amount) filter (where type = 'income' and frequency <> 'one-time'), 0)
      - coalesce(sum(amount) filter (where type = 'expense' and frequency <> 'one-time'), 0)
    )::numeric(14, 2) as net_monthly_balance
  from public.neighbor_finances
  where neighbor_id = p_neighbor_id;
$$;

grant execute on function public.neighbor_finance_monthly_summary(uuid) to authenticated;
