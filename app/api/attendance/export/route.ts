import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const STATUS_LABELS_AR: Record<string, string> = {
  present: "حاضر",
  absent: "غائب",
  excused: "مستأذن",
  truant: "هارب",
  late: "متأخر",
};

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function escapeCsv(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(request: NextRequest) {
  const classId = request.nextUrl.searchParams.get("class_id");
  if (!classId) {
    return NextResponse.json({ error: "class_id is required" }, { status: 400 });
  }

  const fromParam = request.nextUrl.searchParams.get("from");
  const toParam = request.nextUrl.searchParams.get("to");
  const from = fromParam && DATE_RE.test(fromParam) ? fromParam : null;
  const to = toParam && DATE_RE.test(toParam) ? toParam : null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  let attendanceQuery = supabase
    .from("attendance")
    .select("attend_date, student_id, status, note, students(name_ar)")
    .eq("class_id", classId);
  if (from) attendanceQuery = attendanceQuery.gte("attend_date", from);
  if (to) attendanceQuery = attendanceQuery.lte("attend_date", to);

  const [{ data: saved }, { data: enrollments }] = await Promise.all([
    attendanceQuery,
    supabase
      .from("class_students")
      .select("student_id, joined_on, left_on, students(name_ar)")
      .eq("class_id", classId),
  ]);

  type Row = { date: string; name: string; status: string; note: string };
  const savedRows = (saved as unknown as {
    attend_date: string;
    student_id: string;
    status: string;
    note: string | null;
    students: { name_ar: string } | null;
  }[]) ?? [];
  const enrolled = (enrollments as unknown as {
    student_id: string;
    joined_on: string;
    left_on: string | null;
    students: { name_ar: string } | null;
  }[]) ?? [];

  // The attendance screen shows every enrolled student as "present" until
  // saved, so an untouched day means everyone attended. Every day in the
  // period is exported: saved rows as-is, everyone else as present. Fridays
  // and Saturdays (Qatar weekend) are skipped unless something was saved.
  const rows: Row[] = [];
  const savedKeys = new Set<string>();
  const dates = new Set<string>();

  for (const r of savedRows) {
    savedKeys.add(`${r.attend_date}:${r.student_id}`);
    dates.add(r.attend_date);
    rows.push({ date: r.attend_date, name: r.students?.name_ar ?? "", status: r.status, note: r.note ?? "" });
  }

  const today = new Date(Date.now() + 3 * 3600 * 1000).toISOString().slice(0, 10);
  const earliest = [...savedRows.map((r) => r.attend_date), ...enrolled.map((e) => e.joined_on)].sort()[0];
  const start = from ?? earliest;
  const end = to && to < today ? to : today;

  if (start) {
    const cursor = new Date(`${start}T00:00:00Z`);
    const last = new Date(`${end}T00:00:00Z`);
    for (let i = 0; cursor <= last && i < 731; i++) {
      const day = cursor.getUTCDay();
      if (day !== 5 && day !== 6) dates.add(cursor.toISOString().slice(0, 10));
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
  }

  for (const date of dates) {
    for (const e of enrolled) {
      if (savedKeys.has(`${date}:${e.student_id}`)) continue;
      if (e.joined_on > date) continue;
      if (e.left_on && date >= e.left_on) continue;
      rows.push({ date, name: e.students?.name_ar ?? "", status: "present", note: "" });
    }
  }

  rows.sort((a, b) => (a.date === b.date ? a.name.localeCompare(b.name, "ar") : a.date.localeCompare(b.date)));

  const header = ["Date", "Student", "Status", "Note"].join(",");
  const lines = rows.map((r) =>
    [r.date, escapeCsv(r.name), STATUS_LABELS_AR[r.status] ?? r.status, escapeCsv(r.note)].join(",")
  );

  const csv = "﻿" + [header, ...lines].join("\n");
  const suffix = from || to ? `-${from ?? "start"}-to-${to ?? "latest"}` : "";

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="attendance-export${suffix}.csv"`,
    },
  });
}
