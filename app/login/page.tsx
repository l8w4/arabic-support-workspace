"use client";

import { useState } from "react";
import { Eye, EyeOff, GraduationCap } from "lucide-react";
import { LangProvider, useLang } from "@/lib/i18n/context";
import { login } from "./actions";

function LoginForm({ hasError }: { hasError: boolean }) {
  const { t, lang, toggleLang } = useLang();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 relative">
      <button
        type="button"
        onClick={toggleLang}
        className="absolute top-5 end-5 text-xs px-3 py-1.5 rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100"
      >
        {lang === "ar" ? "English" : "العربية"}
      </button>

      <form action={login} className="bg-white shadow-sm border border-slate-200 rounded-xl p-8 w-full max-w-sm">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-xl bg-slate-900 text-white flex items-center justify-center mb-3">
            <GraduationCap size={26} />
          </div>
          <div className="font-semibold text-lg text-slate-900">{t("appName")}</div>
          <div className="text-xs text-slate-500 mt-1">{t("appNameSub")}</div>
        </div>

        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-slate-500 mb-1">{t("username")}</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label className="block text-xs text-slate-500 mb-1">{t("password")}</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm pe-9 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute top-2.5 end-2.5 text-slate-400 hover:text-slate-600"
                aria-label="toggle password visibility"
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {hasError && <div className="text-sm text-red-600">{t("loginError")}</div>}

          <button
            type="submit"
            className="mt-1 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-2.5 text-sm font-medium transition-colors"
          >
            {t("loginBtn")}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function LoginPage({ searchParams }: { searchParams: { error?: string } }) {
  return (
    <LangProvider>
      <LoginForm hasError={!!searchParams.error} />
    </LangProvider>
  );
}
