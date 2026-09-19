"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, FileCheck2, Footprints, Clock3, Download, CheckCheck, Loader2 } from "lucide-react";
import { useLang } from "@/lib/i18n/context";
import type { AttendanceRow, AttendanceStatus, Class, Student } from "@/lib/types";
import { saveAttendance } from "./actions";

const STATUSES: AttendanceStatus[] = ["present", "absent", "excused", "truant", "late"];

const STATUS_ICONS: Record<AttendanceStatus, typeof CheckCircle2> = {
  present: CheckCircle2,
  absent: XCircle,
  excused: FileCheck2,
  truant: Footprints,
  late: Clock3,
};

// Matches the text tones of the .status-* classes in globals.css, used here
// only for a row's left accent border (applying the full class would tint
// the whole row's background instead).
const STATUS_BORDER_COLORS: Record<AttendanceStatus, string> = {
  present: "#166534",
  late: "#854d0e",
  excused: "#92400e",
  absent: "#991b1b",
  truant: "#9d174d",
};

function buildInitialStatuses(roster: Pick<Student, "id" | "name_ar">[], existing: AttendanceRow[]) {
  const byStudent: Record<string, AttendanceRow> = {};
  existing.forEach((row) => (byStudent[row.student_id] = row));
  const initial: Record<string, AttendanceStatus> = {};
  roster.forEach((s) => (initial[s.id] = byStudent[s.id]?.status ?? "present"));
  return initial;
}

function buildInitialNotes(roster: Pick<Student, "id" | "name_ar">[], existing: AttendanceRow[]) {
  const byStudent: Record<string, AttendanceRow> = {};
  existing.forEach((row) => (byStudent[row.student_id] = row));
  const initial: Record<string, string> = {};
  roster.forEach((s) => (initial[s.id] = byStudent[s.id]?.note ?? ""));
  return initial;
}

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
  const { t, lang } = useLang();
  const router = useRouter();

  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>(() => buildInitialStatuses(roster, existing));
  const [notes, setNotes] = useState<Record<string, string>>(() => buildInitialNotes(roster, existing));
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  // The class/date picker navigates without remounting this component, so
  // local state has to be re-derived from fresh props whenever they change
  // (otherwise stale selections from a previous class/date would linger).
  useEffect(() => {
    setStatuses(buildInitialStatuses(roster, existing));
    setNotes(buildInitialNotes(roster, existing));
    setSaveState("idle");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, date, roster, existing]);

  const [exportFrom, setExportFrom] = useState("");
  const [exportTo, setExportTo] = useState("");

  const exportParams = new URLSearchParams({ class_id: classId });
  if (exportFrom) exportParams.set("from", exportFrom);
  if (exportTo) exportParams.set("to", exportTo);
  const exportHref = `/api/attendance/export?${exportParams.toString()}`;

  const selectedClass = classes.find((c) => c.id === classId);

  const tally = useMemo(() => {
    const counts: Record<AttendanceStatus, number> = { present: 0, absent: 0, excused: 0, truant: 0, late: 0 };
    roster.forEach((s) => counts[statuses[s.id]]++);
    return counts;
  }, [roster, statuses]);

  function goTo(nextClassId: string, nextDate: string) {
    const params = new URLSearchParams();
    if (nextClassId) params.set("class_id", nextClassId);
    if (nextDate) params.set("date", nextDate);
    router.push(`/attendance?${params.toString()}`);
  }

  function markAllPresent() {
    const next: Record<string, AttendanceStatus> = {};
    roster.forEach((s) => (next[s.id] = "present"));
    setStatuses(next);
  }

  async function handleSubmit(formData: FormData) {
    setSaveState("saving");
    const result = await saveAttendance(classId, date, formData);
    setSaveState(result?.success ? "saved" : "error");
    router.refresh();
  }

  const ready = classId && date;

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h1 className="text-xl font-semibold text-slate-900">{t("attendance")}</h1>
        <div className="flex items-center gap-2 flex-wrap">
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

      {classId && (
        <div className="flex items-center gap-2 flex-wrap mb-5 text-sm">
          <span className="text-xs text-slate-500">{t("downloadAttendance")}:</span>
          <label className="flex items-center gap-1.5 text-xs text-slate-500">
            {t("weekStart")}
            <input
              type="date"
              value={exportFrom}
              onChange={(e) => setExportFrom(e.target.value)}
              className="text-sm border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </label>
          <label className="flex items-center gap-1.5 text-xs text-slate-500">
            {t("weekEnd")}
            <input
              type="date"
              value={exportTo}
              onChange={(e) => setExportTo(e.target.value)}
              className="text-sm border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </label>
          <a
            href={exportHref}
            className="flex items-center gap-1.5 text-sm border border-slate-300 text-slate-600 hover:bg-slate-50 px-3 py-1.5 rounded-lg"
          >
            <Download size={15} /> CSV
          </a>
          <span className="text-xs text-slate-400">{t("exportHint")}</span>
        </div>
      )}

      {!ready ? (
        <div className="text-sm text-slate-500">{t("pickClassToStart")}</div>
      ) : roster.length === 0 ? (
        <div className="text-sm text-slate-500">{t("noStudentsInClass")}</div>
      ) : (
        <form action={handleSubmit} className="max-w-2xl">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
            <div className="text-sm text-slate-500">
              {t("markingFor")} <span className="font-medium text-slate-800">{selectedClass?.name_ar}</span> ·{" "}
              {new Date(date).toLocaleDateString(lang === "ar" ? "ar-EG" : "en-GB", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </div>
            <button
              type="button"
              onClick={markAllPresent}
              className="flex items-center gap-1.5 text-xs text-blue-700 hover:bg-blue-50 border border-blue-200 px-2.5 py-1.5 rounded-full"
            >
              <CheckCheck size={13} /> {t("markAllPresent")}
            </button>
          </div>

          <div className="flex items-center gap-3 flex-wrap mb-3 text-xs text-slate-500">
            {STATUSES.map((st) => (
              <span key={st} className="inline-flex items-center gap-1">
                <span className={`status-${st} w-2 h-2 rounded-full inline-block`} />
                {t(`status_${st}` as any)} · {tally[st]}
              </span>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
            {roster.map((s) => {
              const current = statuses[s.id];
              return (
                <div
                  key={s.id}
                  className="border-s-4 p-4 flex items-center justify-between gap-3 flex-wrap bg-white"
                  style={{ borderInlineStartColor: STATUS_BORDER_COLORS[current] }}
                >
                  <div className="text-sm text-slate-800 font-medium min-w-[110px]">{s.name_ar}</div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {STATUSES.map((st) => {
                      const Icon = STATUS_ICONS[st];
                      const active = current === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setStatuses((prev) => ({ ...prev, [s.id]: st }))}
                          className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-full border transition-colors ${
                            active
                              ? `status-${st} border-transparent font-medium ring-2 ring-offset-1 ring-current`
                              : "border-slate-200 text-slate-400 hover:bg-slate-50"
                          }`}
                        >
                          <Icon size={13} /> {t(`status_${st}` as any)}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    value={notes[s.id] ?? ""}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [s.id]: e.target.value }))}
                    placeholder={t("optionalNote")}
                    className="text-xs border border-slate-200 rounded-lg px-2.5 py-1.5 w-40 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
                  />
                  <input type="hidden" name={`status_${s.id}`} value={current} />
                  <input type="hidden" name={`note_${s.id}`} value={notes[s.id] ?? ""} />
                </div>
              );
            })}
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={saveState === "saving"}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm px-5 py-2 rounded-lg"
            >
              {saveState === "saving" && <Loader2 size={14} className="animate-spin" />}
              {t("saveAttendance")}
            </button>
            {saveState === "saved" && (
              <span className="flex items-center gap-1 text-sm text-green-700">
                <CheckCircle2 size={15} /> {t("savedConfirm")}
              </span>
            )}
            {saveState === "error" && <span className="text-sm text-red-600">{t("saveError")}</span>}
          </div>
        </form>
      )}
    </div>
  );
}
