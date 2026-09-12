"use client";

import React, { createContext, useContext, useState } from "react";
import { STRINGS, type Lang, type StringKey } from "./strings";

type LangContextValue = {
  lang: Lang;
  t: (key: StringKey) => string;
  toggleLang: () => void;
};

const LangContext = createContext<LangContextValue>({
  lang: "ar",
  t: (k) => k,
  toggleLang: () => {},
});

export function useLang() {
  return useContext(LangContext);
}

export function LangProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("ar");
  const toggleLang = () => setLang((l) => (l === "ar" ? "en" : "ar"));
  const t = (key: StringKey) => STRINGS[lang][key] ?? key;

  return (
    <LangContext.Provider value={{ lang, t, toggleLang }}>
      <div dir={lang === "ar" ? "rtl" : "ltr"} lang={lang} className={lang === "ar" ? "font-arabic" : "font-latin"}>
        {children}
      </div>
    </LangContext.Provider>
  );
}
