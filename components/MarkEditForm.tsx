"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n/context";
import type { GradeEntry } from "@/lib/types";
import { updateMarkEntry } from "@/app/(app)/marks/actions";

export default function MarkEditForm({
  entry,
  onDone,
}: {
  entry: Pick<GradeEntry, "id" | "title" | "assessed_date" | "score" | "max_score" | "note">;
  onDone: () => void;
}) {
  const { t } = useLang();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setSaving(true);
    setError("");
    const result = await updateMarkEntry(entry.id, formData);
    setSaving(false);
    if (result.success) onDone();
    else setError(result.error ?? t("saveError"));
  }

  const input =
    "w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600";

  return (
    <form action={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="col-span-2 sm:col-span-1">
          <label className="block text-xs text-slate-500 mb-1">{t("gradeTitle")}</label>
          <input name="title" required defaultValue={entry.title} className={input} />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">{t("gradeScore")}</label>
          <input
            name="score"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={Number(entry.score)}
            className={input}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">{t("gradeOutOf")}</label>
          <input
            name="max_score"
            type="number"
            step="0.01"
            min="0.01"
            required
            defaultValue={Number(entry.max_score)}
            className={input}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-500 mb-1">{t("assessedDate")}</label>
          <input name="assessed_date" type="date" defaultValue={entry.assessed_date} className={input} />
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
