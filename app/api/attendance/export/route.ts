import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const STATUS_LABELS_AR: Record<string, string> = {
  present: "حاضر",
  absent: "غائب",
  excused: "مستأذن",
  truant: "هارب",
  late: "متأخر",
};

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

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const { data: rows } = await supabase
    .from("attendance")
    .select("attend_date, status, note, students(name_ar)")
    .eq("class_id", classId)
    .order("attend_date", { ascending: true });

  const header = ["Date", "Student", "Status", "Note"].join(",");
  const lines = (
    (rows as unknown as { attend_date: string; status: string; note: string | null; students: { name_ar: string } | null }[]) ??
    []
  ).map((r) =>
    [r.attend_date, escapeCsv(r.students?.name_ar ?? ""), STATUS_LABELS_AR[r.status] ?? r.status, escapeCsv(r.note ?? "")].join(
      ","
    )
  );

  const csv = "﻿" + [header, ...lines].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="attendance-export.csv"`,
    },
  });
}
