"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { translations, type Language } from "@/data/translations";

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: keyof typeof translations["pl"]) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("pl");

  useEffect(() => {
    // Read from localStorage on mount
    const savedLanguage = localStorage.getItem("language") as Language;
    if (savedLanguage === "pl" || savedLanguage === "en") {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
  };

  const t = (key: keyof typeof translations["pl"]): string => {
    const translationSet = translations[language] || translations["pl"];
    return translationSet[key] || translations["pl"][key] || String(key);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
