"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

// One submit records the same assessment for every student with a mark entered;
// students with the mark left empty are skipped.
export async function saveMarksForClass(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const title = (formData.get("title") as string)?.trim();
  const assessedDate = (formData.get("assessed_date") as string) || undefined;
  const maxScore = Number(formData.get("max_score") || 100);

  const rows: {
    student_id: string;
    title: string;
    assessed_date: string | undefined;
    score: number;
    max_score: number;
    note: string | null;
    created_by: string | undefined;
  }[] = [];

  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("score_") || value === "") continue;
    const studentId = key.slice("score_".length);
    const score = Number(value);
    if (Number.isNaN(score)) continue;
    rows.push({
      student_id: studentId,
      title,
      assessed_date: assessedDate,
      score,
      max_score: maxScore,
      note: (formData.get(`note_${studentId}`) as string)?.trim() || null,
      created_by: user?.id,
    });
  }

  if (!title || rows.length === 0) return { success: false, error: undefined };

  const { error } = await supabase.from("grade_entries").insert(rows);
  revalidatePath("/marks");
  return { success: !error, error: error?.message };
}

export async function deleteMarkFromList(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("grade_entries").delete().eq("id", id);
  revalidatePath("/marks");
  return { success: !error };
}
