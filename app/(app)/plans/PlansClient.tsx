"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, AlertTriangle } from "lucide-react";
import { useLang } from "@/lib/i18n/context";
import ProgressBadge from "@/components/ProgressBadge";
import type { Plan, PlanStatus, Student } from "@/lib/types";

const STATUSES: PlanStatus[] = ["draft", "active", "under_review", "completed"];

function isOverdue(plan: Plan) {
  if (!plan.review_on || plan.status === "completed") return false;
  return plan.review_on < new Date().toISOString().slice(0, 10);
}

export default function PlansClient({
  plans,
  students,
}: {
  plans: Plan[];
  students: Pick<Student, "id" | "name_ar">[];
}) {
  const { t, lang } = useLang();
  const [studentFilter, setStudentFilter] = useState("all");
  const [termFilter, setTermFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const terms = useMemo(
    () => Array.from(new Set(plans.map((p) => p.term).filter(Boolean))) as string[],
    [plans]
  );

  const filtered = plans.filter(
    (p) =>
      (studentFilter === "all" || p.student_id === studentFilter) &&
      (termFilter === "all" || p.term === termFilter) &&
      (statusFilter === "all" || p.status === statusFilter)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-slate-900">{t("plans")}</h1>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={studentFilter}
            onChange={(e) => setStudentFilter(e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">{t("allStudents")}</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name_ar}
              </option>
            ))}
          </select>
          {terms.length > 0 && (
            <select
              value={termFilter}
              onChange={(e) => setTermFilter(e.target.value)}
              className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">{t("allTerms")}</option>
              {terms.map((term) => (
                <option key={term} value={term}>
                  {term}
                </option>
              ))}
            </select>
          )}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="all">{t("allStatuses")}</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {t(`planStatus_${s}` as any)}
              </option>
            ))}
          </select>
          <Link
            href="/plans/new"
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-3.5 py-2 rounded-lg"
          >
            <Plus size={16} /> {t("addPlan")}
          </Link>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-sm text-slate-500">{t("noPlansYet")}</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-start text-xs text-slate-400">
                <th className="p-3 font-medium text-start">{t("forStudent")}</th>
                <th className="p-3 font-medium text-start">{t("planTerm")}</th>
                <th className="p-3 font-medium text-start">{t("planStatus")}</th>
                <th className="p-3 font-medium text-start">{t("progressRating")}</th>
                <th className="p-3 font-medium text-start">{t("planReviewOn")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((p) => {
                const overdue = isOverdue(p);
                return (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <Link href={`/plans/${p.id}`} className="text-blue-600 hover:underline font-medium">
                        {p.students?.name_ar ?? "—"}
                      </Link>
                    </td>
                    <td className="p-3 text-slate-600">{p.term || "—"}</td>
                    <td className="p-3 text-slate-600">{t(`planStatus_${p.status}` as any)}</td>
                    <td className="p-3">
                      <ProgressBadge rating={p.progress_rating} />
                    </td>
                    <td className="p-3">
                      {p.review_on ? (
                        <span
                          className={`inline-flex items-center gap-1 ${overdue ? "text-red-600 font-medium" : "text-slate-600"}`}
                        >
                          {overdue && <AlertTriangle size={13} />}
                          {new Date(p.review_on).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB")}
                          {overdue && ` · ${t("planOverdue")}`}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
