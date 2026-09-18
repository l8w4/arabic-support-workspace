"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function readStudentForm(formData: FormData) {
  return {
    name_ar: (formData.get("name_ar") as string)?.trim(),
    name_en: (formData.get("name_en") as string)?.trim() || null,
    student_code: (formData.get("student_code") as string)?.trim() || null,
    grade: (formData.get("grade") as string)?.trim() || null,
    diagnostic_level: (formData.get("diagnostic_level") as string)?.trim() || null,
    guardian_name: (formData.get("guardian_name") as string)?.trim() || null,
    guardian_phone: (formData.get("guardian_phone") as string)?.trim() || null,
    general_notes: (formData.get("general_notes") as string)?.trim() || null,
  };
}

export async function createStudent(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fields = readStudentForm(formData);
  if (!fields.name_ar) return;

  const { data, error } = await supabase
    .from("students")
    .insert({ ...fields, created_by: user?.id, updated_by: user?.id })
    .select("id")
    .single();

  if (error || !data) {
    redirect("/students/new?error=1");
  }

  revalidatePath("/students");
  redirect(`/students/${data.id}`);
}

export async function updateStudent(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fields = readStudentForm(formData);
  if (!fields.name_ar) return;

  await supabase
    .from("students")
    .update({ ...fields, updated_by: user?.id, updated_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath(`/students/${id}`);
  revalidatePath("/students");
}
