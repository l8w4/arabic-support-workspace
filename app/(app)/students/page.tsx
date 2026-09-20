import { createClient } from "@/lib/supabase/server";
import StudentsClient from "./StudentsClient";
import type { Student } from "@/lib/types";

export default async function StudentsPage({ searchParams }: { searchParams: Promise<{ class?: string }> }) {
  const { class: selected } = await searchParams;
  const supabase = await createClient();

  const [{ data: students }, { data: memberships }, { data: classes }] = await Promise.all([
    supabase
      .from("students")
      .select("id, name_ar, name_en, student_code, grade, diagnostic_level, photo_path, status, created_at")
      .eq("status", "active")
      .order("name_ar", { ascending: true }),
    supabase.from("class_students").select("student_id, class_id").is("left_on", null),
    supabase.from("classes").select("id, name_ar, academic_year").eq("is_active", true).order("name_ar"),
  ]);

  const classList = (classes as { id: string; name_ar: string; academic_year: string }[]) ?? [];
  const classNameById = new Map(classList.map((c) => [c.id, c.name_ar]));

  // Only active classes count: a student whose only classes are archived shows as unassigned.
  const classIdsByStudent: Record<string, string[]> = {};
  for (const m of (memberships as { student_id: string; class_id: string }[]) ?? []) {
    if (!classNameById.has(m.class_id)) continue;
    (classIdsByStudent[m.student_id] ??= []).push(m.class_id);
  }

  const cards = await Promise.all(
    ((students as unknown as Student[]) ?? []).map(async (s) => {
      const classIds = classIdsByStudent[s.id] ?? [];
      const classNames = classIds.map((id) => classNameById.get(id)!).sort((a, b) => a.localeCompare(b, "ar"));
      if (!s.photo_path) return { ...s, photoUrl: null, classIds, classNames };
      const { data: signed } = await supabase.storage.from("documents").createSignedUrl(s.photo_path, 3600);
      return { ...s, photoUrl: signed?.signedUrl ?? null, classIds, classNames };
    })
  );

  return <StudentsClient students={cards} classes={classList} initialSelected={selected ?? null} />;
}
