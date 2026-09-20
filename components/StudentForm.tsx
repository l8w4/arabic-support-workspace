"use client";

import { useLang } from "@/lib/i18n/context";
import type { Student } from "@/lib/types";

export default function StudentForm({
  action,
  defaultValues,
}: {
  action: (formData: FormData) => void;
  defaultValues?: Partial<Student>;
}) {
  const { t } = useLang();

  return (
    <form action={action} className="flex flex-col gap-4 max-w-lg">
      <div>
        <label className="block text-xs text-slate-500 mb-1">{t("studentNameAr")}</label>
        <input
          name="name_ar"
          required
          defaultValue={defaultValues?.name_ar}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">{t("studentNameEn")}</label>
        <input
          name="name_en"
          defaultValue={defaultValues?.name_en ?? ""}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">{t("studentCode")}</label>
          <input
            name="student_code"
            defaultValue={defaultValues?.student_code ?? ""}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">{t("grade")}</label>
          <input
            name="grade"
            defaultValue={defaultValues?.grade ?? ""}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">{t("diagnosticLevel")}</label>
        <input
          name="diagnostic_level"
          defaultValue={defaultValues?.diagnostic_level ?? ""}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">{t("healthStatus")}</label>
        <textarea
          name="health_status"
          rows={2}
          defaultValue={defaultValues?.health_status ?? ""}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-500 mb-1">{t("guardianName")}</label>
          <input
            name="guardian_name"
            defaultValue={defaultValues?.guardian_name ?? ""}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">{t("guardianPhone")}</label>
          <input
            name="guardian_phone"
            defaultValue={defaultValues?.guardian_phone ?? ""}
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">{t("generalNotes")}</label>
        <textarea
          name="general_notes"
          rows={3}
          defaultValue={defaultValues?.general_notes ?? ""}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
      </div>
      <button type="submit" className="self-start bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-lg">
        {t("save")}
      </button>
    </form>
  );
}
