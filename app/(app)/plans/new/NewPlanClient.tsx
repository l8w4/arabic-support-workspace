"use client";

import { useLang } from "@/lib/i18n/context";
import PlanForm from "@/components/PlanForm";
import type { Student } from "@/lib/types";
import { createPlan } from "../actions";

export default function NewPlanClient({ students }: { students: Pick<Student, "id" | "name_ar">[] }) {
  const { t } = useLang();
  return (
    <div>
      <h1 className="text-xl font-semibold text-slate-900 mb-5">{t("addPlan")}</h1>
      <PlanForm action={createPlan} students={students} />
    </div>
  );
}
