"use client";

import { createContext, useContext } from "react";
import type { Lang, Translations } from "@/lib/i18n";
import { translations } from "@/lib/i18n";

const LangCtx = createContext<Lang>("en");

export function LangProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return <LangCtx.Provider value={lang}>{children}</LangCtx.Provider>;
}

export function useLang(): Lang {
  return useContext(LangCtx);
}

export function useT(): Translations {
  return translations[useContext(LangCtx)];
}
