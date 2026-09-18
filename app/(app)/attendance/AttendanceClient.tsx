"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLang } from "@/lib/i18n/context";
import type { AttendanceRow, AttendanceStatus, Class, Student } from "@/lib/types";
import { saveAttendance } from "./actions";

const STATUSES: AttendanceStatus[] = ["present", "absent", "excused", "truant", "late"];

export default function AttendanceClient({
  classes,
  classId,
  date,
  roster,
  existing,
}: {
  classes: Class[];
  classId: string;
  date: string;
  roster: Pick<Student, "id" | "name_ar">[];
  existing: AttendanceRow[];
}) {
  const { t } = useLang();
  const router = useRouter();

  const existingByStudent = useMemo(() => {
    const map: Record<string, AttendanceRow> = {};
    existing.forEach((row) => (map[row.student_id] = row));
    return map;
  }, [existing]);

  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(() => {
    const initial: Record<string, AttendanceStatus> = {};
    roster.forEach((s) => (initial[s.id] = existingByStudent[s.id]?.status ?? "present"));
    return initial;
  });

  function goTo(nextClassId: string, nextDate: string) {
    const params = new URLSearchParams();
    if (nextClassId) params.set("class_id", nextClassId);
    if (nextDate) params.set("date", nextDate);
    router.push(`/attendance?${params.toString()}`);
  }

  const boundSubmit = (formData: FormData) => {
    saveAttendance(classId, date, formData);
  };

  const ready = classId && date;

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-slate-900">{t("attendance")}</h1>
        <div className="flex items-center gap-2">
          <select
            value={classId}
            onChange={(e) => goTo(e.target.value, date)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
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
          <input
            type="date"
            value={date}
            onChange={(e) => goTo(classId, e.target.value)}
            className="text-sm border border-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {!ready ? (
        <div className="text-sm text-slate-500">{t("pickClassToStart")}</div>
      ) : roster.length === 0 ? (
        <div className="text-sm text-slate-500">{t("noStudentsInClass")}</div>
      ) : (
        <form action={boundSubmit} className="max-w-2xl">
          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100">
            {roster.map((s) => (
              <div key={s.id} className="p-4 flex items-center justify-between gap-3 flex-wrap">
                <div className="text-sm text-slate-800 font-medium min-w-[120px]">{s.name_ar}</div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {STATUSES.map((st) => {
                    const active = statuses[s.id] === st;
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setStatuses((prev) => ({ ...prev, [s.id]: st }))}
                        className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                          active ? `status-${st} border-transparent font-medium` : "border-slate-200 text-slate-400 hover:bg-slate-50"
                        }`}
                      >
                        {t(`status_${st}` as any)}
                      </button>
                    );
                  })}
                </div>
                <input
                  name={`note_${s.id}`}
                  defaultValue={existingByStudent[s.id]?.note ?? ""}
                  placeholder={t("notes")}
                  className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 w-40 focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
                <input type="hidden" name={`status_${s.id}`} value={statuses[s.id]} />
              </div>
            ))}
          </div>
          <button
            type="submit"
            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white text-sm px-5 py-2 rounded-lg"
          >
            {t("saveAttendance")}
          </button>
        </form>
      )}
    </div>
  );
}
