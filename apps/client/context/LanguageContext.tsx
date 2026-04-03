"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useTranslation } from "react-i18next";
import { setLanguage as setI18nLanguage } from "../lib/i18n";

interface LanguageContextValue {
  language: string;
  setLanguage: (lng: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: (...args: any[]) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  language: "en",
  setLanguage: () => {},
  t: (k) => k,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const { t, i18n } = useTranslation();
  const [language, setLang] = useState(i18n.language || "en");

  const setLanguage = useCallback((lng: string) => {
    setI18nLanguage(lng);
    setLang(lng);
  }, []);

  useEffect(() => {
    const handler = (lng: string) => setLang(lng);
    i18n.on("languageChanged", handler);
    return () => {
      i18n.off("languageChanged", handler);
    };
  }, [i18n]);

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t: t as LanguageContextValue["t"] }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
