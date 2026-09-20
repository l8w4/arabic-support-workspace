"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n/context";
import { HOMEWORK_STATUSES } from "@/lib/homework";
import type { HomeworkEntry } from "@/lib/types";
import { updateHomeworkEntry } from "@/app/(app)/homework/actions";

export default function HomeworkEditForm({
  entry,
  onDone,
}: {
  entry: Pick<HomeworkEntry, "id" | "title" | "assigned_date" | "status" | "note">;
  onDone: () => void;
}) {
  const { t } = useLang();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    setError("");
    const result = await updateHomeworkEntry(entry.id, formData);
    setSaving(false);
    if (result.success) onDone();
    else setError(result.error ?? t("saveError"));
  }

  const input =
    "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600";

  return (
    <form action={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="sm:col-span-1">
          <label className="block text-xs text-slate-500 mb-1">{t("homeworkTitle")}</label>
          <input name="title" required defaultValue={entry.title} className={input} />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">{t("assignedDate")}</label>
          <input name="assigned_date" type="date" defaultValue={entry.assigned_date} className={input} />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">{t("homeworkStatus")}</label>
          <select name="status" defaultValue={entry.status} className={input}>
            {HOMEWORK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`hw_${s}` as any)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs text-slate-500 mb-1">{t("notes")}</label>
        <textarea name="note" rows={2} defaultValue={entry.note ?? ""} className={input} />
      </div>
      {error && (
        <div className="text-sm text-red-600" dir="ltr">
          {error}
        </div>
      )}
      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm px-4 py-2 rounded-lg"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          {t("save")}
        </button>
        <button type="button" onClick={onDone} className="text-sm text-slate-500 hover:text-slate-700 px-2 py-2">
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}
