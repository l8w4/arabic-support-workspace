-- Marks per student: one row per test/assessment, stored as score out of a
-- maximum (default 100) so different assessments can be on different scales.
create table grade_entries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  title text not null,
  assessed_date date not null default current_date,
  score numeric(7,2) not null check (score >= 0),
  max_score numeric(7,2) not null default 100 check (max_score > 0),
  note text,
  created_at timestamptz not null default now(),
  created_by uuid references profiles(id),
  check (score <= max_score)
);

create index grade_entries_student_idx on grade_entries (student_id, assessed_date desc);

alter table grade_entries enable row level security;

create policy "grade_entries_select_all" on grade_entries for select using (auth.uid() is not null);
create policy "grade_entries_write" on grade_entries for all using (can_edit()) with check (can_edit());
