"use client";

import { useLanguage } from "@/context/LanguageContext";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-white/[0.08] border border-white/10 rounded-full p-1 font-sans text-xs select-none">
      <button
        onClick={() => setLanguage("pl")}
        className={`px-3 py-1 rounded-full font-bold uppercase transition-all duration-200 cursor-pointer ${
          language === "pl"
            ? "bg-brand-amethyst text-white shadow-[0_0_8px_rgba(123,114,181,0.5)] scale-105"
            : "text-brand-silver hover:text-white hover:bg-white/[0.04]"
        }`}
      >
        PL
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={`px-3 py-1 rounded-full font-bold uppercase transition-all duration-200 cursor-pointer ${
          language === "en"
            ? "bg-brand-amethyst text-white shadow-[0_0_8px_rgba(123,114,181,0.5)] scale-105"
            : "text-brand-silver hover:text-white hover:bg-white/[0.04]"
        }`}
      >
        EN
      </button>
    </div>
  );
}
