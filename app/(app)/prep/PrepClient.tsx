"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, Search } from "lucide-react";
import { useLang } from "@/lib/i18n/context";
import { createClient } from "@/lib/supabase/client";
import type { Prep, Class } from "@/lib/types";

function displayFileName(path: string) {
  const base = path.split("/").pop() ?? path;
  return base.replace(/^\d+-/, "");
}

export default function PrepClient({
  preps,
  classes,
}: {
  preps: (Prep & { signedUrl: string | null })[];
  classes: Class[];
}) {
  const { t, lang } = useLang();
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [classFilter, setClassFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const filtered = preps.filter(
    (p) =>
      (classFilter === "all" || p.class_id === classFilter) &&
      [p.unit ?? "", p.lesson_title ?? ""].join(" ").toLowerCase().includes(query.toLowerCase())
  );

  async function handleUpload(formData: FormData) {
    setError("");
    const file = formData.get("file") as File;
    const classId = formData.get("class_id") as string;
    const weekStart = formData.get("week_start") as string;
    const weekEnd = formData.get("week_end") as string;
    const unit = (formData.get("unit") as string)?.trim() || null;
    const lessonTitle = (formData.get("lesson_title") as string)?.trim() || null;

    if (!file || file.size === 0 || !classId || !weekStart || !weekEnd) {
      setError(lang === "ar" ? "الرجاء اختيار الفصل والأسبوع وملف" : "Please choose a class, week, and file");
      return;
    }

    setUploading(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const path = `prep/${classId}/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabase.storage.from("documents").upload(path, file);
    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const { error: insertError } = await supabase.from("preps").insert({
      class_id: classId,
      week_start: weekStart,
      week_end: weekEnd,
      unit,
      lesson_title: lessonTitle,
      document_path: path,
      created_by: user?.id,
    });

    setUploading(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setShowForm(false);
    router.refresh();
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-slate-900">{t("prep")}</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={15} className="absolute top-2.5 start-3 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchUnitPlaceholder")}
              className="ps-9 pe-3 py-2 text-sm border border-slate-300 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">{t("allClasses")}</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name_ar}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3.5 py-2 rounded-lg"
          >
            <Upload size={16} /> {t("addPrep")}
          </button>
        </div>
      </div>

      {showForm && (
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
            <label className="block text-xs text-slate-500 mb-1">{t("forClass")}</label>
            <select
              name="class_id"
              required
              defaultValue=""
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="" disabled>
                {t("chooseClass")}
              </option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name_ar}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">{t("weekStart")}</label>
              <input
                name="week_start"
                type="date"
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">{t("weekEnd")}</label>
              <input
                name="week_end"
                type="date"
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-slate-500 mb-1">{t("unit")}</label>
              <input
                name="unit"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">{t("lessonTitle")}</label>
              <input
                name="lesson_title"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">{t("chooseFile")}</label>
            <input name="file" type="file" required className="w-full text-sm" />
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

      {filtered.length === 0 ? (
        <div className="text-sm text-slate-500">{t("noPrepYet")}</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
          {filtered.map((p) => (
            <div key={p.id} className="p-4 flex items-center justify-between text-sm flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <FileText size={16} className="text-slate-400 shrink-0" />
                <div>
                  <div className="text-slate-800">
                    {p.lesson_title || p.unit || displayFileName(p.document_path ?? "")}
                  </div>
                  <div className="text-xs text-slate-400">
                    {p.classes?.name_ar ?? "—"} ·{" "}
                    {new Date(p.week_start).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB")} –{" "}
                    {new Date(p.week_end).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB")}
                  </div>
                </div>
              </div>
              {p.signedUrl && (
                <a href={p.signedUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline text-sm">
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
