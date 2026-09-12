"use client";

import Link from "next/link";
import { Users, FileText } from "lucide-react";
import { useLang } from "@/lib/i18n/context";
import type { DocumentRow } from "@/lib/types";

function StatCard({ icon: Icon, label, value }: { icon: any; label: string; value: number }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 flex-1 min-w-[160px]">
      <div className="flex items-center gap-2 text-slate-500 text-sm mb-2">
        <Icon size={16} />
        {label}
      </div>
      <div className="text-3xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

export default function HomeClient({
  studentCount,
  fileCount,
  recentDocs,
}: {
  studentCount: number;
  fileCount: number;
  recentDocs: DocumentRow[];
}) {
  const { t, lang } = useLang();

  return (
    <div className="max-w-4xl">
      <h1 className="text-xl font-semibold text-slate-900 mb-5">{t("home")}</h1>

      <div className="flex gap-4 flex-wrap mb-6">
        <StatCard icon={Users} label={t("totalStudents")} value={studentCount} />
        <StatCard icon={FileText} label={t("totalFiles")} value={fileCount} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <div className="font-medium text-slate-900 mb-3">{t("recentUploads")}</div>
        {recentDocs.length === 0 ? (
          <div className="text-sm text-slate-500">{t("noUploadsYet")}</div>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100">
            {recentDocs.map((d) => (
              <div key={d.id} className="py-2.5 flex items-center justify-between text-sm">
                <div>
                  <div className="text-slate-800">{d.title}</div>
                  <div className="text-xs text-slate-400">
                    {d.students?.name_ar ? d.students.name_ar + " · " : ""}
                    {new Date(d.uploaded_at).toLocaleString(lang === "ar" ? "ar-EG" : "en-GB")}
                  </div>
                </div>
                <span className="text-xs text-slate-500">{d.profiles?.full_name_ar}</span>
              </div>
            ))}
          </div>
        )}
        <Link href="/files" className="inline-block mt-3 text-sm text-blue-600 hover:underline">
          {t("files")} →
        </Link>
      </div>
    </div>
  );
}
