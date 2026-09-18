"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Pencil, FileText, Upload } from "lucide-react";
import { useLang } from "@/lib/i18n/context";
import { createClient } from "@/lib/supabase/client";
import PlanForm from "@/components/PlanForm";
import ProgressBadge from "@/components/ProgressBadge";
import type { Plan, PlanReview, ProgressRating } from "@/lib/types";
import { updatePlan, addPlanReview } from "../actions";

const RATINGS: ProgressRating[] = ["great", "noticeable", "slight", "none"];

export default function PlanDetailClient({
  plan,
  reviews,
  documentUrl,
}: {
  plan: Plan;
  reviews: PlanReview[];
  documentUrl: string | null;
}) {
  const { t, lang } = useLang();
  const router = useRouter();
  const [tab, setTab] = useState<"info" | "reviews">("info");
  const [editing, setEditing] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const BackIcon = lang === "ar" ? ArrowRight : ArrowLeft;

  const boundUpdate = (formData: FormData) => {
    updatePlan(plan.id, formData);
    setEditing(false);
  };

  const boundReview = (formData: FormData) => {
    addPlanReview(plan.id, formData);
    setShowReviewForm(false);
  };

  async function handleDocumentUpload(formData: FormData) {
    setError("");
    const file = formData.get("file") as File;
    if (!file || file.size === 0) return;

    setUploading(true);
    const supabase = createClient();
    const path = `plans/${plan.id}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage.from("documents").upload(path, file);
    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { error: updateError } = await supabase.from("plans").update({ document_path: path }).eq("id", plan.id);
    setUploading(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.refresh();
  }

  return (
    <div>
      <Link href="/plans" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <BackIcon size={15} /> {t("backToPlans")}
      </Link>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{plan.students?.name_ar ?? "—"}</h1>
          <div className="text-xs text-slate-400">{plan.term || "—"}</div>
        </div>
        {tab === "info" && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-sm bg-slate-900 text-white px-3.5 py-2 rounded-lg"
          >
            <Pencil size={14} /> {t("edit")}
          </button>
        )}
      </div>

      <div className="flex gap-1 border-b border-slate-200 mb-5">
        {(["info", "reviews"] as const).map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px ${
              tab === tb ? "border-blue-600 text-blue-700 font-medium" : "border-transparent text-slate-500"
            }`}
          >
            {tb === "info" ? t("planInfo") : t("planReviews")}
          </button>
        ))}
      </div>

      {tab === "info" &&
        (editing ? (
          <PlanForm action={boundUpdate} defaultValues={plan} />
        ) : (
          <div className="flex flex-col gap-5 max-w-lg">
            <div className="bg-white border border-slate-200 rounded-xl p-5 grid grid-cols-2 gap-4">
              <Field label={t("planStatus")} value={t(`planStatus_${plan.status}` as any)} />
              <div>
                <div className="text-xs text-slate-400 mb-0.5">{t("progressRating")}</div>
                <ProgressBadge rating={plan.progress_rating} />
              </div>
              <Field
                label={t("planStartsOn")}
                value={plan.starts_on ? new Date(plan.starts_on).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB") : null}
              />
              <Field
                label={t("planEndsOn")}
                value={plan.ends_on ? new Date(plan.ends_on).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB") : null}
              />
              <Field
                label={t("planReviewOn")}
                value={plan.review_on ? new Date(plan.review_on).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB") : null}
              />
              <Field label={t("planCoordinator")} value={plan.coordinator_name} />
              <div className="col-span-2">
                <Field label={t("planObjectives")} value={plan.general_objectives} />
              </div>
              <div className="col-span-2">
                <Field label={t("finalReport")} value={plan.final_report} />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs text-slate-400 mb-2">{t("planDocument")}</div>
              {documentUrl ? (
                <a
                  href={documentUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                >
                  <FileText size={16} /> {t("download")}
                </a>
              ) : (
                <div className="text-sm text-slate-500 mb-3">{t("noDocument")}</div>
              )}
              <form action={handleDocumentUpload} className="flex items-center gap-2 mt-3">
                <input name="file" type="file" required className="text-sm" />
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex items-center gap-1.5 bg-slate-900 disabled:opacity-60 text-white text-xs px-3 py-1.5 rounded-lg"
                >
                  <Upload size={13} /> {uploading ? "..." : t("uploadFile")}
                </button>
              </form>
              {error && <div className="text-sm text-red-600 mt-2">{error}</div>}
            </div>
          </div>
        ))}

      {tab === "reviews" && (
        <div className="max-w-lg">
          <button
            onClick={() => setShowReviewForm((v) => !v)}
            className="mb-4 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3.5 py-2 rounded-lg"
          >
            {t("recordReview")}
          </button>

          {showReviewForm && (
            <form
              action={boundReview}
              className="bg-white border border-slate-200 rounded-xl p-5 mb-5 flex flex-col gap-4"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">{t("reviewedOn")}</label>
                  <input
                    name="reviewed_on"
                    type="date"
                    defaultValue={new Date().toISOString().slice(0, 10)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">{t("progressRating")}</label>
                  <select
                    name="progress_rating"
                    required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    {RATINGS.map((r) => (
                      <option key={r} value={r}>
                        {t(`progress_${r}` as any)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">{t("planReviewOn")}</label>
                <input
                  name="next_review_on"
                  type="date"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">{t("reviewNotes")}</label>
                <textarea
                  name="notes"
                  rows={3}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
              <button type="submit" className="self-start bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-lg">
                {t("save")}
              </button>
            </form>
          )}

          {reviews.length === 0 ? (
            <div className="text-sm text-slate-500">{t("noReviewsYet")}</div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
              {reviews.map((r) => (
                <div key={r.id} className="p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-slate-800">
                      {new Date(r.reviewed_on).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB")}
                    </span>
                    <ProgressBadge rating={r.progress_rating} />
                  </div>
                  {r.notes && <p className="text-sm text-slate-600 mb-1.5">{r.notes}</p>}
                  {r.profiles?.full_name_ar && (
                    <div className="text-xs text-slate-400">
                      {t("uploadedBy")} {r.profiles.full_name_ar}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <div className="text-xs text-slate-400 mb-0.5">{label}</div>
      <div className="text-sm text-slate-800">{value || "—"}</div>
    </div>
  );
}
