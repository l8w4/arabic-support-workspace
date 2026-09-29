import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/access/role";

export type { Profile };

// Call at the top of any protected Server Component/layout.
// Middleware already redirects signed-out visitors to /login, so
// reaching here without a profile row means the account exists in
// Supabase Auth but nobody has added its profiles row yet.
//
// Uses getSession() (reads the already-verified JWT from the cookie, no
// network call) rather than getUser() (re-validates against Supabase's
// Auth server every time). Middleware already called getUser() for this
// exact request a moment ago and would have redirected if it failed, so
// re-validating here again is a pure extra round-trip with no security
// benefit — and a costly one, since every navigation was paying it twice.
export async function requireProfile(): Promise<Profile> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name_ar, full_name_en, title, role, is_active")
    .eq("id", session.user.id)
    .single();

  if (!profile) {
    redirect("/login?error=no-profile");
  }

  return profile as Profile;
}

