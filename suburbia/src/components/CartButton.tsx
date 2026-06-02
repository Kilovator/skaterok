"use client";

import { FaCartShopping } from "react-icons/fa6";
import { useCart } from "@/context/CartContext";

export function CartButton() {
  const { openCart, totalCount } = useCart();

  return (
    <button
      onClick={openCart}
      aria-label={`Open cart, ${totalCount} items`}
      className="button-cutout group mx-4 inline-flex items-center gap-3 bg-gradient-to-b from-brand-amethyst to-brand-pale from-25% to-75% bg-[length:100%_400%] px-1 text-lg font-bold text-white transition-[filter,background-position] duration-300 hover:bg-bottom hover:text-black ~py-2.5/3"
    >
      <div className="flex size-6 items-center justify-center transition-transform group-hover:-rotate-[25deg] [&>svg]:h-full [&>svg]:w-full">
        <FaCartShopping />
      </div>
      <div className="w-px self-stretch bg-black/25" />
      <span className="md:hidden">{totalCount}</span>
      <span className="hidden md:inline">Cart ({totalCount})</span>
    </button>
  );
}
