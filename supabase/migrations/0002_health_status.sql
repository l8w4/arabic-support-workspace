-- Health status for students (sensitive medical information about a child).
-- Optional free text, same RLS as the rest of the students table
-- (any signed-in user can view; admin/teacher can edit).
alter table students add column if not exists health_status text;
