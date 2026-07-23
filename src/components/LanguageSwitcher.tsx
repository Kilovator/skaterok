"use client";

import { useLanguage } from "@/context/LanguageContext";
import { BiGlobe } from "react-icons/bi";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full p-1 pl-3 font-sans text-sm select-none shadow-sm">
      <BiGlobe className="text-white/70 w-5 h-5" aria-label="Language" />
      <div className="flex items-center gap-1">
        <button
          onClick={() => setLanguage("pl")}
          className={`px-4 py-1.5 rounded-full font-bold uppercase tracking-wide transition-all duration-300 cursor-pointer flex items-center justify-center min-w-[3.5rem] ${
            language === "pl"
              ? "bg-brand-amethyst text-white shadow-[0_2px_8px_rgba(123,114,181,0.3)] scale-100"
              : "text-white/50 hover:text-white hover:bg-white/10"
          }`}
          title="Polski"
        >
          PL
        </button>
        <button
          onClick={() => setLanguage("en")}
          className={`px-4 py-1.5 rounded-full font-bold uppercase tracking-wide transition-all duration-300 cursor-pointer flex items-center justify-center min-w-[3.5rem] ${
            language === "en"
              ? "bg-brand-amethyst text-white shadow-[0_2px_8px_rgba(123,114,181,0.3)] scale-100"
              : "text-white/50 hover:text-white hover:bg-white/10"
          }`}
          title="English"
        >
          EN
        </button>
      </div>
    </div>
  );
}
