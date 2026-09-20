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
    health_status: (formData.get("health_status") as string)?.trim() || null,
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
    redirect(`/students/new?error=${encodeURIComponent(error?.message ?? "1")}`);
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
  if (!fields.name_ar) return { success: false, error: undefined };

  const { error } = await supabase
    .from("students")
    .update({ ...fields, updated_by: user?.id, updated_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath(`/students/${id}`);
  revalidatePath("/students");
  return { success: !error, error: error?.message };
}

export async function deleteHomeworkEntry(id: string, studentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("homework_entries").delete().eq("id", id).select("id");
  revalidatePath(`/students/${studentId}`);
  revalidatePath("/homework");
  return { success: !error && (data?.length ?? 0) > 0 };
}

export async function addGradeEntry(studentId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const title = (formData.get("title") as string)?.trim();
  const score = Number(formData.get("score"));
  const maxScore = Number(formData.get("max_score") || 100);
  if (!title || Number.isNaN(score)) return { success: false, error: undefined };

  const { error } = await supabase.from("grade_entries").insert({
    student_id: studentId,
    title,
    assessed_date: (formData.get("assessed_date") as string) || undefined,
    score,
    max_score: maxScore,
    note: (formData.get("note") as string)?.trim() || null,
    created_by: user?.id,
  });

  revalidatePath(`/students/${studentId}`);
  return { success: !error, error: error?.message };
}

export async function deleteGradeEntry(id: string, studentId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("grade_entries").delete().eq("id", id).select("id");
  revalidatePath(`/students/${studentId}`);
  revalidatePath("/marks");
  return { success: !error && (data?.length ?? 0) > 0 };
}
