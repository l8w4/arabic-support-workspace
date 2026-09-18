import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentProfileClient from "./StudentProfileClient";
import type { Student, DocumentRow } from "@/lib/types";

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: student }, { data: docs }] = await Promise.all([
    supabase.from("students").select("*").eq("id", id).single(),
    supabase
      .from("documents")
      .select("id, title, doc_type, file_name, file_path, uploaded_at, profiles(full_name_ar)")
      .eq("student_id", id)
      .order("uploaded_at", { ascending: false }),
  ]);

  if (!student) notFound();

  // Private bucket — build a short-lived link for each file.
  const docsWithUrls = await Promise.all(
    ((docs as unknown as DocumentRow[]) ?? []).map(async (d) => {
      const { data: signed } = await supabase.storage.from("documents").createSignedUrl(d.file_path, 3600);
      return { ...d, signedUrl: signed?.signedUrl ?? null };
    })
  );

  return <StudentProfileClient student={student as Student} documents={docsWithUrls} />;
}
