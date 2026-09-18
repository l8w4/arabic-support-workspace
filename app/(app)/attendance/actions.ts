"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// One submit for the whole class/date, not per-student auto-save.
// Re-submitting the same class+date updates existing rows (the unique
// constraint on class_id/student_id/attend_date makes this an upsert).
export async function saveAttendance(classId: string, attendDate: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rows: {
    class_id: string;
    student_id: string;
    attend_date: string;
    status: string;
    note: string | null;
    marked_by: string | undefined;
  }[] = [];

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("status_")) continue;
    const studentId = key.slice("status_".length);
    const note = (formData.get(`note_${studentId}`) as string)?.trim() || null;
    rows.push({
      class_id: classId,
      student_id: studentId,
      attend_date: attendDate,
      status: value as string,
      note,
      marked_by: user?.id,
    });
  }

  if (rows.length === 0) return;

  await supabase.from("attendance").upsert(rows, { onConflict: "class_id,student_id,attend_date" });

  revalidatePath("/attendance");
}
