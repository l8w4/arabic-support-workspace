"use client";

import { useLang } from "@/lib/i18n/context";
import StudentForm from "@/components/StudentForm";
import { createStudent } from "../actions";

export default function NewStudentPage() {
  const { t } = useLang();
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-5">{t("addStudent")}</h1>
      <StudentForm action={createStudent} />
    </div>
  );
}
