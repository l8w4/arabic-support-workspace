import { createClient } from "@/lib/supabase/server";
import AttendanceClient from "./AttendanceClient";
import type { Class, Student, AttendanceRow } from "@/lib/types";

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ class_id?: string; date?: string }>;
}) {
  const { class_id: classId, date } = await searchParams;
  const supabase = await createClient();

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name_ar, academic_year, is_active, created_at")
    .eq("is_active", true)
    .order("name_ar");

  let roster: Pick<Student, "id" | "name_ar">[] = [];
  let existing: AttendanceRow[] = [];

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

    if (date) {
      const { data: attendanceRows } = await supabase
        .from("attendance")
        .select("id, class_id, student_id, attend_date, status, note")
        .eq("class_id", classId)
        .eq("attend_date", date);
      existing = (attendanceRows as AttendanceRow[]) ?? [];
    }
  }

  return (
    <AttendanceClient
      classes={(classes as Class[]) ?? []}
      classId={classId ?? ""}
      date={date ?? ""}
      roster={roster}
      existing={existing}
    />
  );
}
