"use client";

import { useState } from "react";
import { Plus, X, Trash2, Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n/context";
import type { GradeEntry } from "@/lib/types";
import { percentOf, averagePercent } from "@/lib/grades";
import { addGradeEntry, deleteGradeEntry } from "../actions";

export default function GradesTab({ studentId, entries }: { studentId: string; entries: GradeEntry[] }) {
  const { t, lang } = useLang();
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const average = averagePercent(entries);

  async function handleAdd(formData: FormData) {
    setError("");
    setSaving(true);
    const result = await addGradeEntry(studentId, formData);
    setSaving(false);
    if (result.success) setShowForm(false);
    else setError(result.error ?? t("saveError"));
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t("confirmDeleteEntry"))) return;
    const result = await deleteGradeEntry(id, studentId);
    if (!result.success) setError(t("saveError"));
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3.5 py-2 rounded-lg"
        >
          <Plus size={16} /> {t("addGrade")}
        </button>
        {average !== null && (
          <div className="text-sm text-slate-600">
            {t("assessmentsCount")}: <strong>{entries.length}</strong> · {t("averageMark")}: <strong>{average}%</strong>
          </div>
        )}
      </div>

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
            <label className="block text-xs text-slate-500 mb-1">{t("gradeTitle")}</label>
            <input
              name="title"
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">{t("gradeScore")}</label>
              <input
                name="score"
                type="number"
                step="0.01"
                min="0"
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">{t("gradeOutOf")}</label>
              <input
                name="max_score"
                type="number"
                step="0.01"
                min="0.01"
                defaultValue={100}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">{t("assessedDate")}</label>
              <input
                name="assessed_date"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">{t("notes")}</label>
            <textarea
              name="note"
              rows={2}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          {error && (
            <div className="text-sm text-red-600" dir="ltr">
              {error}
            </div>
          )}
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
        <div className="text-sm text-slate-500">{t("noGradesYet")}</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {entries.map((g) => (
            <div key={g.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-medium text-slate-800">{g.title}</div>
                  <div className="text-xs text-slate-400">
                    {new Date(g.assessed_date).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB")}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-end">
                    <div className="text-sm font-semibold text-slate-900" dir="ltr">
                      {Number(g.score)} / {Number(g.max_score)}
                    </div>
                    <div className="text-xs text-slate-500" dir="ltr">
                      {percentOf(g)}%
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(g.id)}
                    className="text-slate-300 hover:text-red-600"
                    aria-label={t("deleteEntry")}
                    title={t("deleteEntry")}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              {g.note && <p className="text-sm text-slate-600 mt-1.5 whitespace-pre-line">{g.note}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
