import { createClient } from "@/lib/supabase/server";
import HomeClient from "./HomeClient";
import type { DocumentRow } from "@/lib/types";

export default async function HomePage() {
  const supabase = createClient();

  const [{ count: studentCount }, { count: fileCount }, { data: recentDocs }] = await Promise.all([
    supabase.from("students").select("*", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("documents").select("*", { count: "exact", head: true }),
    supabase
      .from("documents")
      .select("id, title, doc_type, file_name, uploaded_at, students(name_ar), profiles(full_name_ar)")
      .order("uploaded_at", { ascending: false })
      .limit(6),
  ]);

  return (
    <HomeClient
      studentCount={studentCount ?? 0}
      fileCount={fileCount ?? 0}
      recentDocs={(recentDocs as unknown as DocumentRow[]) ?? []}
    />
  );
}
