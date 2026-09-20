"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// One submit records the same assignment for every student the teacher marked;
// students left without a status are skipped.
export async function saveHomeworkForClass(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const title = (formData.get("title") as string)?.trim();
  const assignedDate = (formData.get("assigned_date") as string) || undefined;

  const rows: {
    student_id: string;
    title: string;
    assigned_date: string | undefined;
    status: string;
    note: string | null;
    created_by: string | undefined;
  }[] = [];

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("status_") || !value) continue;
    const studentId = key.slice("status_".length);
    rows.push({
      student_id: studentId,
      title,
      assigned_date: assignedDate,
      status: value as string,
      note: (formData.get(`note_${studentId}`) as string)?.trim() || null,
      created_by: user?.id,
    });
  }

  if (!title || rows.length === 0) return { success: false, error: undefined };

  const { error } = await supabase.from("homework_entries").insert(rows);
  revalidatePath("/homework");
  return { success: !error, error: error?.message };
}

export async function deleteHomeworkFromList(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("homework_entries").delete().eq("id", id);
  revalidatePath("/homework");
  return { success: !error };
}
