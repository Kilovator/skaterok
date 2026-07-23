"use client";

import { useState } from "react";
import { Heading } from "@/components/Heading";
import { useLanguage } from "@/context/LanguageContext";
import { useCustomizerControls } from "./context";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { FaCartPlus, FaBookmark, FaCheck } from "react-icons/fa6";

type Props = {
  children: React.ReactNode;
};

export function BuildPageClient({ children }: Props) {
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
    };

    addItem(customBoardProduct);
  }

  function handleSaveBuild() {
    if (!selectedDeck || !selectedWheel || !selectedTruck || !selectedBolt) return;

    if (!isLoggedIn) {
      openAuthModal("login");
      return;
    }

    const saved = saveBuild({
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
    <div className="grow bg-texture bg-brand-deep text-white ~p-4/6 lg:w-96 lg:shrink-0 lg:grow-0 flex flex-col justify-between">
      <div>
        <Heading as="h1" size="sm" className="mb-6 mt-0">
          {t("build.heading")}
        </Heading>
        {children}
      </div>

      <div className="mt-6 flex flex-col gap-3 relative">
        {/* Toast alert for build saved */}
        {saveSuccess && (
          <div className="absolute -top-14 left-0 right-0 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 font-sans text-xs flex items-center gap-2 animate-fade-in z-50 backdrop-blur-md">
            <FaCheck className="size-4 shrink-0" />
            <span>{t("build.savedSuccess")}</span>
          </div>
        )}

        {/* Add to Cart button */}
        <button
          onClick={handleAddToCart}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-amethyst to-purple-600 hover:from-purple-600 hover:to-brand-amethyst border border-brand-amethyst/60 font-sans text-sm font-bold uppercase tracking-wider text-white transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-brand-amethyst/30 hover:shadow-brand-amethyst/50 hover:scale-[1.02] cursor-pointer"
        >
          <FaCartPlus size={18} className="text-white shrink-0" />
          <span>{t("build.addToCart")}</span>
        </button>

        {/* Save setup button */}
        <button
          onClick={handleSaveBuild}
          className="w-full py-3.5 px-4 rounded-xl border border-brand-amethyst/50 bg-brand-amethyst/15 hover:bg-brand-amethyst/30 text-white font-sans text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01]"
        >
          <FaBookmark size={15} className="text-brand-amethyst shrink-0" />
          <span>{t("build.saveBuild")}</span>
        </button>
      </div>
    </div>
  );
}
