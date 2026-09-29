"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updatePrep(id: string, formData: FormData) {
  const supabase = await createClient();
  const classId = formData.get("class_id") as string;
  const weekStart = formData.get("week_start") as string;
  const weekEnd = formData.get("week_end") as string;
  if (!classId || !weekStart || !weekEnd) return { success: false, error: undefined };

  const { data, error } = await supabase
    .from("preps")
    .update({
      class_id: classId,
      week_start: weekStart,
      week_end: weekEnd,
      unit: (formData.get("unit") as string)?.trim() || null,
      lesson_title: (formData.get("lesson_title") as string)?.trim() || null,
    })
    .eq("id", id)
    .select("id");

  revalidatePath("/prep");
  const changed = (data?.length ?? 0) > 0;
  return { success: !error && changed, error: error?.message ?? (changed ? undefined : "No rows were changed.") };
}

// Prep documents aren't shared with any other table, so the storage object
// is removed too (best-effort — a failed storage removal doesn't block the
// row delete, since an orphaned file is harmless besides using some quota).
export async function deletePrep(id: string, documentPath: string | null) {
  const supabase = await createClient();
  if (documentPath) {
    await supabase.storage.from("documents").remove([documentPath]);
  }
  const { data, error } = await supabase.from("preps").delete().eq("id", id).select("id");
  revalidatePath("/prep");
  return { success: !error && (data?.length ?? 0) > 0, error: error?.message };
}
