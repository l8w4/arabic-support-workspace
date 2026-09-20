"use client";

import Link from "next/link";
import { ArrowRight, ArrowLeft, Printer, User } from "lucide-react";
import { useLang } from "@/lib/i18n/context";
import { HOMEWORK_STATUS_CLASS } from "../HomeworkTab";
import type { AttendanceStatus, Student } from "@/lib/types";
import type { ReportAttendance, ReportHomework, ReportFile } from "./page";

const ATTENDANCE_STATUSES: AttendanceStatus[] = ["present", "absent", "excused", "truant", "late"];

export default function ReportClient({
  student,
  photoUrl,
  attendance,
  homework,
  files,
}: {
  student: Student;
  photoUrl: string | null;
  attendance: ReportAttendance[];
  homework: ReportHomework[];
  files: ReportFile[];
}) {
  const { t, lang } = useLang();
  const BackIcon = lang === "ar" ? ArrowRight : ArrowLeft;
  const locale = lang === "ar" ? "ar-EG" : "en-GB";
  const fmt = (d: string) => new Date(d).toLocaleDateString(locale);

  const counts: Record<AttendanceStatus, number> = { present: 0, absent: 0, excused: 0, truant: 0, late: 0 };
  attendance.forEach((a) => counts[a.status]++);
  const total = attendance.length;
  const attended = counts.present + counts.late;
  const rate = total ? Math.round((attended / total) * 100) : 0;
  const nonPresent = attendance.filter((a) => a.status !== "present");

  return (
    <div>
      <div className="print:hidden flex items-center justify-between flex-wrap gap-3 mb-4 max-w-3xl mx-auto">
        <Link
          href={`/students/${student.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700"
        >
          <BackIcon size={15} /> {t("backToProfile")}
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg"
        >
          <Printer size={15} /> {t("print")}
        </button>
      </div>

      <article className="report max-w-3xl mx-auto bg-white border border-slate-200 rounded-xl p-8 print:border-0 print:p-0 print:max-w-none">
        <header className="flex items-center justify-between gap-4 border-b border-slate-300 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <img src="/logo.jpg" alt="" className="w-16 h-16 object-contain" />
            <div>
              <div className="text-lg font-semibold text-slate-900">{t("studentReport")}</div>
              <div className="text-xs text-slate-500">We Care Support Centre</div>
            </div>
          </div>
          <div className="text-xs text-slate-500 text-end">
            {t("reportDate")}
            <div className="text-sm text-slate-800">{new Date().toLocaleDateString(locale)}</div>
          </div>
        </header>

        <section className="report-section mb-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">{t("personalInfo")}</h2>
          <div className="flex gap-5 items-start">
            {photoUrl ? (
              <img src={photoUrl} alt="" className="w-24 h-24 rounded-lg object-cover border border-slate-200 shrink-0" />
            ) : (
              <div className="w-24 h-24 rounded-lg bg-slate-100 text-slate-300 flex items-center justify-center shrink-0">
                <User size={32} />
              </div>
            )}
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm flex-1">
              <Item label={t("studentNameAr")} value={student.name_ar} />
              <Item label={t("studentNameEn")} value={student.name_en} />
              <Item label={t("studentCode")} value={student.student_code} />
              <Item label={t("grade")} value={student.grade} />
              <Item label={t("diagnosticLevel")} value={student.diagnostic_level} />
              <Item label={t("guardianName")} value={student.guardian_name} />
              <Item label={t("guardianPhone")} value={student.guardian_phone} />
              <div className="col-span-2">
                <Item label={t("healthStatus")} value={student.health_status} />
              </div>
              <div className="col-span-2">
                <Item label={t("generalNotes")} value={student.general_notes} />
              </div>
            </dl>
          </div>
        </section>

        <section className="report-section mb-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">{t("attendanceSummary")}</h2>
          {total === 0 ? (
            <div className="text-sm text-slate-500">{t("noAttendanceYet")}</div>
          ) : (
            <>
              <div className="flex flex-wrap gap-2 mb-2">
                {ATTENDANCE_STATUSES.map((st) => (
                  <span key={st} className={`status-${st} text-xs px-2.5 py-1 rounded-full`}>
                    {t(`status_${st}` as any)}: <strong>{counts[st]}</strong>
                  </span>
                ))}
              </div>
              <div className="text-sm text-slate-700">
                {t("daysRecorded")}: <strong>{total}</strong> · {t("attendanceRate")}: <strong>{rate}%</strong>
              </div>
              <div className="text-xs text-slate-400 mt-0.5">{t("attendanceBasis")}</div>

              {nonPresent.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs font-medium text-slate-500 mb-1.5">{t("nonPresentDays")}</div>
                  <table className="w-full text-sm">
                    <tbody>
                      {nonPresent.map((a, i) => (
                        <tr key={i} className="border-b border-slate-100 align-top">
                          <td className="py-1.5 pe-3 text-slate-700 whitespace-nowrap">{fmt(a.attend_date)}</td>
                          <td className="py-1.5 pe-3 text-slate-500">{a.classes?.name_ar ?? ""}</td>
                          <td className="py-1.5 pe-3">
                            <span className={`status-${a.status} text-xs px-2 py-0.5 rounded-full`}>
                              {t(`status_${a.status}` as any)}
                            </span>
                          </td>
                          <td className="py-1.5 text-slate-500">{a.note ?? ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>

        <section className="report-section mb-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">{t("homeworkRecord")}</h2>
          {homework.length === 0 ? (
            <div className="text-sm text-slate-500">{t("noHomeworkYet")}</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-300 text-xs text-slate-500">
                  <th className="py-1.5 pe-3 font-medium text-start">{t("assignedDate")}</th>
                  <th className="py-1.5 pe-3 font-medium text-start">{t("homeworkTitle")}</th>
                  <th className="py-1.5 pe-3 font-medium text-start">{t("homeworkStatus")}</th>
                  <th className="py-1.5 font-medium text-start">{t("notes")}</th>
                </tr>
              </thead>
              <tbody>
                {homework.map((h) => (
                  <tr key={h.id} className="border-b border-slate-100 align-top">
                    <td className="py-1.5 pe-3 text-slate-700 whitespace-nowrap">{fmt(h.assigned_date)}</td>
                    <td className="py-1.5 pe-3 text-slate-800">{h.title}</td>
                    <td className="py-1.5 pe-3">
                      <span className={`${HOMEWORK_STATUS_CLASS[h.status]} text-xs px-2 py-0.5 rounded-full`}>
                        {t(`hw_${h.status}` as any)}
                      </span>
                    </td>
                    <td className="py-1.5 text-slate-500 whitespace-pre-line">{h.note ?? ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="report-section">
          <h2 className="text-sm font-semibold text-slate-900 mb-3">{t("uploadedFiles")}</h2>
          {files.length === 0 ? (
            <div className="text-sm text-slate-500">{t("noUploadsYet")}</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-300 text-xs text-slate-500">
                  <th className="py-1.5 pe-3 font-medium text-start">{t("fileTitle")}</th>
                  <th className="py-1.5 pe-3 font-medium text-start">{t("fileType")}</th>
                  <th className="py-1.5 font-medium text-start">{t("uploadedOn")}</th>
                </tr>
              </thead>
              <tbody>
                {files.map((f) => (
                  <tr key={f.id} className="border-b border-slate-100">
                    <td className="py-1.5 pe-3 text-slate-800">{f.title}</td>
                    <td className="py-1.5 pe-3 text-slate-500">{t(`docType_${f.doc_type}` as any)}</td>
                    <td className="py-1.5 text-slate-500 whitespace-nowrap">{fmt(f.uploaded_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </article>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs text-slate-400">{label}</dt>
      <dd className="text-slate-800 whitespace-pre-line">{value || "—"}</dd>
    </div>
  );
}
