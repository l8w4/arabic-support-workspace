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

const NO_ROWS = "No rows were changed (you may not have permission to edit).";

// Supabase reports no error when row-level security filters a row out, so
// success is only claimed when at least one row was actually affected.
export async function deleteHomeworkFromList(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("homework_entries").delete().eq("id", id).select("id");
  revalidatePath("/homework");
  revalidatePath("/students/[id]", "page");
  const changed = (data?.length ?? 0) > 0;
  return { success: !error && changed, error: error?.message ?? (changed ? undefined : NO_ROWS) };
}

export async function updateHomeworkEntry(id: string, formData: FormData) {
  const supabase = await createClient();
  const title = (formData.get("title") as string)?.trim();
  const status = formData.get("status") as string;
  if (!title || !status) return { success: false, error: undefined };

  const { data, error } = await supabase
    .from("homework_entries")
    .update({
      title,
      assigned_date: (formData.get("assigned_date") as string) || undefined,
      status,
      note: (formData.get("note") as string)?.trim() || null,
    })
    .eq("id", id)
    .select("id");

  revalidatePath("/homework");
  revalidatePath("/students/[id]", "page");
  const changed = (data?.length ?? 0) > 0;
  return { success: !error && changed, error: error?.message ?? (changed ? undefined : NO_ROWS) };
}
