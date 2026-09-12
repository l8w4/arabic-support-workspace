"use client";
import { BookOpen } from "lucide-react";
import { useLang } from "@/lib/i18n/context";

export default function PrepPage() {
  const { t } = useLang();
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-5">{t("prep")}</h1>
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-lg">
        <BookOpen className="mx-auto mb-3 text-slate-300" size={32} />
        <div className="font-medium text-slate-700 mb-1">{t("comingSoonTitle")}</div>
        <p className="text-sm text-slate-500">{t("comingSoonPrep")}</p>
      </div>
    </div>
  );
}
