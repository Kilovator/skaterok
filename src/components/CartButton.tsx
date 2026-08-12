"use client";

import { FaCartShopping } from "react-icons/fa6";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

export function CartButton() {
  const { openCart, totalCount } = useCart();
  const { t } = useLanguage();

  return (
    <button
      onClick={openCart}
      aria-label={t("cart.open").replace("{count}", String(totalCount))}
      className="button-cutout group inline-flex items-center gap-1.5 sm:gap-2.5 bg-gradient-to-b from-brand-amethyst to-brand-pale from-25% to-75% bg-[length:100%_400%] px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold text-white transition-[filter,background-position] duration-300 hover:bg-bottom hover:text-black whitespace-nowrap flex-row shrink-0"
    >
      <div className="flex size-4 sm:size-5 items-center justify-center transition-transform group-hover:-rotate-[25deg] [&>svg]:h-full [&>svg]:w-full shrink-0">
        <FaCartShopping />
      </div>
      <div className="w-px self-stretch bg-black/25" />
      <span className="font-mono text-[11px] sm:text-xs font-bold px-0.5">
        {totalCount}
      </span>
    </button>
  );
}
