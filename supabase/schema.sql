-- AngkatanOS starter schema. Review before production use.
create extension if not exists pgcrypto;

create type public.member_role as enum ('member', 'contributor', 'admin');
create type public.task_scope as enum ('cohort', 'personal');
create type public.task_category as enum ('academic', 'organization', 'event', 'other');
create type public.task_status as enum ('todo', 'in_progress', 'done');

create table public.allowed_members (
  email text primary key,
  invited_by uuid,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default 'Mahasiswa',
  student_number text,
  avatar_url text,
  role public.member_role not null default 'member',
  theme text not null default 'cream' check (theme in ('cream','dark','sage','lavender')),
  accent_color text not null default '#d97757',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  pinned boolean not null default false,
  author_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  category public.task_category not null default 'academic',
  scope public.task_scope not null default 'cohort',
  due_at timestamptz,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.task_completions (
  task_id uuid not null references public.tasks(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  status public.task_status not null default 'todo',
  updated_at timestamptz not null default now(),
  primary key (task_id, user_id)
);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  starts_at timestamptz not null,
  location text,
  cover_url text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.albums (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_date date,
  cover_path text,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums(id) on delete cascade,
  storage_path text not null,
  caption text,
  uploaded_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now()
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_preferences (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  widgets jsonb not null default '["deadlines","announcements","events"]'::jsonb,
  compact_mode boolean not null default false,
  updated_at timestamptz not null default now()
);

-- Check that a new user email has been invited before creating their profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.allowed_members
    where lower(email) = lower(new.email)
  ) then
    raise exception 'Email belum terdaftar sebagai anggota angkatan.';
  end if;

  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)));

  insert into public.user_preferences (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

-- Prevent members from promoting themselves by updating their own profile role.
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.role is distinct from old.role and public.current_role() <> 'admin' then
    raise exception 'Only an admin can change member roles.';
  end if;
  new.updated_at = now();
  return new;
end;
$$;

create trigger protect_profile_role
before update on public.profiles
for each row execute procedure public.prevent_role_escalation();

create or replace function public.current_role()
returns public.member_role
language sql stable security definer
set search_path = ''
as $$
  select role from public.profiles where id = auth.uid()
$$;

alter table public.allowed_members enable row level security;
alter table public.profiles enable row level security;
alter table public.announcements enable row level security;
alter table public.tasks enable row level security;
alter table public.task_completions enable row level security;
alter table public.events enable row level security;
alter table public.albums enable row level security;
alter table public.photos enable row level security;
alter table public.notes enable row level security;
alter table public.user_preferences enable row level security;

-- Invite list is admin-managed; clients cannot read or modify it.
create policy "Admins manage invite list" on public.allowed_members
for all to authenticated
using (public.current_role() = 'admin')
with check (public.current_role() = 'admin');

create policy "Members read profiles" on public.profiles
for select to authenticated using (true);
create policy "Members update own profile" on public.profiles
for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

create policy "Members read announcements" on public.announcements
for select to authenticated using (true);
create policy "Contributors manage announcements" on public.announcements
for insert to authenticated with check (author_id = auth.uid() and public.current_role() in ('contributor','admin'));
create policy "Authors or admins update announcements" on public.announcements
for update to authenticated using (author_id = auth.uid() or public.current_role() = 'admin')
with check (author_id = auth.uid() or public.current_role() = 'admin');
create policy "Admins delete announcements" on public.announcements
for delete to authenticated using (public.current_role() = 'admin');

-- Public read-only access: cohort-wide deadlines and events are intentionally visible without login.
-- Keep personal tasks in scope='personal'; never store sensitive details in public cohort records.
create policy "Anyone reads cohort deadlines" on public.tasks
for select to anon using (scope = 'cohort');
create policy "Anyone reads cohort events" on public.events
for select to anon using (true);

create policy "Members read cohort tasks and own personal tasks" on public.tasks
for select to authenticated using (scope = 'cohort' or created_by = auth.uid());
create policy "Contributors create cohort tasks; members create personal tasks" on public.tasks
for insert to authenticated with check (
  created_by = auth.uid() and
  ((scope = 'personal') or (scope = 'cohort' and public.current_role() in ('contributor','admin')))
);
create policy "Authors or admins update tasks" on public.tasks
for update to authenticated using (created_by = auth.uid() or public.current_role() = 'admin')
with check (created_by = auth.uid() or public.current_role() = 'admin');
create policy "Authors or admins delete tasks" on public.tasks
for delete to authenticated using (created_by = auth.uid() or public.current_role() = 'admin');

create policy "Members read own completion status" on public.task_completions
for select to authenticated using (user_id = auth.uid());
create policy "Members manage own completion status" on public.task_completions
for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "Members read events" on public.events
for select to authenticated using (true);
create policy "Contributors create events" on public.events
for insert to authenticated with check (created_by = auth.uid() and public.current_role() in ('contributor','admin'));
create policy "Contributors update events" on public.events
for update to authenticated using (public.current_role() in ('contributor','admin'))
with check (public.current_role() in ('contributor','admin'));
create policy "Admins delete events" on public.events
for delete to authenticated using (public.current_role() = 'admin');

create policy "Members read albums" on public.albums
for select to authenticated using (true);
create policy "Contributors create albums" on public.albums
for insert to authenticated with check (created_by = auth.uid() and public.current_role() in ('contributor','admin'));
create policy "Contributors update albums" on public.albums
for update to authenticated using (public.current_role() in ('contributor','admin'))
with check (public.current_role() in ('contributor','admin'));
create policy "Admins delete albums" on public.albums
for delete to authenticated using (public.current_role() = 'admin');

create policy "Members read photos" on public.photos
for select to authenticated using (true);
create policy "Members upload photos" on public.photos
for insert to authenticated with check (uploaded_by = auth.uid());
create policy "Uploader or admin delete photos" on public.photos
for delete to authenticated using (uploaded_by = auth.uid() or public.current_role() = 'admin');

create policy "Members manage own notes" on public.notes
for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "Members manage own preferences" on public.user_preferences
for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

-- IMPORTANT: Create a PRIVATE storage bucket named "angkatan-gallery" in Supabase Storage.
-- Storage policies for private gallery files should be added and tested before enabling uploads.
