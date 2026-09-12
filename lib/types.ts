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
  status: "active" | "archived";
  created_at: string;
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
