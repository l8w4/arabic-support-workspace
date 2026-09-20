"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Pencil, FileText, User, Upload, Printer } from "lucide-react";
import { useLang } from "@/lib/i18n/context";
import { createClient } from "@/lib/supabase/client";
import StudentForm from "@/components/StudentForm";
import HomeworkTab from "./HomeworkTab";
import type { Student, DocumentRow, HomeworkEntry } from "@/lib/types";
import { updateStudent } from "../actions";

export default function StudentProfileClient({
  student,
  documents,
  homework,
  photoUrl,
}: {
  student: Student;
  documents: (DocumentRow & { signedUrl: string | null })[];
  homework: (HomeworkEntry & { signedUrl: string | null })[];
  photoUrl: string | null;
}) {
  const { t, lang } = useLang();
  const router = useRouter();
  const [tab, setTab] = useState<"info" | "homework" | "files">("info");
  const [editing, setEditing] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const BackIcon = lang === "ar" ? ArrowRight : ArrowLeft;

  const [saveError, setSaveError] = useState("");

  const boundUpdate = async (formData: FormData) => {
    setSaveError("");
    const result = await updateStudent(student.id, formData);
    if (result?.success) setEditing(false);
    else setSaveError(result?.error ?? t("saveError"));
  };

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    const supabase = createClient();
    const path = `students/${student.id}/photo-${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage.from("documents").upload(path, file);
    if (!uploadError) {
      await supabase.from("students").update({ photo_path: path }).eq("id", student.id);
      router.refresh();
    }
    setUploadingPhoto(false);
  }

  return (
    <div>
      <Link href="/students" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4">
        <BackIcon size={15} /> {t("backToStudents")}
      </Link>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="relative shrink-0">
            {photoUrl ? (
              <img src={photoUrl} alt={student.name_ar} className="w-16 h-16 rounded-full object-cover border border-slate-200" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center">
                <User size={26} />
              </div>
            )}
            <label className="absolute -bottom-1 -end-1 bg-slate-900 text-white rounded-full p-1.5 cursor-pointer hover:bg-slate-700">
              <Upload size={11} />
              <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} disabled={uploadingPhoto} />
            </label>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-slate-900">
              {student.name_ar}
              {student.name_en ? ` · ${student.name_en}` : ""}
            </h1>
            <div className="text-xs text-slate-400">{student.student_code}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/students/${student.id}/report`}
            target="_blank"
            className="flex items-center gap-1.5 text-sm border border-slate-300 text-slate-600 hover:bg-slate-50 px-3.5 py-2 rounded-lg"
          >
            <Printer size={14} /> {t("printReport")}
          </Link>
          {tab === "info" && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center gap-1.5 text-sm bg-slate-900 text-white px-3.5 py-2 rounded-lg"
            >
              <Pencil size={14} /> {t("edit")}
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-1 border-b border-slate-200 mb-5">
        {(["info", "homework", "files"] as const).map((tb) => (
          <button
            key={tb}
            onClick={() => setTab(tb)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px ${
              tab === tb ? "border-blue-600 text-blue-700 font-medium" : "border-transparent text-slate-500"
            }`}
          >
            {tb === "info" ? t("studentInfo") : tb === "homework" ? t("studentHomework") : t("studentFiles")}
          </button>
        ))}
      </div>

      {tab === "info" &&
        (editing ? (
          <div>
            {saveError && (
              <div className="text-sm text-red-600 mb-4 max-w-lg" dir="ltr">
                {t("saveError")}: {saveError}
              </div>
            )}
            <StudentForm action={boundUpdate} defaultValues={student} />
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-xl p-5 grid grid-cols-2 gap-4 max-w-lg">
            <Field label={t("grade")} value={student.grade} />
            <Field label={t("diagnosticLevel")} value={student.diagnostic_level} />
            <div className="col-span-2">
              <Field label={t("healthStatus")} value={student.health_status} />
            </div>
            <Field label={t("guardianName")} value={student.guardian_name} />
            <Field label={t("guardianPhone")} value={student.guardian_phone} />
            <div className="col-span-2">
              <Field label={t("generalNotes")} value={student.general_notes} />
            </div>
          </div>
        ))}

      {tab === "homework" && <HomeworkTab studentId={student.id} entries={homework} />}

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
