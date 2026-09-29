import { createClient } from "@/lib/supabase/server";
import NewStudentClient from "./NewStudentClient";
import type { Class } from "@/lib/types";

export default async function NewStudentPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; class?: string }>;
}) {
  const { error, class: classParam } = await searchParams;
  const supabase = await createClient();
  const { data: classes } = await supabase
    .from("classes")
    .select("id, name_ar, academic_year")
    .eq("is_active", true)
    .order("name_ar");

  return (
    <NewStudentClient
      error={error}
      classes={(classes as Pick<Class, "id" | "name_ar" | "academic_year">[]) ?? []}
      initialClass={classParam ?? null}
    />
  );
}
