"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createClass(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const name_ar = (formData.get("name_ar") as string)?.trim();
  const academic_year = (formData.get("academic_year") as string)?.trim();
  if (!name_ar || !academic_year) return;

  await supabase.from("classes").insert({ name_ar, academic_year, created_by: user?.id });

  revalidatePath("/classes");
}

export async function setClassActive(id: string, isActive: boolean) {
  const supabase = await createClient();
  await supabase.from("classes").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/classes");
}
