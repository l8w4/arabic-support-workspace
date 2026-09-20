"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  FileText,
  ClipboardList,
  BookOpen,
  CalendarCheck,
  Layers,
  LogOut,
  Languages,
} from "lucide-react";
import { LangProvider, useLang } from "@/lib/i18n/context";
import { logout } from "@/app/login/actions";
import type { Profile } from "@/lib/auth";

function ShellInner({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  const { t, lang, toggleLang } = useLang();
  const pathname = usePathname();

  const items = [
    { href: "/", label: t("home"), icon: Home },
    { href: "/students", label: t("students"), icon: Users },
    { href: "/files", label: t("files"), icon: FileText },
    { href: "/classes", label: t("classes"), icon: Layers },
    { href: "/plans", label: t("plans"), icon: ClipboardList },
    { href: "/prep", label: t("prep"), icon: BookOpen },
    { href: "/attendance", label: t("attendance"), icon: CalendarCheck },
  ];

  const roleLabel = profile.role === "admin" ? t("admin") : profile.role === "teacher" ? t("teacher") : t("viewer");
  const displayName = lang === "ar" ? profile.full_name_ar : profile.full_name_en || profile.full_name_ar;

  return (
    <div className="flex min-h-screen bg-slate-50 print:block print:min-h-0 print:bg-white">
      <aside className="w-64 bg-white border-e border-slate-200 flex flex-col shrink-0 print:hidden">
        <div className="p-5 border-b border-slate-200">
          <div className="flex items-center gap-3 mb-3">
            <img src="/logo.jpg" alt="We Care Support Centre" className="w-16 h-16 object-contain shrink-0" />
            <div>
              <div className="font-semibold text-slate-900 text-sm leading-tight">{t("appName")}</div>
              <div className="text-[11px] text-slate-400 mt-0.5">{t("appNameSub")}</div>
            </div>
          </div>
          <button
            type="button"
            onClick={toggleLang}
            className="text-xs px-2.5 py-1 rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50 inline-flex items-center gap-1"
          >
            <Languages size={12} /> {lang === "ar" ? "English" : "العربية"}
          </button>
        </div>

        <nav className="flex-1 p-3 flex flex-col gap-1">
          {items.map((it) => {
            const active = pathname === it.href;
            return (
              <Link
                key={it.href}
                href={it.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <it.icon size={17} />
                {it.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-slate-200">
          <div className="text-xs text-slate-500 mb-2 px-1">
            {displayName} <span className="text-slate-300">·</span> {roleLabel}
          </div>
          <form action={logout}>
            <button
              type="submit"
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
            >
              <LogOut size={17} /> {t("logout")}
            </button>
          </form>
        </div>
      </aside>

      <main className="flex-1 p-6 overflow-y-auto print:p-0 print:overflow-visible">{children}</main>
    </div>
  );
}

export default function Shell({ profile, children }: { profile: Profile; children: React.ReactNode }) {
  return (
    <LangProvider>
      <ShellInner profile={profile}>{children}</ShellInner>
    </LangProvider>
  );
}
