import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/access/role";

export type { Profile };

// Call at the top of any protected Server Component/layout.
// Middleware already redirects signed-out visitors to /login, so
// reaching here without a profile row means the account exists in
// Supabase Auth but nobody has added its profiles row yet.
export async function requireProfile(): Promise<Profile> {
  const supabase = await createClient();
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

