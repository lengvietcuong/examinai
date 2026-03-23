"use client";

import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { translations, type Language } from "./translations";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (typeof translations)["en"];
}

const I18nContext = createContext<I18nContextType | null>(null);

const STORAGE_KEY = "examinai-language";

function getInitialLanguage(): Language {
  if (typeof window === "undefined") return "en";
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved === "vi" ? "vi" : "en";
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  return (
    <I18nContext value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </I18nContext>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}

export function useTranslation() {
  const { t } = useI18n();
  return t;
}
