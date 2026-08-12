"use client";

import { useState } from "react";
import { Heading } from "@/components/Heading";
import { useLanguage } from "@/context/LanguageContext";
import { useCustomizerControls } from "./context";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { FaCartPlus, FaBookmark, FaCheck } from "react-icons/fa6";

export function FloatingCartButtons() {
  const { t } = useLanguage();
  const { selectedDeck, selectedWheel, selectedTruck, selectedBolt } = useCustomizerControls();
  const { addItem } = useCart();
  const { saveBuild, isLoggedIn, openAuthModal } = useAuth();
  
  const [saveSuccess, setSaveSuccess] = useState(false);

  function handleAddToCart() {
    if (!selectedDeck || !selectedWheel || !selectedTruck || !selectedBolt) return;

    const customBoardProduct = {
      id: `custom-${Date.now()}`,
      name: `Custom Board (${selectedDeck.uid.replace(/-/g, " ")})`,
      price: 8999, // $89.99
      image: {
        src: selectedDeck.textureUrl || "/skateboard/decks/Deck1.webp",
        alt: "Custom Board",
      },
      dominantColor: "#7B72B5",
      customizerLink: "/build",
      buildDetails: {
        deck: selectedDeck,
        wheels: selectedWheel,
        truck: selectedTruck,
        bolt: selectedBolt,
      },
    };

    addItem(customBoardProduct);
  }

  async function handleSaveBuild() {
    if (!selectedDeck || !selectedWheel || !selectedTruck || !selectedBolt) return;

    if (!isLoggedIn) {
      openAuthModal("login");
      return;
    }

    const saved = await saveBuild({
      name: `Custom ${selectedDeck.uid.replace(/-/g, " ")} setup`,
      deck: selectedDeck,
      wheels: selectedWheel,
      truck: selectedTruck,
      bolt: selectedBolt,
      price: 8999,
    });

    if (saved) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  }

  return (
    <div className="absolute top-2 inset-x-2 lg:top-auto lg:bottom-6 lg:right-6 lg:inset-x-auto z-30 flex flex-row lg:flex-col items-center lg:items-stretch justify-between gap-2 lg:gap-3 w-auto lg:w-72 p-2 lg:p-4 rounded-2xl lg:rounded-3xl bg-brand-black/95 lg:bg-brand-black/85 backdrop-blur-2xl border border-brand-amethyst/35 shadow-[0_15px_35px_rgba(0,0,0,0.8),0_0_25px_rgba(123,114,181,0.25)] transition-all">
      
      {/* Integrated Header Row with Price */}
      <div className="flex items-center gap-2 lg:justify-between lg:border-b lg:border-white/10 lg:pb-2.5 shrink-0">
        <div className="flex items-center gap-1.5">
          <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-sans text-[10px] lg:text-xs font-bold uppercase tracking-wider text-white/90">
            SKET-OK
          </span>
        </div>
        <span className="font-mono text-xs lg:text-sm font-bold text-brand-pale">
          $89.99
        </span>
      </div>

      {/* Toast alert for build saved */}
      {saveSuccess && (
        <div className="p-1.5 lg:p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-sans text-[11px] lg:text-xs flex items-center justify-center gap-2 animate-fade-in backdrop-blur-md">
          <FaCheck className="size-3.5 shrink-0 text-emerald-400" />
          <span>{t("build.savedSuccess")}</span>
        </div>
      )}

      <div className="flex items-center gap-1.5 lg:flex-col lg:w-full shrink-0">
        {/* Add to Cart button */}
        <button
          onClick={handleAddToCart}
          className="py-1.5 px-3 lg:py-3 lg:px-4 lg:w-full rounded-xl bg-gradient-to-r from-brand-amethyst to-purple-600 hover:from-purple-600 hover:to-brand-amethyst border border-brand-amethyst/60 font-sans text-[11px] lg:text-xs font-bold uppercase tracking-wider text-white transition-all flex items-center justify-center gap-1.5 lg:gap-2.5 shadow-md shadow-purple-950/30 hover:scale-[1.02] cursor-pointer whitespace-nowrap"
        >
          <FaCartPlus size={14} className="text-white shrink-0" />
          <span>{t("build.addToCart")}</span>
        </button>

        {/* Save setup button */}
        <button
          onClick={handleSaveBuild}
          title={t("build.saveBuild")}
          className="py-1.5 px-2.5 lg:py-2.5 lg:px-4 lg:w-full rounded-xl border border-white/20 bg-white/5 hover:bg-white/15 text-white font-sans text-[11px] lg:text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.01] whitespace-nowrap"
        >
          <FaBookmark size={12} className="text-brand-amethyst shrink-0" />
          <span className="hidden lg:inline">{t("build.saveBuild")}</span>
        </button>
      </div>
    </div>
  );
}

export function BuildPageClient({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();

  return (
    <div className="relative z-20 rounded-t-3xl lg:rounded-none bg-texture bg-brand-deep text-white p-5 lg:p-6 lg:w-96 lg:shrink-0 lg:grow-0 flex flex-col justify-start shadow-[0_-12px_40px_rgba(0,0,0,0.7)] border-t border-white/15 lg:border-t-0 h-[50vh] lg:h-full overflow-y-auto lg:overflow-visible">
      {/* Mobile Bottom Sheet Drag Handle */}
      <div className="w-12 h-1.5 bg-white/30 rounded-full mx-auto mb-4 lg:hidden shrink-0" />
      <div>
        <Heading as="h1" size="sm" className="mb-4 lg:mb-6 mt-0 text-center lg:text-left">
          {t("build.heading")}
        </Heading>
        {children}
      </div>
    </div>
  );
}
