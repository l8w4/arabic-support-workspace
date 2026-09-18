"use client";

import { useState } from "react";
import { Plus, X, Layers } from "lucide-react";
import { useLang } from "@/lib/i18n/context";
import type { Class } from "@/lib/types";
import { createClass, setClassActive } from "./actions";

export default function ClassesClient({ classes }: { classes: Class[] }) {
  const { t } = useLang();
  const [showForm, setShowForm] = useState(false);

  const handleCreate = (formData: FormData) => {
    createClass(formData);
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-slate-900">{t("classes")}</h1>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3.5 py-2 rounded-lg"
        >
          <Plus size={16} /> {t("addClass")}
        </button>
      </div>

      {showForm && (
        <form
          action={handleCreate}
          className="bg-white border border-slate-200 rounded-xl p-5 mb-6 flex flex-col gap-4 max-w-md relative"
        >
          <button
            type="button"
            onClick={() => setShowForm(false)}
            className="absolute top-4 end-4 text-slate-400 hover:text-slate-600"
          >
            <X size={16} />
          </button>
          <div>
            <label className="block text-xs text-slate-500 mb-1">{t("className")}</label>
            <input
              name="name_ar"
              required
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">{t("academicYear")}</label>
            <input
              name="academic_year"
              required
              placeholder="2025/2026"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <button type="submit" className="self-start bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-lg">
            {t("save")}
          </button>
        </form>
      )}

      {classes.length === 0 ? (
        <div className="text-sm text-slate-500">{t("noClassesYet")}</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 max-w-md">
          {classes.map((c) => (
            <div key={c.id} className="p-4 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2.5">
                <Layers size={16} className="text-slate-400" />
                <div>
                  <div className={c.is_active ? "text-slate-800" : "text-slate-400 line-through"}>{c.name_ar}</div>
                  <div className="text-xs text-slate-400">{c.academic_year}</div>
                </div>
              </div>
              <button
                onClick={() => setClassActive(c.id, !c.is_active)}
                className="text-xs text-slate-500 hover:text-slate-700 border border-slate-200 rounded-full px-2.5 py-1"
              >
                {c.is_active ? t("archive") : t("activate")}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
