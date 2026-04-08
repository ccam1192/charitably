# Charitably

Production-oriented foundation for **St. Vincent de Paul** conference operations: multi-tenant by conference (database: `chapter_id` / `chapters` table), Supabase Auth + Postgres RLS, Next.js App Router.

## Stack

- Next.js (App Router), TypeScript, Tailwind CSS v4
- Supabase (Auth, Postgres; Storage ready when you add buckets)

## Project layout

```
app/
  (app)/                 # Authenticated shell (sidebar + dashboard)
    dashboard/
    neighbors/           # CRUD + detail tabs (visits, calls, assistance)
    visits/
    calls/
    assistance/
    donations/
    tasks/
  (auth)/                # Login / signup (centered layout)
    login/
    signup/
  auth/sign-out/         # POST → sign out
  onboarding/            # Finish profile if no conference row (e.g. OAuth)
  layout.tsx
  globals.css
  page.tsx               # → /login or /dashboard
components/
  app-shell.tsx
  app-sidebar.tsx
  login-form.tsx
  signup-form.tsx
  onboarding-form.tsx
lib/supabase/
  client.ts              # Browser client
  server.ts              # Server Components / Route Handlers
  middleware.ts          # Session refresh
supabase/migrations/
  00001_initial_schema.sql
  00002_neighbors_city.sql   # adds neighbors.city (list column)
  00003_dashboard_rpcs.sql     # dashboard SQL aggregates (RPCs)
  00004_dashboard_view_links.sql # RPC columns for dashboard “View” links
middleware.ts
```

**Prisma:** not included. The Supabase client + SQL migrations keep the stack small; add Prisma later only if you want a unified ORM outside Supabase tooling.

## Setup

### 1. Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In **SQL Editor**, run migrations in order: `00001_initial_schema.sql`, `00002_neighbors_city.sql` (optional `city` column), `00003_dashboard_rpcs.sql`, and `00004_dashboard_view_links.sql` (dashboard deep links).
3. **Authentication → Providers:** enable Email (and others if needed).
4. Copy **Project URL** and **anon public** key from **Project Settings → API**.

### 2. Seed a conference (SQL)

Replace names as needed:

```sql
insert into public.chapters (name, parish_name, city, state)
values ('Downtown Conference', 'St. Mary Parish', 'Austin', 'TX')
returning id;
```

Copy the returned `id` and share it with volunteers as the **Conference ID** (signup and onboarding forms). The column remains `chapter_id` in the database for compatibility with existing migrations.

### 3. Local app

```bash
cp .env.example .env.local
# fill NEXT_PUBLIC_SUPABASE_URL and publishable key (or legacy anon key) — see `.env.example`

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 4. First user

- **Sign up** at `/signup` with email, password, and the conference UUID, **or**
- Create the user in **Authentication → Users** and set **User Metadata** JSON: `{ "chapter_id": "<uuid>", "full_name": "Name" }` so the trigger creates `public.users`, **or**
- Sign in with OAuth and complete **Conference ID** on `/onboarding`.

### Security note

Anyone who can **sign up** and knows a conference UUID can attach to that conference. For production, prefer **disabled public signups** and **invite-only** (Supabase Admin API or magic links with `chapter_id` set server-side).

## Multi-tenancy

- Every domain table has `chapter_id` (SVdP “conference” in the UI).
- `users.chapter_id` ties each member to one conference (`users.id` = `auth.users.id`).
- `current_chapter_id()` (SQL) drives RLS policies so authenticated users only see rows for their conference.

## Next steps

- Replace placeholder pages with tables and forms.
- Add Supabase Storage buckets (e.g. visit photos) with RLS on `storage.objects`.
- Generate TypeScript types: `npx supabase gen types typescript --project-id <ref> > lib/database.types.ts`.
