-- Homework record per student, with a four-point qualitative status
-- instead of a numeric grade (these are students with disabilities in a
-- support context). An entry can link to an uploaded file through the
-- existing documents table (the worksheet, or a photo of the finished work).
create table homework_entries (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references students(id) on delete cascade,
  title text not null,
  assigned_date date not null default current_date,
  status text not null check (status in ('completed', 'partial', 'needs_support', 'not_done')),
  note text,
  document_id uuid references documents(id) on delete set null,
  created_at timestamptz not null default now(),
  created_by uuid references profiles(id)
);

create index homework_entries_student_idx on homework_entries (student_id, assigned_date desc);

alter table homework_entries enable row level security;

create policy "homework_entries_select_all" on homework_entries for select using (auth.uid() is not null);
create policy "homework_entries_write" on homework_entries for all using (can_edit()) with check (can_edit());
