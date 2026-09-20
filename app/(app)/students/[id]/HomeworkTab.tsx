"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X, FileText, Trash2, Loader2, Pencil } from "lucide-react";
import { useLang } from "@/lib/i18n/context";
import HomeworkEditForm from "@/components/HomeworkEditForm";
import { createClient } from "@/lib/supabase/client";
import type { HomeworkEntry } from "@/lib/types";
import { HOMEWORK_STATUSES as STATUSES, HOMEWORK_STATUS_CLASS } from "@/lib/homework";
import { deleteHomeworkEntry } from "../actions";

export default function HomeworkTab({
  studentId,
  entries,
}: {
  studentId: string;
  entries: (HomeworkEntry & { signedUrl: string | null })[];
}) {
  const { t, lang } = useLang();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  async function handleAdd(formData: FormData) {
    setError("");
    const title = (formData.get("title") as string)?.trim();
    const assignedDate = formData.get("assigned_date") as string;
    const status = formData.get("status") as string;
    const note = (formData.get("note") as string)?.trim() || null;
    const file = formData.get("file") as File | null;
    if (!title) return;

    setSaving(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let documentId: string | null = null;
    if (file && file.size > 0) {
      const path = `students/${studentId}/homework/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from("documents").upload(path, file);
      if (uploadError) {
        setError(uploadError.message);
        setSaving(false);
        return;
      }
      const { data: doc, error: docError } = await supabase
        .from("documents")
        .insert({
          title,
          doc_type: file.type.startsWith("image/") ? "photo" : "worksheet",
          student_id: studentId,
          file_path: path,
          file_name: file.name,
          mime_type: file.type || null,
          size_bytes: file.size,
          uploaded_by: user?.id,
        })
        .select("id")
        .single();
      if (docError || !doc) {
        setError(docError?.message ?? t("saveError"));
        setSaving(false);
        return;
      }
      documentId = doc.id;
    }

    const { error: insertError } = await supabase.from("homework_entries").insert({
      student_id: studentId,
      title,
      assigned_date: assignedDate || undefined,
      status,
      note,
      document_id: documentId,
      created_by: user?.id,
    });

    setSaving(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    setShowForm(false);
    router.refresh();
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t("confirmDeleteEntry"))) return;
    const result = await deleteHomeworkEntry(id, studentId);
    if (!result.success) setError(t("saveError"));
  }

  return (
    <div className="max-w-2xl">
      <button
        onClick={() => setShowForm((v) => !v)}
        className="mb-4 flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3.5 py-2 rounded-lg"
      >
        <Plus size={16} /> {t("addHomework")}
      </button>

      {showForm && (
        <form
          action={handleAdd}
          className="bg-white border border-slate-200 rounded-xl p-5 mb-5 flex flex-col gap-4 relative"
        >
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="absolute top-4 end-4 text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
          <div>
            <label className="block text-xs text-slate-500 mb-1">{t("homeworkTitle")}</label>
            <input
              name="title"
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">{t("assignedDate")}</label>
              <input
                name="assigned_date"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">{t("homeworkStatus")}</label>
              <select
                name="status"
                required
                defaultValue="completed"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {t(`hw_${s}` as any)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">{t("notes")}</label>
            <textarea
              name="note"
              rows={3}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">{t("attachFile")}</label>
            <input name="file" type="file" className="w-full text-sm" />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button
            type="submit"
            disabled={saving}
            className="self-start flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm px-5 py-2 rounded-lg"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {t("save")}
          </button>
        </form>
      )}

      {!showForm && error && <div className="text-sm text-red-600 mb-3">{error}</div>}

      {entries.length === 0 ? (
        <div className="text-sm text-slate-500">{t("noHomeworkYet")}</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {entries.map((h) =>
            editingId === h.id ? (
              <div key={h.id} className="p-4">
                <HomeworkEditForm entry={h} onDone={() => setEditingId(null)} />
              </div>
            ) : (
            <div key={h.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-800">{h.title}</div>
                  <div className="text-xs text-slate-400">
                    {new Date(h.assigned_date).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB")}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`${HOMEWORK_STATUS_CLASS[h.status]} text-xs px-2.5 py-0.5 rounded-full font-medium`}>
                    {t(`hw_${h.status}` as any)}
                  </span>
                  <button
                    onClick={() => setEditingId(h.id)}
                    className="text-slate-300 hover:text-slate-700"
                    aria-label={t("edit")}
                    title={t("edit")}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(h.id)}
                    className="text-slate-300 hover:text-red-600"
                    aria-label={t("deleteEntry")}
                    title={t("deleteEntry")}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {h.note && <p className="text-sm text-slate-600 mt-1.5 whitespace-pre-line">{h.note}</p>}
              {h.signedUrl && (
                <a
                  href={h.signedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline mt-2"
                >
                  <FileText size={14} /> {h.documents?.file_name ?? t("download")}
                </a>
              )}
            </div>
          )
          )}
        </div>
      )}
    </div>
  );
}
