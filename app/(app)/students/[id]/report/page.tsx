import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReportClient from "./ReportClient";
import type { Student, AttendanceStatus, HomeworkStatus, DocType, GradeEntry } from "@/lib/types";

export type ReportAttendance = {
  attend_date: string;
  status: AttendanceStatus;
  note: string | null;
  classes: { name_ar: string } | null;
};
export type ReportHomework = {
  id: string;
  title: string;
  assigned_date: string;
  status: HomeworkStatus;
  note: string | null;
};
export type ReportFile = { id: string; title: string; doc_type: DocType; file_name: string; uploaded_at: string };

export default async function StudentReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: student }, { data: attendance }, { data: homework }, { data: files }, { data: grades }] = await Promise.all([
    supabase.from("students").select("*").eq("id", id).single(),
    supabase
      .from("attendance")
      .select("attend_date, status, note, classes(name_ar)")
      .eq("student_id", id)
      .order("attend_date", { ascending: false }),
    supabase
      .from("homework_entries")
      .select("id, title, assigned_date, status, note")
      .eq("student_id", id)
      .order("assigned_date", { ascending: false })
      .order("created_at", { ascending: false }),
    supabase
      .from("documents")
      .select("id, title, doc_type, file_name, uploaded_at")
      .eq("student_id", id)
      .order("uploaded_at", { ascending: false }),
    supabase
      .from("grade_entries")
      .select("id, student_id, title, assessed_date, score, max_score, note, created_at")
      .eq("student_id", id)
      .order("assessed_date", { ascending: false }),
  ]);

  if (!student) notFound();
  const studentRow = student as Student;

  let photoUrl: string | null = null;
  if (studentRow.photo_path) {
    const { data: signed } = await supabase.storage.from("documents").createSignedUrl(studentRow.photo_path, 3600);
    photoUrl = signed?.signedUrl ?? null;
  }

  return (
    <ReportClient
      student={studentRow}
      photoUrl={photoUrl}
      attendance={(attendance as unknown as ReportAttendance[]) ?? []}
      homework={(homework as unknown as ReportHomework[]) ?? []}
      files={(files as unknown as ReportFile[]) ?? []}
      grades={(grades as GradeEntry[]) ?? []}
    />
  );
}
