import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PlanDetailClient from "./PlanDetailClient";
import type { Plan, PlanReview } from "@/lib/types";

export default async function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: plan }, { data: reviews }] = await Promise.all([
    supabase
      .from("plans")
      .select(
        "id, student_id, term, starts_on, ends_on, general_objectives, coordinator_name, progress_rating, review_on, status, document_path, final_report, created_at, updated_at, students(name_ar)"
      )
      .eq("id", id)
      .single(),
    supabase
      .from("plan_reviews")
      .select("id, plan_id, reviewed_on, progress_rating, notes, reviewed_by, created_at, profiles(full_name_ar)")
      .eq("plan_id", id)
      .order("reviewed_on", { ascending: false }),
  ]);

  if (!plan) notFound();

  let documentUrl: string | null = null;
  if (plan.document_path) {
    const { data: signed } = await supabase.storage.from("documents").createSignedUrl(plan.document_path, 3600);
    documentUrl = signed?.signedUrl ?? null;
  }

  return (
    <PlanDetailClient
      plan={plan as unknown as Plan}
      reviews={(reviews as unknown as PlanReview[]) ?? []}
      documentUrl={documentUrl}
    />
  );
}
