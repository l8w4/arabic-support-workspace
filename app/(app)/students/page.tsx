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

  const withPhotos = await Promise.all(
    ((students as Student[]) ?? []).map(async (s) => {
      if (!s.photo_path) return { ...s, photoUrl: null };
      const { data: signed } = await supabase.storage.from("documents").createSignedUrl(s.photo_path, 3600);
      return { ...s, photoUrl: signed?.signedUrl ?? null };
    })
  );

  return <StudentsClient students={withPhotos} />;
}
