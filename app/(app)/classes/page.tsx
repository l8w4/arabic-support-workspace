import { createClient } from "@/lib/supabase/server";
import ClassesClient from "./ClassesClient";
import type { Class, Student } from "@/lib/types";

export default async function ClassesPage() {
  const supabase = await createClient();
  const [{ data: classes }, { data: students }, { data: memberships }] = await Promise.all([
    supabase
      .from("classes")
      .select("id, name_ar, academic_year, is_active, created_at")
      .order("is_active", { ascending: false })
      .order("name_ar"),
    supabase.from("students").select("id, name_ar").eq("status", "active").order("name_ar"),
    supabase.from("class_students").select("class_id, student_id").is("left_on", null),
  ]);

  return (
    <ClassesClient
      classes={(classes as Class[]) ?? []}
      students={(students as Pick<Student, "id" | "name_ar">[]) ?? []}
      memberships={(memberships as { class_id: string; student_id: string }[]) ?? []}
    />
  );
}
