-- Neighbors list: aggregate neighbor-linked expense totals in SQL (replaces JS over full expenses scan).

create or replace view public.neighbors_with_assistance_totals
with (security_invoker = true)
as
select
  n.*,
  coalesce(s.assistance_total, 0)::numeric(14, 2) as assistance_total
from public.neighbors n
left join (
  select e.neighbor_id, sum(e.amount) as assistance_total
  from public.expenses e
  where e.neighbor_id is not null
  group by e.neighbor_id
) s on s.neighbor_id = n.id;

comment on view public.neighbors_with_assistance_totals is
  'Chapter-scoped neighbors (RLS on neighbors) with sum of neighbor-linked expenses (RLS on expenses).';

grant select on public.neighbors_with_assistance_totals to authenticated;
