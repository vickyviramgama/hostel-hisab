-- ═══════════════════════════════════════════════════════════
--  HostelKhata — Supabase Schema
--  Paste this entire file into Supabase → SQL Editor → Run
-- ═══════════════════════════════════════════════════════════

-- 1. PROFILES (extends Supabase auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  name        text not null,
  phone       text,
  role        text not null default 'staff'
                check (role in ('superadmin','admin','staff')),
  color       text not null default '#7C3AED',
  initials    text,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Auto-create profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)),
    coalesce(new.raw_user_meta_data->>'role', 'staff')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. TRANSACTIONS
create table if not exists public.transactions (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('advance','expense')),
  member_id   uuid not null references public.profiles(id) on delete cascade,
  amount      numeric(10,2) not null check (amount > 0),
  note        text not null default '',
  category    text,
  status      text not null default 'pending'
                check (status in ('pending','approved')),
  date        timestamptz not null default now(),
  created_by  uuid references public.profiles(id),
  created_at  timestamptz not null default now()
);

-- 3. NOTIFICATIONS
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  type        text,
  message     text not null,
  is_read     boolean not null default false,
  user_id     uuid references public.profiles(id) on delete cascade,
  meta        jsonb,
  created_at  timestamptz not null default now()
);

-- 4. SHEETS SYNC LOG
create table if not exists public.sheets_sync_log (
  id            uuid primary key default gen_random_uuid(),
  synced_at     timestamptz not null default now(),
  rows_pushed   int,
  period_label  text,
  status        text default 'success'
);

-- ───────────────────────────────────────────────
-- ROW LEVEL SECURITY
-- ───────────────────────────────────────────────

alter table public.profiles      enable row level security;
alter table public.transactions  enable row level security;
alter table public.notifications enable row level security;
alter table public.sheets_sync_log enable row level security;

-- Helper: get current user's role
create or replace function public.my_role()
returns text language sql security definer stable as $$
  select role from public.profiles where id = auth.uid();
$$;

-- PROFILES policies
create policy "Anyone logged in can view profiles"
  on public.profiles for select
  using (auth.uid() is not null);

create policy "User can update own profile"
  on public.profiles for update
  using (id = auth.uid());

create policy "Superadmin and admin can update any profile"
  on public.profiles for update
  using (public.my_role() in ('superadmin','admin'));

create policy "Superadmin can delete profiles"
  on public.profiles for delete
  using (public.my_role() = 'superadmin');

-- TRANSACTIONS policies
create policy "Logged in users can view transactions"
  on public.transactions for select
  using (auth.uid() is not null);

create policy "Any logged in user can insert transactions"
  on public.transactions for insert
  with check (auth.uid() is not null);

create policy "Admin/superadmin can update transactions"
  on public.transactions for update
  using (public.my_role() in ('superadmin','admin'));

create policy "Admin/superadmin can delete transactions"
  on public.transactions for delete
  using (public.my_role() in ('superadmin','admin'));

-- NOTIFICATIONS policies
create policy "User can view own notifications"
  on public.notifications for select
  using (user_id = auth.uid() or user_id is null);

create policy "Anyone logged in can insert notifications"
  on public.notifications for insert
  with check (auth.uid() is not null);

create policy "User can update own notifications"
  on public.notifications for update
  using (user_id = auth.uid() or public.my_role() in ('superadmin','admin'));

-- SHEETS LOG policies
create policy "Admins can view sync log"
  on public.sheets_sync_log for select
  using (public.my_role() in ('superadmin','admin'));

create policy "Admins can insert sync log"
  on public.sheets_sync_log for insert
  with check (public.my_role() in ('superadmin','admin'));

-- ───────────────────────────────────────────────
-- REALTIME (so UI updates live across devices)
-- ───────────────────────────────────────────────
alter publication supabase_realtime add table public.transactions;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.profiles;
