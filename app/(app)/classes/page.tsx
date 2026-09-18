import { createClient } from "@/lib/supabase/server";
import ClassesClient from "./ClassesClient";
import type { Class } from "@/lib/types";

export default async function ClassesPage() {
  const supabase = await createClient();
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name_ar, academic_year, is_active, created_at")
    .order("is_active", { ascending: false })
    .order("name_ar");

  return <ClassesClient classes={(classes as Class[]) ?? []} />;
}
