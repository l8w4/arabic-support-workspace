"use client";

import { useLang } from "@/lib/i18n/context";
import StudentForm from "@/components/StudentForm";
import { createStudent } from "../actions";

export default function NewStudentClient({ error }: { error?: string }) {
  const { t } = useLang();
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-5">{t("addStudent")}</h1>
      {error && (
        <div className="text-sm text-red-600 mb-4 max-w-lg" dir="ltr">
          {t("createStudentFailed")}
          {error !== "1" ? `: ${error}` : ""}
        </div>
      )}
      <StudentForm action={createStudent} />
    </div>
  );
}
