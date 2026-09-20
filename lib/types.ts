export type Student = {
  id: string;
  name_ar: string;
  name_en: string | null;
  student_code: string | null;
  grade: string | null;
  diagnostic_level: string | null;
  photo_path: string | null;
  guardian_name: string | null;
  guardian_phone: string | null;
  second_contact: string | null;
  general_notes: string | null;
  health_status: string | null;
  status: "active" | "archived";
  created_at: string;
};

export type HomeworkStatus = "completed" | "partial" | "needs_support" | "not_done";

export type HomeworkEntry = {
  id: string;
  student_id: string;
  title: string;
  assigned_date: string;
  status: HomeworkStatus;
  note: string | null;
  document_id: string | null;
  created_at: string;
  // joined for display
  documents?: { file_name: string; file_path: string } | null;
};

export type GradeEntry = {
  id: string;
  student_id: string;
  title: string;
  assessed_date: string;
  score: number;
  max_score: number;
  note: string | null;
  created_at: string;
};

export type Class = {
  id: string;
  name_ar: string;
  academic_year: string;
  is_active: boolean;
  created_at: string;
};

export type Prep = {
  id: string;
  class_id: string;
  week_start: string;
  week_end: string;
  unit: string | null;
  lesson_title: string | null;
  document_path: string | null;
  created_at: string;
  // joined for display
  classes?: { name_ar: string } | null;
};

export type AttendanceStatus = "present" | "absent" | "excused" | "truant" | "late";

export type AttendanceRow = {
  id: string;
  class_id: string;
  student_id: string;
  attend_date: string;
  status: AttendanceStatus;
  note: string | null;
};

export type ProgressRating = "great" | "noticeable" | "slight" | "none";
export type PlanStatus = "draft" | "active" | "under_review" | "completed";

export type Plan = {
  id: string;
  student_id: string;
  term: string | null;
  starts_on: string | null;
  ends_on: string | null;
  general_objectives: string | null;
  coordinator_name: string | null;
  progress_rating: ProgressRating | null;
  review_on: string | null;
  status: PlanStatus;
  document_path: string | null;
  final_report: string | null;
  created_at: string;
  updated_at: string;
  // joined for display
  students?: { name_ar: string } | null;
};

export type PlanReview = {
  id: string;
  plan_id: string;
  reviewed_on: string;
  progress_rating: ProgressRating;
  notes: string | null;
  reviewed_by: string | null;
  created_at: string;
  // joined for display
  profiles?: { full_name_ar: string } | null;
};

export type DocType = "worksheet" | "consent" | "report" | "photo" | "plan" | "prep" | "other";

export type DocumentRow = {
  id: string;
  title: string;
  doc_type: DocType;
  student_id: string | null;
  class_id: string | null;
  file_path: string;
  file_name: string;
  mime_type: string | null;
  size_bytes: number | null;
  notes: string | null;
  uploaded_by: string | null;
  uploaded_at: string;
  // joined for display
  students?: { name_ar: string } | null;
  profiles?: { full_name_ar: string } | null;
};
