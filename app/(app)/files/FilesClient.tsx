"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, Pencil, Trash2 } from "lucide-react";
import { useLang } from "@/lib/i18n/context";
import { useCanEdit } from "@/lib/access/context";
import { createClient } from "@/lib/supabase/client";
import { updateDocument, deleteDocument } from "./actions";
import type { DocumentRow, DocType } from "@/lib/types";

const DOC_TYPES: DocType[] = ["worksheet", "consent", "report", "photo", "plan", "prep", "other"];

export default function FilesClient({
  documents,
  students,
}: {
  documents: (DocumentRow & { signedUrl: string | null })[];
  students: { id: string; name_ar: string }[];
}) {
  const { t, lang } = useLang();
  const router = useRouter();
  const canEdit = useCanEdit();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [listError, setListError] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const filtered = filterType === "all" ? documents : documents.filter((d) => d.doc_type === filterType);

  async function handleUpload(formData: FormData) {
    setError("");
    const file = formData.get("file") as File;
    const title = (formData.get("title") as string)?.trim();
    const docType = formData.get("doc_type") as string;
    const studentId = (formData.get("student_id") as string) || null;
    const notes = (formData.get("notes") as string)?.trim() || null;

    if (!file || file.size === 0 || !title) {
      setError(lang === "ar" ? "الرجاء اختيار ملف وكتابة عنوان" : "Please choose a file and enter a title");
      return;
    }

    setUploading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const path = `${studentId ?? "general"}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage.from("documents").upload(path, file);
    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { error: insertError } = await supabase.from("documents").insert({
      title,
      doc_type: docType,
      student_id: studentId,
      file_path: path,
      file_name: file.name,
      mime_type: file.type || null,
      size_bytes: file.size,
      notes,
      uploaded_by: user?.id,
    });

    setUploading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setShowForm(false);
    router.refresh();
  }

  async function handleUpdate(id: string, formData: FormData) {
    setListError("");
    const result = await updateDocument(id, formData);
    if (result.success) setEditingId(null);
    else setListError(result.error ?? t("saveError"));
  }

  async function handleDelete(id: string, filePath: string) {
    if (!window.confirm(t("confirmDeleteEntry"))) return;
    setListError("");
    const result = await deleteDocument(id, filePath);
    if (!result.success) setListError(result.error ?? t("saveError"));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-slate-900">{t("files")}</h1>
        <div className="flex items-center gap-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">{lang === "ar" ? "كل الأنواع" : "All types"}</option>
            {DOC_TYPES.map((dt) => (
              <option key={dt} value={dt}>
                {t(`docType_${dt}` as any)}
              </option>
            ))}
          </select>
          {canEdit && (
            <button
              onClick={() => setShowForm((v) => !v)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3.5 py-2 rounded-lg"
            >
              <Upload size={16} /> {t("uploadFile")}
            </button>
          )}
        </div>
      </div>

      {canEdit && showForm && (
        <form
          action={handleUpload}
          className="bg-white border border-slate-200 rounded-xl p-5 mb-6 flex flex-col gap-4 max-w-lg relative"
        >
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="absolute top-4 end-4 text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
          <div>
            <label className="block text-xs text-slate-500 mb-1">{t("fileTitle")}</label>
            <input
              name="title"
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">{t("fileType")}</label>
              <select
                name="doc_type"
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {DOC_TYPES.map((dt) => (
                  <option key={dt} value={dt}>
                    {t(`docType_${dt}` as any)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">{t("linkedStudent")}</label>
              <select
                name="student_id"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="">{t("none")}</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name_ar}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">{t("chooseFile")}</label>
            <input name="file" type="file" required className="w-full text-sm" />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">{t("notes")}</label>
            <textarea
              name="notes"
              rows={2}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button
            type="submit"
            disabled={uploading}
            className="self-start bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm px-5 py-2 rounded-lg"
          >
            {uploading ? "..." : t("save")}
          </button>
        </form>
      )}

      {listError && (
        <div className="text-sm text-red-600 mb-3" dir="ltr">
          {listError}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-sm text-slate-500">{t("noUploadsYet")}</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {filtered.map((d) =>
            editingId === d.id ? (
              <form
                key={d.id}
                action={(fd) => handleUpdate(d.id, fd)}
                className="p-4 flex flex-col gap-3 text-sm bg-slate-50"
              >
                <div>
                  <label className="block text-xs text-slate-500 mb-1">{t("fileTitle")}</label>
                  <input
                    name="title"
                    required
                    defaultValue={d.title}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">{t("fileType")}</label>
                    <select
                      name="doc_type"
                      required
                      defaultValue={d.doc_type}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      {DOC_TYPES.map((dt) => (
                        <option key={dt} value={dt}>
                          {t(`docType_${dt}` as any)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1">{t("linkedStudent")}</label>
                    <select
                      name="student_id"
                      defaultValue={d.student_id ?? ""}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    >
                      <option value="">{t("none")}</option>
                      {students.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name_ar}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">{t("notes")}</label>
                  <textarea
                    name="notes"
                    rows={2}
                    defaultValue={d.notes ?? ""}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg">
                    {t("save")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="text-sm text-slate-500 hover:text-slate-700 px-2 py-2"
                  >
                    {t("cancel")}
                  </button>
                </div>
              </form>
            ) : (
              <div key={d.id} className="p-4 flex items-center justify-between text-sm flex-wrap gap-2">
                <div className="flex items-center gap-2.5">
                  <FileText size={16} className="text-slate-400 shrink-0" />
                  <div>
                    <div className="text-slate-800">{d.title}</div>
                    <div className="text-xs text-slate-400">
                      {t(`docType_${d.doc_type}` as any)}
                      {d.students?.name_ar ? " · " + d.students.name_ar : ""} ·{" "}
                      {new Date(d.uploaded_at).toLocaleString(lang === "ar" ? "ar-EG" : "en-GB")}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {d.signedUrl && (
                    <a href={d.signedUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">
                      {t("download")}
                    </a>
                  )}
                  {canEdit && (
                    <>
                      <button
                        onClick={() => setEditingId(d.id)}
                        className="text-slate-300 hover:text-slate-700"
                        aria-label={t("edit")}
                        title={t("edit")}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={() => handleDelete(d.id, d.file_path)}
                        className="text-slate-300 hover:text-red-600"
                        aria-label={t("deleteEntry")}
                        title={t("deleteEntry")}
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
