"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function updateDocument(id: string, formData: FormData) {
  const supabase = await createClient();
  const title = (formData.get("title") as string)?.trim();
  const docType = formData.get("doc_type") as string;
  if (!title || !docType) return { success: false, error: undefined };

  const { data, error } = await supabase
    .from("documents")
    .update({
      title,
      doc_type: docType,
      student_id: (formData.get("student_id") as string) || null,
      notes: (formData.get("notes") as string)?.trim() || null,
    })
    .eq("id", id)
    .select("id");

  revalidatePath("/files");
  revalidatePath("/students/[id]", "page");
  const changed = (data?.length ?? 0) > 0;
  return { success: !error && changed, error: error?.message ?? (changed ? undefined : "No rows were changed.") };
}

// A document linked to a homework entry is kept (its document_id is set
// null by ON DELETE SET NULL) — only the file and this row are removed.
export async function deleteDocument(id: string, filePath: string) {
  const supabase = await createClient();
  await supabase.storage.from("documents").remove([filePath]);
  const { data, error } = await supabase.from("documents").delete().eq("id", id).select("id");
  revalidatePath("/files");
  revalidatePath("/students/[id]", "page");
  return { success: !error && (data?.length ?? 0) > 0, error: error?.message };
}
