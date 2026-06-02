"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FaCartShopping, FaTrash, FaXmark } from "react-icons/fa6";
import { useCart } from "@/context/CartContext";
import { useLanguage } from "@/context/LanguageContext";

/* Jagged SVG strip — amethyst torn left edge of the drawer */
function TornEdge() {
  return (
    <svg
      viewBox="0 0 28 1000"
      preserveAspectRatio="none"
      className="absolute left-0 top-0 h-full w-7 shrink-0 text-brand-black"
      style={{ filter: "drop-shadow(-3px 0 6px #7B72B540)" }}
      aria-hidden
    >
      {/* amethyst background fill for the strip */}
      <rect width="28" height="1000" fill="#7B72B5" />
      {/* Jagged right edge cutout in brand-black color */}
      <path
        fill="currentColor"
        d="M28,0 L28,1000 L16,1000
           L26,972 L20,948 L28,920 L14,895 L24,868
           L8,842  L26,815 L18,788 L28,760 L12,733
           L22,706 L6,680  L28,652 L16,625 L24,598
           L10,570 L26,543 L20,516 L28,488 L14,460
           L4,433  L24,406 L18,378 L28,350 L8,322
           L22,295 L16,268 L28,240 L10,212 L26,185
           L20,158 L28,130 L6,102  L24,75  L14,48
           L28,20  L22,0 Z"
      />
    </svg>
  );
}

export function CartDrawer() {
  const { isOpen, closeCart, items, totalCount, removeItem } = useCart();
  const { t } = useLanguage();
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());

  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  /* Lock body scroll when drawer is open */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  function handleRemove(id: string) {
    setRemovingIds((prev) => new Set([...prev, id]));
    setTimeout(() => {
      removeItem(id);
      setRemovingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 340);
  }

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        className={`fixed inset-0 z-40 bg-brand-black/75 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={closeCart}
      />

      {/* ── Drawer container ── */}
      <aside
        aria-label={t("cart.title")}
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Torn amethyst left-edge strip */}
        <TornEdge />

        {/* Main panel — offset to the right of the torn strip */}
        <div className="relative ml-6 flex h-full flex-col bg-brand-black bg-texture">

          {/* Animated ambient glow */}
          <div className="cart-glow-anim absolute inset-0" />

          {/* ── Header ── */}
          <div className="relative z-10 flex items-center justify-between border-b border-brand-deep/60 px-5 py-4">
            <div className="flex items-baseline gap-2">
              <h2 className="font-sans text-2xl font-bold uppercase tracking-widest text-brand-amethyst">
                {t("cart.title")}
              </h2>
              {totalCount > 0 && (
                <span className="font-sans text-base text-white/50">
                  ({totalCount})
                </span>
              )}
            </div>
            <button
              onClick={closeCart}
              aria-label={t("cart.close")}
              className="group flex size-8 items-center justify-center text-brand-silver transition-colors hover:text-white"
            >
              <FaXmark
                size={18}
                className="transition-transform duration-200 group-hover:rotate-90"
              />
            </button>
          </div>

          {/* ── Items list ── */}
          <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center gap-3">
                <div style={{ filter: "url(#squiggle-1)" }}>
                  <FaCartShopping
                    size={52}
                    className="text-brand-amethyst opacity-20"
                  />
                </div>
                <p className="font-sans text-sm uppercase tracking-[0.3em] text-white/25">
                  {t("cart.empty")}
                </p>
              </div>
            ) : (
              <ul className="flex flex-col gap-2">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className={removingIds.has(item.id) ? "cart-item-removing" : ""}
                  >
                    <div className="flex items-center gap-3 border border-brand-deep/50 bg-white/[0.04] p-3">
                      {/* Dominant-color accent stripe */}
                      <div
                        className="w-[3px] self-stretch shrink-0 rounded-full"
                        style={{ backgroundColor: item.dominantColor }}
                      />

                      {/* Product image */}
                      <div className="relative h-[72px] w-10 shrink-0 overflow-hidden">
                        <Image
                          src={item.image.src}
                          alt={item.image.alt}
                          fill
                          className="object-cover object-top"
                        />
                      </div>

                      {/* Product info */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-sans text-xs font-bold uppercase tracking-wider text-white">
                          {item.name}
                        </p>
                        <p className="mt-0.5 font-sans text-sm text-brand-amethyst">
                          ${(item.price / 100).toFixed(2)}
                        </p>
                        {item.quantity > 1 && (
                          <p className="mt-0.5 font-sans text-xs text-white/35">
                            {t("cart.qty")}: {item.quantity}
                          </p>
                        )}
                      </div>

                      {/* Remove button */}
                      <button
                        onClick={() => handleRemove(item.id)}
                        aria-label={t("cart.remove").replace("{name}", item.name)}
                        className="group/del shrink-0 p-1 text-brand-deep transition-colors hover:text-red-500"
                      >
                        <FaTrash
                          size={13}
                          className="transition-transform duration-150 group-hover/del:scale-110"
                        />
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* ── Footer / Checkout ── */}
          {items.length > 0 && (
            <div className="relative z-10 border-t border-brand-deep/60 px-6 pb-6 pt-4">
              {/* Subtotal row */}
              <div className="mb-4 flex items-baseline justify-between">
                <span className="font-sans text-xs uppercase tracking-[0.25em] text-white/40">
                  {t("cart.total")}
                </span>
                <span className="font-sans text-xl font-bold text-white">
                  ${(totalPrice / 100).toFixed(2)}
                </span>
              </div>

              {/* Checkout — full-width button-cutout */}
              <button className="button-cutout w-full bg-gradient-to-b from-brand-amethyst to-brand-pale from-25% to-75% bg-[length:100%_400%] py-3 font-sans text-base font-bold uppercase tracking-widest text-white transition-[background-position] duration-300 hover:bg-bottom hover:text-black">
                {t("cart.checkout")}
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
