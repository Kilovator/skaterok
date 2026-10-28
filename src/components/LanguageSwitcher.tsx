"use client";

import { useLanguage } from "@/context/LanguageContext";
import { type Language } from "@/data/translations";
import { BiGlobe } from "react-icons/bi";
import clsx from "clsx";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const options: { id: Language; label: string; title: string }[] = [
    { id: "pl", label: "PL", title: "Polski" },
    { id: "en", label: "EN", title: "English" },
    { id: "ru", label: "RU", title: "Русский" },
  ];

  const getPillOffset = () => {
    switch (language) {
      case "pl":
        return 0;
      case "en":
        return 42;
      case "ru":
        return 84;
      default:
        return 0;
    }
  };

  return (
    <div className="flex items-center gap-1.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full p-1 pl-2.5 font-sans text-xs select-none shadow-sm">
      <BiGlobe className="text-white/70 w-4 h-4 shrink-0" aria-label="Language" />

      {/* Track */}
      <div className="relative flex items-center h-7 w-[128px] bg-black/20 rounded-full p-0.5">
        {/* Active Sliding Purple Pill */}
        <div
          className="absolute top-0.5 left-0.5 h-6 w-[40px] rounded-full bg-brand-amethyst shadow-[0_2px_8px_rgba(123,114,181,0.4)] transition-transform duration-300 ease-out pointer-events-none"
          style={{
            transform: `translateX(${getPillOffset()}px)`,
          }}
        />

        {options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => setLanguage(opt.id)}
            className={clsx(
              "relative z-10 w-[42px] h-full flex items-center justify-center font-bold uppercase tracking-wider text-[11px] transition-colors cursor-pointer",
              language === opt.id ? "text-white font-extrabold" : "text-white/50 hover:text-white"
            )}
            title={opt.title}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
