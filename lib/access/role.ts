// Client-safe role types/helpers. Kept separate from lib/auth.ts, which
// pulls in the server-only Supabase client (next/headers) via requireProfile
// — importing that from a "use client" component breaks the client bundle.
export type Profile = {
  id: string;
  full_name_ar: string;
  full_name_en: string | null;
  title: string | null;
  role: "admin" | "teacher" | "viewer";
  is_active: boolean;
};

export function canEdit(role: Profile["role"]) {
  return role === "admin" || role === "teacher";
}
