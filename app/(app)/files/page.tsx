import { createClient } from "@/lib/supabase/server";
import FilesClient from "./FilesClient";
import type { DocumentRow, Student } from "@/lib/types";

export default async function FilesPage() {
  const supabase = await createClient();

  const [{ data: docs }, { data: students }] = await Promise.all([
    supabase
      .from("documents")
      .select("id, title, doc_type, student_id, file_name, file_path, notes, uploaded_at, students(name_ar), profiles(full_name_ar)")
      .order("uploaded_at", { ascending: false }),
    supabase.from("students").select("id, name_ar").eq("status", "active").order("name_ar"),
  ]);

  const docsWithUrls = await Promise.all(
    ((docs as unknown as DocumentRow[]) ?? []).map(async (d) => {
      const { data: signed } = await supabase.storage.from("documents").createSignedUrl(d.file_path, 3600);
      return { ...d, signedUrl: signed?.signedUrl ?? null };
    })
  );

  return <FilesClient documents={docsWithUrls} students={(students as Pick<Student, "id" | "name_ar">[]) ?? []} />;
}
