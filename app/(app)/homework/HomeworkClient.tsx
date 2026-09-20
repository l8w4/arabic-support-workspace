"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCheck, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { useLang } from "@/lib/i18n/context";
import { HOMEWORK_STATUSES, HOMEWORK_STATUS_CLASS } from "@/lib/homework";
import type { Class, HomeworkStatus } from "@/lib/types";
import { saveHomeworkForClass, deleteHomeworkFromList } from "./actions";
import type { HomeworkListRow } from "./page";

export default function HomeworkClient({
  classes,
  classId,
  roster,
  entries,
}: {
  classes: Class[];
  classId: string;
  roster: { id: string; name_ar: string }[];
  entries: HomeworkListRow[];
}) {
  const { t, lang } = useLang();
  const router = useRouter();
  const [statuses, setStatuses] = useState<Record<string, HomeworkStatus | "">>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [formKey, setFormKey] = useState(0);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorText, setErrorText] = useState("");

  function goTo(nextClassId: string) {
    setStatuses({});
    setNotes({});
    setSaveState("idle");
    router.push(`/homework?class=${nextClassId || "all"}`);
  }

  async function handleSubmit(formData: FormData) {
    setSaveState("saving");
    setErrorText("");
    const result = await saveHomeworkForClass(formData);
    if (result.success) {
      setSaveState("saved");
      setStatuses({});
      setNotes({});
      setFormKey((k) => k + 1);
      router.refresh();
    } else {
      setSaveState("error");
      setErrorText(result.error ?? "");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm(t("confirmDeleteEntry"))) return;
    await deleteHomeworkFromList(id);
  }

  const markAllCompleted = () => {
    const next: Record<string, HomeworkStatus> = {};
    roster.forEach((s) => (next[s.id] = "completed"));
    setStatuses(next);
  };

  const fmt = (d: string) => new Date(d).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB");

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-slate-900">{t("studentHomework")}</h1>
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
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">{t("homeworkTitle")}</label>
              <input
                name="title"
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">{t("assignedDate")}</label>
              <input
                name="assigned_date"
                type="date"
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap mb-2">
            <div className="text-xs text-slate-400">{t("blankSkipped")}</div>
            <button
              type="button"
              onClick={markAllCompleted}
              className="flex items-center gap-1.5 text-xs text-blue-700 hover:bg-blue-50 border border-blue-200 px-2.5 py-1.5 rounded-full"
            >
              <CheckCheck size={13} /> {t("markAllCompleted")}
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
            {roster.map((s) => (
              <div key={s.id} className="p-3 flex items-center justify-between gap-3 flex-wrap">
                <div className="text-sm text-slate-800 font-medium min-w-[110px]">{s.name_ar}</div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {HOMEWORK_STATUSES.map((st) => {
                    const active = statuses[s.id] === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatuses((prev) => ({ ...prev, [s.id]: active ? "" : st }))}
                        className={`text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
                          active
                            ? `${HOMEWORK_STATUS_CLASS[st]} border-transparent font-medium ring-2 ring-offset-1 ring-current`
                            : "border-slate-200 text-slate-400 hover:bg-slate-50"
                        }`}
                      >
                        {t(`hw_${st}` as any)}
                      </button>
                    );
                  })}
                </div>
                <input
                  value={notes[s.id] ?? ""}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [s.id]: e.target.value }))}
                  placeholder={t("optionalNote")}
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 w-40 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                {statuses[s.id] && <input type="hidden" name={`status_${s.id}`} value={statuses[s.id]} />}
                <input type="hidden" name={`note_${s.id}`} value={notes[s.id] ?? ""} />
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
      {entries.length === 0 ? (
        <div className="text-sm text-slate-500">{t("noHomeworkYet")}</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs text-slate-400">
                <th className="p-3 font-medium text-start">{t("assignedDate")}</th>
                <th className="p-3 font-medium text-start">{t("forStudent")}</th>
                <th className="p-3 font-medium text-start">{t("homeworkTitle")}</th>
                <th className="p-3 font-medium text-start">{t("homeworkStatus")}</th>
                <th className="p-3 font-medium text-start">{t("notes")}</th>
                <th className="p-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((e) => (
                <tr key={e.id} className="align-top hover:bg-slate-50">
                  <td className="p-3 text-slate-600 whitespace-nowrap">{fmt(e.assigned_date)}</td>
                  <td className="p-3">
                    <Link href={`/students/${e.student_id}`} className="text-blue-600 hover:underline">
                      {e.students?.name_ar ?? "—"}
                    </Link>
                  </td>
                  <td className="p-3 text-slate-800">{e.title}</td>
                  <td className="p-3">
                    <span className={`${HOMEWORK_STATUS_CLASS[e.status]} text-xs px-2 py-0.5 rounded-full`}>
                      {t(`hw_${e.status}` as any)}
                    </span>
                  </td>
                  <td className="p-3 text-slate-500">{e.note ?? ""}</td>
                  <td className="p-3">
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
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
