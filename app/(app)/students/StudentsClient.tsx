"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Search, User } from "lucide-react";
import { useLang } from "@/lib/i18n/context";
import type { Student } from "@/lib/types";

export default function StudentsClient({ students }: { students: (Student & { photoUrl: string | null })[] }) {
  const { t } = useLang();
  const [query, setQuery] = useState("");

  const filtered = students.filter((s) =>
    [s.name_ar, s.name_en ?? "", s.student_code ?? ""].join(" ").toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-slate-900">{t("students")}</h1>
        <div className="flex items-center gap-2">
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
