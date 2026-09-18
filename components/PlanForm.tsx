"use client";

import { useLang } from "@/lib/i18n/context";
import type { Plan, PlanStatus, Student } from "@/lib/types";

const STATUSES: PlanStatus[] = ["draft", "active", "under_review", "completed"];

export default function PlanForm({
  action,
  defaultValues,
  students,
}: {
  action: (formData: FormData) => void;
  defaultValues?: Partial<Plan>;
  students?: Pick<Student, "id" | "name_ar">[];
}) {
  const { t } = useLang();

  return (
    <form action={action} className="flex flex-col gap-4 max-w-lg">
      {students && (
        <div>
          <label className="block text-xs text-slate-500 mb-1">{t("forStudent")}</label>
          <select
            name="student_id"
            required
            defaultValue={defaultValues?.student_id ?? ""}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="" disabled>
              {t("chooseStudent")}
            </option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name_ar}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">{t("planTerm")}</label>
          <input
            name="term"
            defaultValue={defaultValues?.term ?? ""}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">{t("planStatus")}</label>
          <select
            name="status"
            defaultValue={defaultValues?.status ?? "draft"}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`planStatus_${s}` as any)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">{t("planStartsOn")}</label>
          <input
            name="starts_on"
            type="date"
            defaultValue={defaultValues?.starts_on ?? ""}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">{t("planEndsOn")}</label>
          <input
            name="ends_on"
            type="date"
            defaultValue={defaultValues?.ends_on ?? ""}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">{t("planReviewOn")}</label>
        <input
          name="review_on"
          type="date"
          defaultValue={defaultValues?.review_on ?? ""}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">{t("planCoordinator")}</label>
        <input
          name="coordinator_name"
          defaultValue={defaultValues?.coordinator_name ?? ""}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">{t("planObjectives")}</label>
        <textarea
          name="general_objectives"
          rows={3}
          defaultValue={defaultValues?.general_objectives ?? ""}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">{t("finalReport")}</label>
        <textarea
          name="final_report"
          rows={3}
          defaultValue={defaultValues?.final_report ?? ""}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>
      <button type="submit" className="self-start bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-lg">
        {t("save")}
      </button>
    </form>
  );
}
