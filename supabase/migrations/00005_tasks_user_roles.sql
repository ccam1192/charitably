-- Align users.role with admin / volunteer; tasks with visit, call, follow_up; status pending / completed.

-- -----------------------------------------------------------------------------
-- users.role
-- -----------------------------------------------------------------------------
alter table public.users drop constraint if exists users_role_check;

update public.users
set role = 'admin'
where role in ('coordinator', 'president');

update public.users
set role = 'volunteer'
where role not in ('admin', 'volunteer');

alter table public.users
  add constraint users_role_check check (role in ('admin', 'volunteer'));

alter table public.users alter column role set default 'volunteer';

-- -----------------------------------------------------------------------------
-- tasks.task_type (visit, call, follow_up only)
-- -----------------------------------------------------------------------------
alter table public.tasks drop constraint if exists tasks_task_type_check;

update public.tasks
set task_type = 'follow_up'
where task_type = 'other';

alter table public.tasks
  add constraint tasks_task_type_check check (task_type in ('visit', 'call', 'follow_up'));

alter table public.tasks alter column task_type set default 'visit';

-- -----------------------------------------------------------------------------
-- tasks.status (pending, completed)
-- -----------------------------------------------------------------------------
alter table public.tasks drop constraint if exists tasks_status_check;

update public.tasks
set status = 'pending'
where status in ('open', 'in_progress');

update public.tasks
set status = 'completed'
where status in ('completed', 'cancelled');

alter table public.tasks
  add constraint tasks_status_check check (status in ('pending', 'completed'));

alter table public.tasks alter column status set default 'pending';
