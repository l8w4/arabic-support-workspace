"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function readPlanForm(formData: FormData) {
  return {
    term: (formData.get("term") as string)?.trim() || null,
    starts_on: (formData.get("starts_on") as string) || null,
    ends_on: (formData.get("ends_on") as string) || null,
    general_objectives: (formData.get("general_objectives") as string)?.trim() || null,
    coordinator_name: (formData.get("coordinator_name") as string)?.trim() || null,
    review_on: (formData.get("review_on") as string) || null,
    status: (formData.get("status") as string) || "draft",
    final_report: (formData.get("final_report") as string)?.trim() || null,
  };
}

export async function createPlan(formData: FormData) {
  const supabase = await createClient();
  const studentId = formData.get("student_id") as string;
  if (!studentId) return;

  const fields = readPlanForm(formData);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from("plans")
    .insert({ ...fields, student_id: studentId, created_by: user?.id, updated_by: user?.id })
    .select("id")
    .single();

  if (error || !data) {
    redirect("/plans/new?error=1");
  }

  revalidatePath("/plans");
  redirect(`/plans/${data.id}`);
}

export async function updatePlan(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const fields = readPlanForm(formData);

  await supabase
    .from("plans")
    .update({ ...fields, updated_by: user?.id, updated_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath(`/plans/${id}`);
  revalidatePath("/plans");
}

export async function addPlanReview(planId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const reviewedOn = (formData.get("reviewed_on") as string) || new Date().toISOString().slice(0, 10);
  const progressRating = formData.get("progress_rating") as string;
  const notes = (formData.get("notes") as string)?.trim() || null;
  const nextReviewOn = (formData.get("next_review_on") as string) || null;

  if (!progressRating) return;

  await supabase.from("plan_reviews").insert({
    plan_id: planId,
    reviewed_on: reviewedOn,
    progress_rating: progressRating,
    notes,
    reviewed_by: user?.id,
  });

  // The plan's own progress_rating reflects the latest review; review_on
  // moves forward if a next review date was given, so overdue flags clear.
  await supabase
    .from("plans")
    .update({
      progress_rating: progressRating,
      ...(nextReviewOn ? { review_on: nextReviewOn } : {}),
      updated_by: user?.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", planId);

  revalidatePath(`/plans/${planId}`);
  revalidatePath("/plans");
}
