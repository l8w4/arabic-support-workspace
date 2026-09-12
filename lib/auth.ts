import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type Profile = {
  id: string;
  full_name_ar: string;
  full_name_en: string | null;
  title: string | null;
  role: "admin" | "teacher" | "viewer";
  is_active: boolean;
};

// Call at the top of any protected Server Component/layout.
// Middleware already redirects signed-out visitors to /login, so
// reaching here without a profile row means the account exists in
// Supabase Auth but nobody has added its profiles row yet.
export async function requireProfile(): Promise<Profile> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name_ar, full_name_en, title, role, is_active")
    .eq("id", user.id)
    .single();

  if (!profile) {
    redirect("/login?error=no-profile");
  }

  return profile as Profile;
}

export function canEdit(role: Profile["role"]) {
  return role === "admin" || role === "teacher";
}
