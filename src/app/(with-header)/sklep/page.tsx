"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  FaStar,
  FaBolt,
  FaBatteryFull,
  FaGaugeHigh,
  FaWeightHanging,
  FaCartShopping,
  FaMagnifyingGlass,
  FaChevronLeft,
  FaChevronRight,
  FaExpand,
  FaXmark
} from "react-icons/fa6";
import { electricProducts, CategoryId, Product } from "@/data/products";
import { useCart } from "@/context/CartContext";

function SklepContent() {
  const searchParams = useSearchParams();
  const initialCategoryParam = (searchParams.get("cat") as CategoryId) || "all";

  const { addItem, openCart } = useCart();
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | "all">(initialCategoryParam);
  const [searchQuery, setSearchQuery] = useState("");
  const [addedItemName, setAddedItemName] = useState<string | null>(null);

  // Lightbox State
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

  const categories = [
    { id: "all", label: "Wszystkie Pojazdy", icon: "⚡" },
    { id: "eskate", label: "Deskorolki Elektryczne", icon: "🛹" },
    { id: "hoverboard", label: "Hoverboardy", icon: "🛸" },
    { id: "euc", label: "Monocykle Elektryczne", icon: "⭕" },
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
    <div className="min-h-screen bg-texture bg-brand-black text-white pt-24 pb-16 px-4 md:px-8 font-sans">
      <div className="mx-auto max-w-7xl">
        
        {/* Banner Strip */}
        <div className="relative rounded-3xl bg-gradient-to-r from-purple-900/60 via-brand-amethyst/30 to-brand-black p-6 md:p-10 border border-brand-amethyst/40 shadow-2xl mb-8 overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 size-64 bg-brand-amethyst/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
                ⚡ OFICJALNY ELEKTRO SKLEP SKET-OK
              </span>
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-wider text-white">
                Pojazdy Elektryczne
              </h1>
              <p className="text-sm md:text-base text-white/70 mt-2 max-w-2xl leading-relaxed">
                Hulajnogi, deskorolki elektryczne, hoverboardy i monocykle! specyfikacje i pełna gwarancja.
              </p>
            </div>
            
            <div className="flex items-center gap-4 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-300">{electricProducts.length}</div>
                <div className="text-[10px] text-white/60 uppercase tracking-wider">Dostępnych modeli</div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">24h</div>
                <div className="text-[10px] text-white/60 uppercase tracking-wider">Wysyłka z PL</div>
              </div>
            </div>
          </div>
        </div>

        {/* Added Toast Notification */}
        {addedItemName && (
          <div className="mb-6 bg-emerald-500 text-black px-5 py-3 rounded-2xl font-bold text-sm flex items-center justify-between shadow-xl animate-pulse">
            <span> Dodano do koszyka: {addedItemName}</span>
            <button onClick={openCart} className="underline uppercase tracking-wider cursor-pointer font-bold">
              Otwórz Koszyk →
            </button>
          </div>
        )}

        {/* Filter Bar & Search Input */}
        <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-4">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as CategoryId | "all")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? "bg-brand-amethyst text-white shadow-lg shadow-brand-amethyst/30 border border-brand-amethyst/60 scale-105"
                    : "bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full lg:w-80">
            <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 size-4" />
            <input
              type="text"
              placeholder="Szukaj modelu, mocy, prędkości..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/15 rounded-xl py-2.5 pl-10 pr-4 text-xs md:text-sm text-white placeholder-white/40 focus:outline-none focus:border-brand-amethyst"
            />
          </div>
        </div>

        {/* Products Grid */}
        {filteredProducts.length === 0 ? (
          <div className="h-80 rounded-3xl bg-white/5 border border-white/10 flex flex-col items-center justify-center text-center text-white/50 p-6">
            <span className="text-5xl mb-3">🔍</span>
            <p className="text-base font-bold text-white">Nie znaleziono pojazdów spełniających kryteria.</p>
            <button
              onClick={() => {
                setSelectedCategory("all");
                setSearchQuery("");
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-brand-amethyst/30 text-brand-pale text-xs font-bold hover:bg-brand-amethyst/50 transition-colors"
            >
              Zresetuj filtry
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCardItem
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                onOpenLightbox={openLightbox}
              />
            ))}
          </div>
        )}

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
            <h3 className="text-lg font-bold text-amber-300 mb-3 text-center">
              {lightbox.title} ({lightbox.index + 1} / {lightbox.images.length})
            </h3>

            <div className="relative max-h-[75vh] w-full flex items-center justify-center overflow-hidden rounded-2xl border border-white/20 bg-black">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lightbox.images[lightbox.index]}
                alt="Enlarged view"
                className="max-h-[75vh] max-w-full object-contain rounded-2xl"
              />

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
    </div>
  );
}

function ProductCardItem({
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
    <div className="group relative rounded-3xl bg-white/5 border border-white/10 hover:border-brand-amethyst/60 p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-brand-amethyst/20 flex flex-col justify-between">
      <div>
        {/* 5-Photo Carousel Container */}
        <div
          onClick={() => onOpenLightbox(gallery, currentIdx, product.name)}
          className="relative aspect-video rounded-2xl overflow-hidden mb-4 bg-gradient-to-b from-black/80 to-black/60 border border-white/15 group/img cursor-pointer p-3 flex items-center justify-center shadow-inner"
        >
          {/* Main Image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={gallery[currentIdx]}
            alt={`${product.name} photo ${currentIdx + 1}`}
            className="max-h-full max-w-full object-contain filter drop-shadow-xl transition-transform duration-500 ease-out group-hover/img:scale-105"
          />

          {/* Price & Counter Badge */}
          <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow-lg">
            <span>${(product.price / 100).toFixed(2)}</span>
            <span className="text-white/40">|</span>
            <span className="text-white font-mono text-[11px]">{currentIdx + 1}/{gallery.length}</span>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-white flex items-center gap-1 border border-white/20 shadow-lg">
            <FaStar className="text-yellow-400 size-3" />
            <span>{(product.rating ?? 5.0).toFixed(1)} ({product.reviewsCount ?? 24})</span>
          </div>

          {/* Fullscreen Expand Icon */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 backdrop-blur-md border border-white/30 text-white opacity-0 group-hover/img:opacity-100 transition-opacity">
            <FaExpand size={18} />
          </div>

          {/* Arrow Nav Buttons */}
          {gallery.length > 1 && (
            <>
              <button
                onClick={prevImage}
                title="Poprzednie zdjęcie"
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all opacity-80 hover:opacity-100 cursor-pointer"
              >
                <FaChevronLeft size={14} />
              </button>
              <button
                onClick={nextImage}
                title="Następne zdjęcie"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 transition-all opacity-80 hover:opacity-100 cursor-pointer"
              >
                <FaChevronRight size={14} />
              </button>
            </>
          )}

          {/* Dots Indicator Overlay */}
          {gallery.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
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

        {/* 5 Thumbnails Row */}
        {gallery.length > 1 && (
          <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
            {gallery.map((imgUrl, i) => (
              <button
                key={i}
                onClick={() => setCurrentIdx(i)}
                className={`relative size-10 rounded-xl overflow-hidden border shrink-0 transition-all cursor-pointer ${
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
        <h3 className="font-sans font-bold text-lg text-white mb-2 leading-snug group-hover:text-amber-300 transition-colors">
          {product.name}
        </h3>

        {/* Specs Grid */}
        {product.specs && (
          <div className="grid grid-cols-2 gap-2 mb-4 text-xs font-mono text-white/80">
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
              <FaGaugeHigh className="text-amber-400 size-3.5 shrink-0" />
              <span>{product.specs.speed}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
              <FaBatteryFull className="text-emerald-400 size-3.5 shrink-0" />
              <span>{product.specs.range}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
              <FaBolt className="text-cyan-400 size-3.5 shrink-0" />
              <span>{product.specs.power}</span>
            </div>
            <div className="flex items-center gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
              <FaWeightHanging className="text-purple-400 size-3.5 shrink-0" />
              <span>{product.specs.weight}</span>
            </div>
          </div>
        )}

        {/* Description */}
        <p className="text-xs text-white/70 leading-relaxed mb-5 line-clamp-2 font-sans">
          {product.description}
        </p>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={() => onAddToCart(product)}
        className="w-full py-3 rounded-2xl bg-gradient-to-r from-brand-amethyst to-purple-600 hover:from-purple-600 hover:to-brand-amethyst font-sans text-xs font-bold uppercase tracking-wider text-white shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
      >
        <FaCartShopping className="size-4" />
        <span>Dodaj do Koszyka</span>
      </button>
    </div>
  );
}

export default function SklepPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-brand-black text-white flex items-center justify-center">Ładowanie Sklepu...</div>}>
      <SklepContent />
    </Suspense>
  );
}
