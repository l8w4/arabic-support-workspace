"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Trash2, Pencil } from "lucide-react";
import { useLang } from "@/lib/i18n/context";
import MarkEditForm from "@/components/MarkEditForm";
import { percentOf } from "@/lib/grades";
import type { Class } from "@/lib/types";
import { saveMarksForClass, deleteMarkFromList } from "./actions";
import type { MarkListRow } from "./page";

export default function MarksClient({
  classes,
  classId,
  roster,
  entries,
}: {
  classes: Class[];
  classId: string;
  roster: { id: string; name_ar: string }[];
  entries: MarkListRow[];
}) {
  const { t, lang } = useLang();
  const router = useRouter();
  const [formKey, setFormKey] = useState(0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [listError, setListError] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  function goTo(nextClassId: string) {
    setSaveState("idle");
    router.push(`/marks?class=${nextClassId || "all"}`);
  }

  async function handleSubmit(formData: FormData) {
    setSaveState("saving");
    setErrorText("");
    const result = await saveMarksForClass(formData);
    if (result.success) {
      setSaveState("saved");
      setFormKey((k) => k + 1);
      router.refresh();
    } else {
      setSaveState("error");
      setErrorText(result.error ?? "");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t("confirmDeleteEntry"))) return;
    setListError("");
    const result = await deleteMarkFromList(id);
    if (!result.success) setListError(result.error ?? t("saveError"));
  }

  const fmt = (d: string) => new Date(d).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB");

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-slate-900">{t("studentGrades")}</h1>
        <select
          value={classId}
          onChange={(e) => goTo(e.target.value)}
          className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="">{t("allClasses")}</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name_ar}
            </option>
          ))}
        </select>
      </div>

      {!classId ? (
        <div className="text-sm text-slate-500 mb-6">{t("pickClassToRecord")}</div>
      ) : roster.length === 0 ? (
        <div className="text-sm text-slate-500 mb-6">{t("noStudentsInClass")}</div>
      ) : (
        <form key={formKey} action={handleSubmit} className="max-w-2xl mb-8">
          <div className="text-sm font-medium text-slate-800 mb-3">{t("recordForClass")}</div>
          <div className="grid grid-cols-3 gap-3 mb-3">
            <div className="col-span-3 sm:col-span-1">
              <label className="block text-xs text-slate-500 mb-1">{t("gradeTitle")}</label>
              <input
                name="title"
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

          <div className="text-xs text-slate-400 mb-2">{t("blankMarkSkipped")}</div>

          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
            {roster.map((s) => (
              <div key={s.id} className="p-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="text-sm text-slate-800 font-medium min-w-[110px] flex-1">{s.name_ar}</div>
                <input
                  name={`score_${s.id}`}
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder={t("gradeScore")}
                  className="w-24 border border-slate-300 rounded-lg px-2.5 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input
                  name={`note_${s.id}`}
                  placeholder={t("optionalNote")}
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 w-40 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={saveState === "saving"}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm px-5 py-2 rounded-lg"
            >
              {saveState === "saving" && <Loader2 size={14} className="animate-spin" />}
              {t("save")}
            </button>
            {saveState === "saved" && (
              <span className="flex items-center gap-1 text-sm text-green-700">
                <CheckCircle2 size={15} /> {t("savedConfirm")}
              </span>
            )}
            {saveState === "error" && (
              <span className="text-sm text-red-600" dir="ltr">
                {t("saveError")}
                {errorText ? `: ${errorText}` : ""}
              </span>
            )}
          </div>
        </form>
      )}

      <div className="text-sm font-medium text-slate-800 mb-3">{t("recentEntries")}</div>
      {listError && (
        <div className="text-sm text-red-600 mb-3" dir="ltr">
          {listError}
        </div>
      )}
      {entries.length === 0 ? (
        <div className="text-sm text-slate-500">{t("noGradesYet")}</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-400">
                <th className="p-3 font-medium text-start">{t("assessedDate")}</th>
                <th className="p-3 font-medium text-start">{t("forStudent")}</th>
                <th className="p-3 font-medium text-start">{t("gradeTitle")}</th>
                <th className="p-3 font-medium text-start">{t("gradeScore")}</th>
                <th className="p-3 font-medium text-start">{t("notes")}</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((e) =>
                editingId === e.id ? (
                  <tr key={e.id} className="bg-slate-50">
                    <td colSpan={6} className="p-4">
                      <MarkEditForm entry={e} onDone={() => setEditingId(null)} />
                    </td>
                  </tr>
                ) : (
                <tr key={e.id} className="align-top hover:bg-slate-50">
                  <td className="p-3 text-slate-600 whitespace-nowrap">{fmt(e.assessed_date)}</td>
                  <td className="p-3">
                    <Link href={`/students/${e.student_id}`} className="text-blue-600 hover:underline">
                      {e.students?.name_ar ?? "—"}
                    </Link>
                  </td>
                  <td className="p-3 text-slate-800">{e.title}</td>
                  <td className="p-3 text-slate-800 whitespace-nowrap" dir="ltr">
                    {Number(e.score)} / {Number(e.max_score)}{" "}
                    <span className="text-xs text-slate-400">({percentOf(e)}%)</span>
                  </td>
                  <td className="p-3 text-slate-500">{e.note ?? ""}</td>
                  <td className="p-3 whitespace-nowrap">
                    <button
                      onClick={() => setEditingId(e.id)}
                      className="text-slate-300 hover:text-slate-700 me-3"
                      aria-label={t("edit")}
                      title={t("edit")}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="text-slate-300 hover:text-red-600"
                      aria-label={t("deleteEntry")}
                      title={t("deleteEntry")}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
