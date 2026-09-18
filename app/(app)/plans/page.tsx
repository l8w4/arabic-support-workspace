import { createClient } from "@/lib/supabase/server";
import PlansClient from "./PlansClient";
import type { Plan, Student } from "@/lib/types";

export default async function PlansPage() {
  const supabase = await createClient();

  const [{ data: plans }, { data: students }] = await Promise.all([
    supabase
      .from("plans")
      .select(
        "id, student_id, term, starts_on, ends_on, general_objectives, coordinator_name, progress_rating, review_on, status, document_path, final_report, created_at, updated_at, students(name_ar)"
      )
      .order("review_on", { ascending: true, nullsFirst: false }),
    supabase.from("students").select("id, name_ar").eq("status", "active").order("name_ar"),
  ]);

  return (
    <PlansClient
      plans={(plans as unknown as Plan[]) ?? []}
      students={(students as Pick<Student, "id" | "name_ar">[]) ?? []}
    />
  );
}
