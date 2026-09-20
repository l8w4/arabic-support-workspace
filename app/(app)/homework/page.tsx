import { createClient } from "@/lib/supabase/server";
import HomeworkClient from "./HomeworkClient";
import type { Class, HomeworkStatus } from "@/lib/types";

export type HomeworkListRow = {
  id: string;
  student_id: string;
  title: string;
  assigned_date: string;
  status: HomeworkStatus;
  note: string | null;
  students: { name_ar: string } | null;
};

export default async function HomeworkPage({ searchParams }: { searchParams: Promise<{ class?: string }> }) {
  const { class: classParam } = await searchParams;
  const classId = classParam && classParam !== "all" ? classParam : "";
  const supabase = await createClient();

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name_ar, academic_year, is_active, created_at")
    .eq("is_active", true)
    .order("name_ar");

  let roster: { id: string; name_ar: string }[] = [];
  if (classId) {
    const { data: memberRows } = await supabase
      .from("class_students")
      .select("students(id, name_ar)")
      .eq("class_id", classId)
      .is("left_on", null);
    roster = (
      ((memberRows as unknown as { students: { id: string; name_ar: string } | null }[]) ?? [])
        .map((m) => m.students)
        .filter(Boolean) as { id: string; name_ar: string }[]
    ).sort((a, b) => a.name_ar.localeCompare(b.name_ar, "ar"));
  }

  let entries: HomeworkListRow[] = [];
  if (!classId || roster.length > 0) {
    let query = supabase
      .from("homework_entries")
      .select("id, student_id, title, assigned_date, status, note, students(name_ar)")
      .order("assigned_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(200);
    if (classId) query = query.in("student_id", roster.map((s) => s.id));
    const { data } = await query;
    entries = (data as unknown as HomeworkListRow[]) ?? [];
  }

  return <HomeworkClient classes={(classes as Class[]) ?? []} classId={classId} roster={roster} entries={entries} />;
}
