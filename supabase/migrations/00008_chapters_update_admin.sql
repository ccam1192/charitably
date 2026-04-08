-- Let conference admins update their chapter row (e.g. name in sidebar). RLS was select-only.

create policy "chapters_update_admin"
  on public.chapters for update
  using (
    id = (select u.chapter_id from public.users u where u.id = auth.uid())
    and exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.role = 'admin'
    )
  )
  with check (
    id = (select u.chapter_id from public.users u where u.id = auth.uid())
    and exists (
      select 1 from public.users u
      where u.id = auth.uid()
        and u.role = 'admin'
    )
  );
