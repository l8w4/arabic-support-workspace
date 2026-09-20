import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import StudentProfileClient from "./StudentProfileClient";
import type { Student, DocumentRow, HomeworkEntry } from "@/lib/types";

export default async function StudentProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: student }, { data: docs }, { data: homework }] = await Promise.all([
    supabase.from("students").select("*").eq("id", id).single(),
    supabase
      .from("documents")
      .select("id, title, doc_type, file_name, file_path, uploaded_at, profiles(full_name_ar)")
      .eq("student_id", id)
      .order("uploaded_at", { ascending: false }),
    supabase
      .from("homework_entries")
      .select("id, student_id, title, assigned_date, status, note, document_id, created_at, documents(file_name, file_path)")
      .eq("student_id", id)
      .order("assigned_date", { ascending: false })
      .order("created_at", { ascending: false }),
  ]);

  if (!student) notFound();

  // Private bucket — build a short-lived link for each file.
  const docsWithUrls = await Promise.all(
    ((docs as unknown as DocumentRow[]) ?? []).map(async (d) => {
      const { data: signed } = await supabase.storage.from("documents").createSignedUrl(d.file_path, 3600);
      return { ...d, signedUrl: signed?.signedUrl ?? null };
    })
  );

  const homeworkWithUrls = await Promise.all(
    ((homework as unknown as HomeworkEntry[]) ?? []).map(async (h) => {
      if (!h.documents?.file_path) return { ...h, signedUrl: null };
      const { data: signed } = await supabase.storage.from("documents").createSignedUrl(h.documents.file_path, 3600);
      return { ...h, signedUrl: signed?.signedUrl ?? null };
    })
  );

  let photoUrl: string | null = null;
  const studentRow = student as Student;
  if (studentRow.photo_path) {
    const { data: signed } = await supabase.storage.from("documents").createSignedUrl(studentRow.photo_path, 3600);
    photoUrl = signed?.signedUrl ?? null;
  }

  return <StudentProfileClient student={studentRow} documents={docsWithUrls} homework={homeworkWithUrls} photoUrl={photoUrl} />;
}
