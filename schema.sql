-- EduMaster NG initial multi-tenant schema.
-- Apply in a new Supabase project only after reviewing the policies for your deployment.
create extension if not exists pgcrypto;

create type public.member_role as enum ('owner','school_admin','teacher');
create type public.document_kind as enum ('lesson','exam','marking','resource');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  created_at timestamptz not null default now()
);

create table public.schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  state text,
  lga text,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table public.school_members (
  school_id uuid not null references public.schools(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.member_role not null default 'teacher',
  created_at timestamptz not null default now(),
  primary key (school_id,user_id)
);

create table public.academic_sessions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  starts_on date,
  ends_on date,
  active boolean not null default false
);

create table public.classes (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  name text not null,
  level_group text not null check(level_group in ('early_years','primary','junior_secondary','senior_secondary')),
  created_at timestamptz not null default now()
);

create table public.students (
  id uuid primary key default gen_random_uuid(),
  school_id uuid not null references public.schools(id) on delete cascade,
  class_id uuid references public.classes(id) on delete set null,
  admission_number text,
  full_name text not null,
  created_at timestamptz not null default now()
);

create table public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  level_group text[] not null default '{}'
);

create table public.curriculum_sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  issuing_body text,
  source_url text,
  version_label text,
  published_at date,
  licence_notes text,
  verified_at timestamptz
);

create table public.curriculum_topics (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references public.curriculum_sources(id) on delete set null,
  subject_id uuid references public.subjects(id) on delete set null,
  class_level text not null,
  term_label text,
  topic text not null,
  subtopic text,
  teacher_notes text
);

create table public.teaching_documents (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  kind public.document_kind not null,
  title text not null,
  subject text,
  class_level text,
  term_label text,
  topic text,
  content_markdown text not null,
  curriculum_source_id uuid references public.curriculum_sources(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  plan_code text not null,
  status text not null default 'inactive',
  starts_at timestamptz,
  ends_at timestamptz,
  provider_reference text,
  created_at timestamptz not null default now(),
  check ((school_id is not null) or (user_id is not null))
);

create table public.payments (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid references public.subscriptions(id) on delete set null,
  user_id uuid not null references auth.users(id),
  provider text not null,
  provider_reference text not null unique,
  amount_kobo bigint not null check(amount_kobo >= 0),
  currency text not null default 'NGN',
  status text not null default 'pending',
  verified_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.usage_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action text not null,
  model text,
  tokens_input integer,
  tokens_output integer,
  created_at timestamptz not null default now()
);

create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references public.schools(id) on delete cascade,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  created_at timestamptz not null default now()
);

-- RLS is enabled by default for all user-facing tables.
alter table public.profiles enable row level security;
alter table public.schools enable row level security;
alter table public.school_members enable row level security;
alter table public.academic_sessions enable row level security;
alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.subjects enable row level security;
alter table public.curriculum_sources enable row level security;
alter table public.curriculum_topics enable row level security;
alter table public.teaching_documents enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.usage_logs enable row level security;
alter table public.audit_logs enable row level security;

create or replace function public.is_school_member(target_school uuid)
returns boolean language sql security definer set search_path=public stable as $$
  select exists(select 1 from public.school_members sm where sm.school_id=target_school and sm.user_id=auth.uid());
$$;

create policy "profile owner reads own profile" on public.profiles for select using (id=auth.uid());
create policy "profile owner updates own profile" on public.profiles for update using (id=auth.uid()) with check (id=auth.uid());
create policy "school members read school" on public.schools for select using (public.is_school_member(id) or created_by=auth.uid());
create policy "authenticated users create school" on public.schools for insert to authenticated with check (created_by=auth.uid());
create policy "members read membership" on public.school_members for select using (user_id=auth.uid() or public.is_school_member(school_id));
create policy "members read classes" on public.classes for select using (public.is_school_member(school_id));
create policy "school admins manage classes" on public.classes for all using (
  exists(select 1 from public.school_members sm where sm.school_id=classes.school_id and sm.user_id=auth.uid() and sm.role in ('owner','school_admin'))
) with check (public.is_school_member(school_id));
create policy "members read students" on public.students for select using (public.is_school_member(school_id));
create policy "school admins manage students" on public.students for all using (
  exists(select 1 from public.school_members sm where sm.school_id=students.school_id and sm.user_id=auth.uid() and sm.role in ('owner','school_admin'))
) with check (public.is_school_member(school_id));
create policy "authenticated read subject catalogue" on public.subjects for select to authenticated using (true);
create policy "authenticated read curriculum sources" on public.curriculum_sources for select to authenticated using (true);
create policy "authenticated read curriculum topics" on public.curriculum_topics for select to authenticated using (true);
create policy "creator reads own documents" on public.teaching_documents for select using (created_by=auth.uid() or (school_id is not null and public.is_school_member(school_id)));
create policy "creator inserts documents" on public.teaching_documents for insert to authenticated with check (created_by=auth.uid() and (school_id is null or public.is_school_member(school_id)));
create policy "creator updates own documents" on public.teaching_documents for update using (created_by=auth.uid()) with check (created_by=auth.uid());
create policy "creator deletes own documents" on public.teaching_documents for delete using (created_by=auth.uid());
create policy "user reads own subscriptions" on public.subscriptions for select using (user_id=auth.uid() or (school_id is not null and public.is_school_member(school_id)));
create policy "user reads own payments" on public.payments for select using (user_id=auth.uid());
create policy "user reads own usage" on public.usage_logs for select using (user_id=auth.uid());
create policy "school members read audit log" on public.audit_logs for select using (school_id is not null and public.is_school_member(school_id));

-- NOTE: membership creation, payment writes, and privileged administrative actions
-- must be performed by trusted server-side functions after validating ownership.
