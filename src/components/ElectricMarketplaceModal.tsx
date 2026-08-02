"use client";

import { useState } from "react";
import {
  FaXmark,
  FaStar,
  FaBolt,
  FaBatteryFull,
  FaGaugeHigh,
  FaWeightHanging,
  FaCartShopping,
  FaMagnifyingGlass,
  FaChevronLeft,
  FaChevronRight,
  FaExpand
} from "react-icons/fa6";
import { electricProducts, CategoryId, Product } from "@/data/products";
import { useCart } from "@/context/CartContext";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  initialCategory?: CategoryId | "all";
};

// Sub-component for individual product card with 5-photo carousel & lightbox
function ProductCard({
  product,
  onAddToCart,
  onOpenLightbox
}: {
  product: Product;
  onAddToCart: (p: Product) => void;
  onOpenLightbox: (images: string[], initialIndex: number, title: string) => void;
}) {
  const gallery = product.images && product.images.length > 0 ? product.images : [product.image.src];
  const [currentIdx, setCurrentIdx] = useState(0);

  function prevImage(e: React.MouseEvent) {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev === 0 ? gallery.length - 1 : prev - 1));
  }

  function nextImage(e: React.MouseEvent) {
    e.stopPropagation();
    setCurrentIdx((prev) => (prev === gallery.length - 1 ? 0 : prev + 1));
  }

  return (
    <div className="group relative rounded-2xl bg-white/5 border border-white/10 hover:border-brand-amethyst/60 p-4 transition-all duration-300 hover:shadow-xl hover:shadow-brand-amethyst/10 flex flex-col justify-between">
      <div>
        {/* 5-Photo Carousel Container */}
        <div
          onClick={() => onOpenLightbox(gallery, currentIdx, product.name)}
          className="relative aspect-video rounded-xl overflow-hidden mb-3 bg-black/60 border border-white/10 group/img cursor-pointer p-2 flex items-center justify-center"
        >
          {/* Main Displayed Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gallery[currentIdx]}
            alt={`${product.name} photo ${currentIdx + 1}`}
            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover/img:scale-105"
          />

          {/* Photo Counter Badge */}
          <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-amber-300 border border-amber-500/40 flex items-center gap-1">
            <span>${(product.price / 100).toFixed(2)}</span>
            <span className="text-white/40">|</span>
            <span className="text-white font-mono text-[10px]">{currentIdx + 1}/{gallery.length}</span>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-md px-2 py-1 rounded-full text-[11px] font-bold text-white flex items-center gap-1 border border-white/20">
            <FaStar className="text-yellow-400 size-3" />
            <span>{(product.rating ?? 5.0).toFixed(1)} ({product.reviewsCount ?? 24})</span>
          </div>

          {/* Fullscreen Expand Icon on Hover */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 backdrop-blur-md border border-white/30 text-white opacity-0 group-hover/img:opacity-100 transition-opacity">
            <FaExpand size={16} />
          </div>

          {/* Arrow Navigation (< and >) */}
          {gallery.length > 1 && (
            <>
              <button
                onClick={prevImage}
                title="Poprzednie zdjęcie"
                className="absolute left-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all opacity-80 hover:opacity-100 cursor-pointer"
              >
                <FaChevronLeft size={12} />
              </button>
              <button
                onClick={nextImage}
                title="Następne zdjęcie"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all opacity-80 hover:opacity-100 cursor-pointer"
              >
                <FaChevronRight size={12} />
              </button>
            </>
          )}

          {/* Dots Indicator Overlay */}
          {gallery.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
              {gallery.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentIdx(i);
                  }}
                  className={`size-2 rounded-full transition-all cursor-pointer ${
                    i === currentIdx ? "bg-amber-400 w-4" : "bg-white/40 hover:bg-white"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* 5 Thumbnails Row for Fast Preview */}
        {gallery.length > 1 && (
          <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
            {gallery.map((imgUrl, i) => (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className={`relative size-9 rounded-lg overflow-hidden border shrink-0 transition-all cursor-pointer ${
                  i === currentIdx
                    ? "border-amber-400 ring-2 ring-amber-400/40 scale-105"
                    : "border-white/15 opacity-60 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imgUrl} alt="mini" className="w-full h-full object-contain p-0.5" />
              </button>
            ))}
          </div>
        )}

        {/* Product Name */}
        <h3 className="font-sans font-bold text-base text-white mb-2 leading-snug group-hover:text-amber-300 transition-colors">
          {product.name}
        </h3>

        {/* Specs Badges Grid */}
        {product.specs && (
          <div className="grid grid-cols-2 gap-1.5 mb-3 text-[11px] font-mono text-white/80">
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/5 border border-white/10">
              <FaGaugeHigh className="text-amber-400 size-3 shrink-0" />
              <span>{product.specs.speed}</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/5 border border-white/10">
              <FaBatteryFull className="text-emerald-400 size-3 shrink-0" />
              <span>{product.specs.range}</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/5 border border-white/10">
              <FaBolt className="text-cyan-400 size-3 shrink-0" />
              <span>{product.specs.power}</span>
            </div>
            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-white/5 border border-white/10">
              <FaWeightHanging className="text-purple-400 size-3 shrink-0" />
              <span>{product.specs.weight}</span>
            </div>
          </div>
        )}

        {/* Description */}
        <p className="text-xs text-white/70 leading-relaxed mb-4 line-clamp-2">
          {product.description}
        </p>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={() => onAddToCart(product)}
        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-brand-amethyst to-purple-600 hover:from-purple-600 hover:to-brand-amethyst font-sans text-xs font-bold uppercase tracking-wider text-white shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
      >
        <FaCartShopping className="size-3.5" />
        <span>Dodaj do Koszyka</span>
      </button>
    </div>
  );
}

export function ElectricMarketplaceModal({ isOpen, onClose, initialCategory = "all" }: Props) {
  const { addItem, openCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | "all">(initialCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [addedItemName, setAddedItemName] = useState<string | null>(null);

  // Lightbox Modal state
  const [lightbox, setLightbox] = useState<{
    isOpen: boolean;
    images: string[];
    index: number;
    title: string;
  }>({
    isOpen: false,
    images: [],
    index: 0,
    title: "",
  });

  if (!isOpen) return null;

  const categories = [
    { id: "all", label: "Wszystkie Pojazdy", icon: "⚡" },
    { id: "hoverboard", label: "Hoverboardy", icon: "🛸" },
    { id: "eskate", label: "Elektroskejty", icon: "🛹" },
    { id: "euc", label: "Monocykle", icon: "⭕" },
    { id: "gokart", label: "Gokarty", icon: "🏎️" },
  ];

  const filteredProducts = electricProducts.filter((product) => {
    if (selectedCategory !== "all" && product.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchDesc = product.description ? product.description.toLowerCase().includes(q) : false;
      const matchSpec = product.specs ? Object.values(product.specs).some((s) => s?.toLowerCase().includes(q)) : false;
      if (!matchName && !matchDesc && !matchSpec) return false;
    }
    return true;
  });

  function handleAddToCart(product: Product) {
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: {
        src: product.images?.[0] || product.image.src,
        alt: product.image.alt,
      },
    });
    setAddedItemName(product.name);
    setTimeout(() => setAddedItemName(null), 2500);
  }

  function openLightbox(images: string[], index: number, title: string) {
    setLightbox({ isOpen: true, images, index, title });
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-xl animate-fade-in font-sans">
        <div className="relative w-full max-w-6xl h-[90vh] bg-texture bg-brand-black border border-brand-amethyst/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white">
          
          {/* Header Strip */}
          <div className="h-1.5 w-full bg-gradient-to-r from-brand-amethyst via-purple-500 to-brand-pale" />

          {/* Top Navigation Bar */}
          <div className="p-4 md:p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-brand-black/90">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm">
                  ⚡ MARKETPLACE
                </span>
                <h2 className="text-xl md:text-2xl font-bold uppercase tracking-wider text-white">
                  Sklep Pojazdów Elektrycznych
                </h2>
              </div>
              <p className="text-xs text-white/60 mt-1">
                Hulajnogi, deskorolki elektryczne, żyroskopy i monocykle (5 zdjęć do każdego pojazdu)!
              </p>
            </div>

            <button
              onClick={onClose}
              className="self-end md:self-auto p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <FaXmark size={20} />
            </button>
          </div>

          {/* Added Toast Alert */}
          {addedItemName && (
            <div className="bg-emerald-500 text-black px-4 py-2 font-bold text-xs flex items-center justify-between shadow-lg animate-pulse">
              <span> Dodano do koszyka: {addedItemName}</span>
              <button onClick={openCart} className="underline uppercase tracking-wider cursor-pointer">
                Otwórz Koszyk →
              </button>
            </div>
          )}

          {/* Filter Bar & Search Input */}
          <div className="p-4 border-b border-white/10 bg-white/5 flex flex-col md:flex-row items-center justify-between gap-3">
            {/* Category Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id as CategoryId | "all")}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-brand-amethyst text-white shadow-lg shadow-brand-amethyst/30 border border-brand-amethyst/60"
                      : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10"
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <FaMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40 size-3.5" />
              <input
                type="text"
                placeholder="Szukaj modelu, mocy, prędkości..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/15 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-brand-amethyst"
              />
            </div>
          </div>

          {/* Products Grid Area */}
          <div className="grow p-4 md:p-6 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center text-white/50">
                <span className="text-4xl mb-2">🔍</span>
                <p className="text-sm font-bold">Nie znaleziono pojazdów spełniających kryteria.</p>
                <button
                  onClick={() => {
                    setSelectedCategory("all");
                    setSearchQuery("");
                  }}
                  className="mt-3 text-xs text-brand-pale hover:underline"
                >
                  Zresetuj filtry
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onOpenLightbox={openLightbox}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer info bar */}
          <div className="p-3 border-t border-white/10 bg-black/60 text-center text-xs text-white/50 flex items-center justify-between px-6">
            <span>Darmowa wysyłka i serwis gwarancyjny SKET-OK na terenie całej Polski</span>
            <span className="font-mono text-amber-300 font-bold">Liczba dostępnych modeli: {filteredProducts.length}</span>
          </div>

        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightbox.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-2xl animate-fade-in font-sans">
          <button
            onClick={() => setLightbox((prev) => ({ ...prev, isOpen: false }))}
            className="absolute top-5 right-5 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer z-50"
          >
            <FaXmark size={24} />
          </button>

          <div className="relative max-w-4xl w-full flex flex-col items-center">
            {/* Title */}
            <h3 className="text-lg font-bold text-amber-300 mb-3 text-center">
              {lightbox.title} ({lightbox.index + 1} / {lightbox.images.length})
            </h3>

            {/* Main Lightbox Image */}
            <div className="relative max-h-[75vh] w-full flex items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightbox.images[lightbox.index]}
                alt="Enlarged photo"
                className="max-h-[75vh] max-w-full object-contain rounded-2xl"
              />

              {/* Prev / Next Arrows */}
              {lightbox.images.length > 1 && (
                <>
                  <button
                    onClick={() =>
                      setLightbox((prev) => ({
                        ...prev,
                        index: prev.index === 0 ? prev.images.length - 1 : prev.index - 1,
                      }))
                    }
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black text-white border border-white/30 transition-all cursor-pointer"
                  >
                    <FaChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() =>
                      setLightbox((prev) => ({
                        ...prev,
                        index: prev.index === prev.images.length - 1 ? 0 : prev.index + 1,
                      }))
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/70 hover:bg-black text-white border border-white/30 transition-all cursor-pointer"
                  >
                    <FaChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails Row */}
            {lightbox.images.length > 1 && (
              <div className="flex items-center gap-2 mt-4">
                {lightbox.images.map((imgUrl, i) => (
                  <button
                    key={i}
                    onClick={() => setLightbox((prev) => ({ ...prev, index: i }))}
                    className={`relative size-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                      i === lightbox.index
                        ? "border-amber-400 scale-110 shadow-lg shadow-amber-500/50"
                        : "border-white/20 opacity-50 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imgUrl} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
