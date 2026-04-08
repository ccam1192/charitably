-- Allow chapter admins to update other members in the same chapter (name, email, role).

create policy "users_update_chapter_admin"
  on public.users for update
  using (
    chapter_id = public.current_chapter_id()
    and exists (
      select 1
      from public.users admin_u
      where admin_u.id = auth.uid()
        and admin_u.role = 'admin'
        and admin_u.chapter_id = users.chapter_id
    )
  )
  with check (chapter_id = public.current_chapter_id());
