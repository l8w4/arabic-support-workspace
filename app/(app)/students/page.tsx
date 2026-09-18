import { createClient } from "@/lib/supabase/server";
import StudentsClient from "./StudentsClient";
import type { Student } from "@/lib/types";

export default async function StudentsPage() {
  const supabase = await createClient();
  const { data: students } = await supabase
    .from("students")
    .select("*")
    .eq("status", "active")
    .order("name_ar", { ascending: true });

  return <StudentsClient students={(students as Student[]) ?? []} />;
}
