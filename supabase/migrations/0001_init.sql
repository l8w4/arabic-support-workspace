-- Arabic Support Centre workspace — initial schema
-- Run this once in Supabase: Dashboard > SQL Editor > New query > paste > Run.

-- ---------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------
-- profiles — one row per person who logs in, linked to Supabase Auth
-- ---------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name_ar text not null,
  full_name_en text,
  title text,                -- free text: "مشرف", "منسق", "معلمة" — a label, not a permission
  role text not null default 'viewer' check (role in ('admin', 'teacher', 'viewer')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Helper used inside policies below: what role does the currently
-- logged-in user have? security definer lets it read profiles even
-- though the caller's own row-level policy hasn't been checked yet.
create or replace function auth_role()
returns text
language sql
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid();
$$;

create or replace function can_edit()
returns boolean
language sql
security definer
set search_path = public
as $$
  select auth_role() in ('admin', 'teacher');
$$;

-- ---------------------------------------------------------------
-- students
-- ---------------------------------------------------------------
create table students (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  name_en text,
  student_code text,
  grade text,
  diagnostic_level text,
  photo_path text,
  guardian_name text,
  guardian_phone text,
  second_contact text,
  general_notes text,
  status text not null default 'active' check (status in ('active', 'archived')),
  created_at timestamptz not null default now(),
  created_by uuid references profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references profiles(id)
);

-- ---------------------------------------------------------------
-- classes / groups she teaches
-- ---------------------------------------------------------------
create table classes (
  id uuid primary key default gen_random_uuid(),
  name_ar text not null,
  academic_year text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  created_by uuid references profiles(id)
);

create table class_students (
  class_id uuid not null references classes(id) on delete cascade,
  student_id uuid not null references students(id) on delete cascade,
  joined_on date not null default current_date,
  left_on date,
  primary key (class_id, student_id)
);

-- ---------------------------------------------------------------
-- attendance — one row per student per class per day
-- ---------------------------------------------------------------
create table attendance (
  id uuid primary key default gen_random_uuid(),
  class_id uuid not null references classes(id),
  student_id uuid not null references students(id),
  attend_date date not null,
  status text not null check (status in ('present', 'absent', 'excused', 'truant', 'late')),
  note text,
  marked_by uuid references profiles(id),
  marked_at timestamptz not null default now(),
  unique (class_id, student_id, attend_date)
);

-- ---------------------------------------------------------------
-- plans — الخطة العلاجية الفردية
-- ---------------------------------------------------------------
create table plans (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  term text,
  starts_on date,
  ends_on date,
  general_objectives text,
  coordinator_name text,
  progress_rating text check (progress_rating in ('great', 'noticeable', 'slight', 'none')),
  review_on date,
  status text not null default 'active' check (status in ('draft', 'active', 'under_review', 'completed')),
  document_path text,
  final_report text,
  created_at timestamptz not null default now(),
  created_by uuid references profiles(id),
  updated_at timestamptz not null default now(),
  updated_by uuid references profiles(id)
);

create table plan_reviews (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references plans(id) on delete cascade,
  reviewed_on date not null default current_date,
  progress_rating text not null check (progress_rating in ('great', 'noticeable', 'slight', 'none')),
  notes text,
  reviewed_by uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- preps — خطة التحضير الأسبوعية
-- ---------------------------------------------------------------
create table preps (
  id uuid primary key default gen_random_uuid(),
  class_id uuid references classes(id),
  week_start date not null,
  week_end date not null,
  unit text,
  lesson_title text,
  document_path text,
  created_at timestamptz not null default now(),
  created_by uuid references profiles(id)
);

-- ---------------------------------------------------------------
-- documents — everything else: worksheets, consent forms, reports, photos
-- ---------------------------------------------------------------
create table documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  doc_type text not null check (doc_type in ('worksheet', 'consent', 'report', 'photo', 'plan', 'prep', 'other')),
  student_id uuid references students(id),
  class_id uuid references classes(id),
  file_path text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  notes text,
  uploaded_by uuid references profiles(id),
  uploaded_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- comments — how viewers (مشرفين / منسقين) participate
-- ---------------------------------------------------------------
create table comments (
  id uuid primary key default gen_random_uuid(),
  entity_type text not null check (entity_type in ('student', 'plan', 'prep', 'document')),
  entity_id uuid not null,
  body text not null,
  author_id uuid references profiles(id),
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- activity_log — a simple trail of who did what, when
-- ---------------------------------------------------------------
create table activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id),
  action text not null,
  entity_type text,
  entity_id uuid,
  occurred_at timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- Row Level Security
-- Rule of thumb used throughout: any signed-in user can VIEW;
-- only admin/teacher can WRITE; comments are the one exception,
-- where viewers can also insert (but not edit/delete others').
-- ---------------------------------------------------------------

alter table profiles enable row level security;
alter table students enable row level security;
alter table classes enable row level security;
alter table class_students enable row level security;
alter table attendance enable row level security;
alter table plans enable row level security;
alter table plan_reviews enable row level security;
alter table preps enable row level security;
alter table documents enable row level security;
alter table comments enable row level security;
alter table activity_log enable row level security;

-- profiles: everyone signed in can see everyone's name (needed to show
-- "uploaded by Enas" etc.); nobody edits their own role from the app.
create policy "profiles_select_all" on profiles for select using (auth.uid() is not null);

-- Generic pattern for the content tables:
create policy "students_select_all" on students for select using (auth.uid() is not null);
create policy "students_write" on students for all using (can_edit()) with check (can_edit());

create policy "classes_select_all" on classes for select using (auth.uid() is not null);
create policy "classes_write" on classes for all using (can_edit()) with check (can_edit());

create policy "class_students_select_all" on class_students for select using (auth.uid() is not null);
create policy "class_students_write" on class_students for all using (can_edit()) with check (can_edit());

create policy "attendance_select_all" on attendance for select using (auth.uid() is not null);
create policy "attendance_write" on attendance for all using (can_edit()) with check (can_edit());

create policy "plans_select_all" on plans for select using (auth.uid() is not null);
create policy "plans_write" on plans for all using (can_edit()) with check (can_edit());

create policy "plan_reviews_select_all" on plan_reviews for select using (auth.uid() is not null);
create policy "plan_reviews_write" on plan_reviews for all using (can_edit()) with check (can_edit());

create policy "preps_select_all" on preps for select using (auth.uid() is not null);
create policy "preps_write" on preps for all using (can_edit()) with check (can_edit());

create policy "documents_select_all" on documents for select using (auth.uid() is not null);
create policy "documents_write" on documents for all using (can_edit()) with check (can_edit());

create policy "activity_log_select_all" on activity_log for select using (auth.uid() is not null);
create policy "activity_log_insert_all" on activity_log for insert with check (auth.uid() is not null);

-- comments: everyone signed in (including viewers) can read and add;
-- only the author or an admin can edit/delete a given comment.
create policy "comments_select_all" on comments for select using (auth.uid() is not null);
create policy "comments_insert_all" on comments for insert with check (auth.uid() is not null);
create policy "comments_update_own" on comments for update
  using (author_id = auth.uid() or auth_role() = 'admin');
create policy "comments_delete_own" on comments for delete
  using (author_id = auth.uid() or auth_role() = 'admin');

-- ---------------------------------------------------------------
-- Private file storage for documents/photos
-- ---------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;

create policy "documents_bucket_select" on storage.objects for select
  using (bucket_id = 'documents' and auth.uid() is not null);
create policy "documents_bucket_write" on storage.objects for insert
  with check (bucket_id = 'documents' and can_edit());
create policy "documents_bucket_update" on storage.objects for update
  using (bucket_id = 'documents' and can_edit());
create policy "documents_bucket_delete" on storage.objects for delete
  using (bucket_id = 'documents' and can_edit());
