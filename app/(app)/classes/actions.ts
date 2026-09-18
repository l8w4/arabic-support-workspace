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

// Toggles a student's membership in a class. Re-adding after being removed
// resets left_on rather than inserting a new row, since (class_id,
// student_id) is the table's primary key.
export async function setClassMembership(classId: string, studentId: string, member: boolean) {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  if (member) {
    await supabase
      .from("class_students")
      .upsert(
        { class_id: classId, student_id: studentId, joined_on: today, left_on: null },
        { onConflict: "class_id,student_id" }
      );
  } else {
    await supabase
      .from("class_students")
      .update({ left_on: today })
      .eq("class_id", classId)
      .eq("student_id", studentId);
  }

  revalidatePath("/classes");
  revalidatePath("/attendance");
}
