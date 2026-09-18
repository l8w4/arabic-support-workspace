import { createClient } from "@/lib/supabase/server";
import PrepClient from "./PrepClient";
import type { Prep, Class } from "@/lib/types";

export default async function PrepPage() {
  const supabase = await createClient();

  const [{ data: preps }, { data: classes }] = await Promise.all([
    supabase
      .from("preps")
      .select("id, class_id, week_start, week_end, unit, lesson_title, document_path, created_at, classes(name_ar)")
      .order("week_start", { ascending: false }),
    supabase.from("classes").select("id, name_ar, academic_year, is_active, created_at").eq("is_active", true).order("name_ar"),
  ]);

  const prepsWithUrls = await Promise.all(
    ((preps as unknown as Prep[]) ?? []).map(async (p) => {
      if (!p.document_path) return { ...p, signedUrl: null };
      const { data: signed } = await supabase.storage.from("documents").createSignedUrl(p.document_path, 3600);
      return { ...p, signedUrl: signed?.signedUrl ?? null };
    })
  );

  return <PrepClient preps={prepsWithUrls} classes={(classes as Class[]) ?? []} />;
}
