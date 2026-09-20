"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, User, ArrowUpDown } from "lucide-react";
import { useLang } from "@/lib/i18n/context";
import type { Student } from "@/lib/types";

type StudentCard = Student & { photoUrl: string | null; classNames: string[] };
type SortKey = "name" | "grade" | "diagnostic" | "class" | "recent";

// Text sorts alphabetically (Arabic collation); students with no value go last.
function compareText(a: string, b: string) {
  if (!a && !b) return 0;
  if (!a) return 1;
  if (!b) return -1;
  return a.localeCompare(b, "ar", { numeric: true });
}

const SORTERS: Record<SortKey, (a: StudentCard, b: StudentCard) => number> = {
  name: (a, b) => compareText(a.name_ar, b.name_ar),
  grade: (a, b) => compareText(a.grade ?? "", b.grade ?? "") || compareText(a.name_ar, b.name_ar),
  diagnostic: (a, b) =>
    compareText(a.diagnostic_level ?? "", b.diagnostic_level ?? "") || compareText(a.name_ar, b.name_ar),
  class: (a, b) => compareText(a.classNames[0] ?? "", b.classNames[0] ?? "") || compareText(a.name_ar, b.name_ar),
  recent: (a, b) => b.created_at.localeCompare(a.created_at),
};

export default function StudentsClient({ students }: { students: StudentCard[] }) {
  const { t } = useLang();
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");

  const filtered = students
    .filter((s) =>
      [s.name_ar, s.name_en ?? "", s.student_code ?? ""].join(" ").toLowerCase().includes(query.toLowerCase())
    )
    .sort(SORTERS[sortKey]);

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-slate-900">{t("students")}</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-1.5 text-xs text-slate-500">
            <ArrowUpDown size={14} />
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              className="text-sm text-slate-700 border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              aria-label={t("sortBy")}
            >
              <option value="name">{t("sort_name")}</option>
              <option value="grade">{t("sort_grade")}</option>
              <option value="diagnostic">{t("sort_diagnostic")}</option>
              <option value="class">{t("sort_class")}</option>
              <option value="recent">{t("sort_recent")}</option>
            </select>
          </label>
          <div className="relative">
            <Search size={15} className="absolute top-2.5 start-3 text-slate-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPlaceholder")}
              className="ps-9 pe-3 py-2 text-sm border border-slate-300 rounded-lg w-56 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <Link
            href="/students/new"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3.5 py-2 rounded-lg"
          >
            <Plus size={16} /> {t("addStudent")}
          </Link>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-sm text-slate-500">{t("noStudentsYet")}</div>
      ) : (
        <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
          {filtered.map((s) => (
            <Link
              key={s.id}
              href={`/students/${s.id}`}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:border-blue-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                {s.photoUrl ? (
                  <img
                    src={s.photoUrl}
                    alt={s.name_ar}
                    className="w-12 h-12 rounded-full object-cover shrink-0 border border-slate-200"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-300 flex items-center justify-center shrink-0">
                    <User size={20} />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-medium text-slate-900 truncate">
                    {s.name_ar}
                    {s.name_en ? ` · ${s.name_en}` : ""}
                  </div>
                  <div className="text-xs text-slate-400">{s.student_code || "—"}</div>
                </div>
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {s.classNames.map((cn) => (
                  <span key={cn} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                    {cn}
                  </span>
                ))}
                {s.grade && (
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{s.grade}</span>
                )}
                {s.diagnostic_level && (
                  <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                    {s.diagnostic_level}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
