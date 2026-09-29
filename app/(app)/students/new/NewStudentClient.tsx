"use client";

import { useState } from "react";
import { useLang } from "@/lib/i18n/context";
import StudentForm from "@/components/StudentForm";
import { createStudent } from "../actions";
import { Layers, UserX } from "lucide-react";

type ClassItem = { id: string; name_ar: string; academic_year: string };

export default function NewStudentClient({
  error,
  classes,
  initialClass,
}: {
  error?: string;
  classes: ClassItem[];
  initialClass: string | null;
}) {
  const { t } = useLang();
  const isValid = (key: string | null) => key === "unassigned" || (key !== null && classes.some((c) => c.id === key));
  const [classChoice, setClassChoice] = useState<string | null>(isValid(initialClass) ? initialClass : null);

  if (classChoice === null) {
    return (
      <div>
        <h1 className="text-xl font-semibold text-slate-900 mb-2">{t("addStudent")}</h1>
        <p className="text-sm text-slate-500 mb-5">{t("chooseClassToStart")}</p>
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))" }}>
          {classes.map((c) => (
            <button
              key={c.id}
              onClick={() => setClassChoice(c.id)}
              className="text-start bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <Layers size={18} className="text-blue-600 mb-2" />
              <div className="font-medium text-slate-900">{c.name_ar}</div>
              <div className="text-xs text-slate-400">{c.academic_year}</div>
            </button>
          ))}
          <button
            onClick={() => setClassChoice("unassigned")}
            className="text-start bg-white border border-slate-200 rounded-xl p-4 hover:border-slate-300 hover:shadow-sm transition-all"
          >
            <UserX size={18} className="text-slate-400 mb-2" />
            <div className="font-medium text-slate-900">{t("noClassOption")}</div>
          </button>
        </div>
      </div>
    );
  }

  const className = classChoice === "unassigned" ? t("noClassOption") : classes.find((c) => c.id === classChoice)?.name_ar;

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{t("addStudent")}</h1>
          <div className="text-sm text-slate-500">
            {t("addingStudentTo")} <span className="font-medium text-slate-700">{className}</span>
          </div>
        </div>
        <button
          onClick={() => setClassChoice(null)}
          className="text-sm text-blue-600 hover:underline"
        >
          {t("changeClass")}
        </button>
      </div>

      {error && (
        <div className="text-sm text-red-600 mb-4 max-w-lg" dir="ltr">
          {t("createStudentFailed")}
          {error !== "1" ? `: ${error}` : ""}
        </div>
      )}

      <StudentForm action={createStudent}>
        <input type="hidden" name="class_id" value={classChoice === "unassigned" ? "" : classChoice} />
      </StudentForm>
    </div>
  );
}
