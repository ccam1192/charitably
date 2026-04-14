-- Public landing page "Request access" form submissions (stored server-side via service role).

create table public.access_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  email text not null,
  organization text not null,
  message text
);

comment on table public.access_requests is
  'Inbound requests from the marketing site contact form; query in Supabase Table Editor or SQL.';

create index access_requests_created_at_idx on public.access_requests (created_at desc);

alter table public.access_requests enable row level security;

-- RLS enabled with no policies: anon/authenticated cannot read or write.
-- Inserts use the service role in the Next.js API route (bypasses RLS).
