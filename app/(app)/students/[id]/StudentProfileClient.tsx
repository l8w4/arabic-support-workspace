"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowLeft, Pencil, FileText } from "lucide-react";
import { useLang } from "@/lib/i18n/context";
import StudentForm from "@/components/StudentForm";
import type { Student, DocumentRow } from "@/lib/types";
import { updateStudent } from "../actions";

export default function StudentProfileClient({
  student,
  documents,
}: {
  student: Student;
  documents: (DocumentRow & { signedUrl: string | null })[];
}) {
  const { t, lang } = useLang();
  const [tab, setTab] = useState<"info" | "files">("info");
  const [editing, setEditing] = useState(false);
  const BackIcon = lang === "ar" ? ArrowRight : ArrowLeft;

  const boundUpdate = (formData: FormData) => {
    updateStudent(student.id, formData);
    setEditing(false);
  };

  return (
    <div>
      <Link href="/students" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <BackIcon size={15} /> {t("backToStudents")}
      </Link>

      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">{student.name_ar}</h1>
          <div className="text-xs text-slate-400">{student.student_code}</div>
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
        {(["info", "files"] as const).map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px ${
              tab === tb ? "border-blue-600 text-blue-700 font-medium" : "border-transparent text-slate-500"
            }`}
          >
            {tb === "info" ? t("studentInfo") : t("studentFiles")}
          </button>
        ))}
      </div>

      {tab === "info" &&
        (editing ? (
          <StudentForm action={boundUpdate} defaultValues={student} />
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-5 grid grid-cols-2 gap-4 max-w-lg">
            <Field label={t("grade")} value={student.grade} />
            <Field label={t("diagnosticLevel")} value={student.diagnostic_level} />
            <Field label={t("guardianName")} value={student.guardian_name} />
            <Field label={t("guardianPhone")} value={student.guardian_phone} />
            <div className="col-span-2">
              <Field label={t("generalNotes")} value={student.general_notes} />
            </div>
          </div>
        ))}

      {tab === "files" && (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {documents.length === 0 && <div className="p-4 text-sm text-slate-500">{t("noUploadsYet")}</div>}
          {documents.map((d) => (
            <div key={d.id} className="p-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2.5">
                <FileText size={16} className="text-slate-400" />
                <div>
                  <div className="text-slate-800">{d.title}</div>
                  <div className="text-xs text-slate-400">
                    {new Date(d.uploaded_at).toLocaleString(lang === "ar" ? "ar-EG" : "en-GB")}
                  </div>
                </div>
              </div>
              {d.signedUrl && (
                <a href={d.signedUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                  {t("download")}
                </a>
              )}
            </div>
          ))}
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
