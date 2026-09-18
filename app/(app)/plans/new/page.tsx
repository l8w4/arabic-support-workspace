import { createClient } from "@/lib/supabase/server";
import NewPlanClient from "./NewPlanClient";
import type { Student } from "@/lib/types";

export default async function NewPlanPage() {
  const supabase = await createClient();
  const { data: students } = await supabase
    .from("students")
    .select("id, name_ar")
    .eq("status", "active")
    .order("name_ar");

  return <NewPlanClient students={(students as Pick<Student, "id" | "name_ar">[]) ?? []} />;
}
