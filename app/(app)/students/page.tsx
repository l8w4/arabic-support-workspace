import { createClient } from "@/lib/supabase/server";
import StudentsClient from "./StudentsClient";
import type { Student } from "@/lib/types";

export default async function StudentsPage() {
  const supabase = await createClient();
  const [{ data: students }, { data: memberships }] = await Promise.all([
    supabase
      .from("students")
      .select("id, name_ar, name_en, student_code, grade, diagnostic_level, photo_path, status, created_at")
      .eq("status", "active").order("name_ar", { ascending: true }),
    supabase.from("class_students").select("student_id, classes(name_ar)").is("left_on", null),
  ]);

  const classesByStudent: Record<string, string[]> = {};
  for (const m of (memberships as unknown as { student_id: string; classes: { name_ar: string } | null }[]) ?? []) {
    if (!m.classes) continue;
    (classesByStudent[m.student_id] ??= []).push(m.classes.name_ar);
  }

  const withPhotos = await Promise.all(
    ((students as unknown as Student[]) ?? []).map(async (s) => {
      const classNames = (classesByStudent[s.id] ?? []).sort((a, b) => a.localeCompare(b, "ar"));
      if (!s.photo_path) return { ...s, photoUrl: null, classNames };
      const { data: signed } = await supabase.storage.from("documents").createSignedUrl(s.photo_path, 3600);
      return { ...s, photoUrl: signed?.signedUrl ?? null, classNames };
    })
  );

  return <StudentsClient students={withPhotos} />;
}
