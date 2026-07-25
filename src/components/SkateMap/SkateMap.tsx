"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { INITIAL_SKATE_SPOTS, SkateSpot, SpotCategory, SpotReview } from "@/data/skateSpots";
import { useLanguage } from "@/context/LanguageContext";
import { FaFire, FaLocationDot, FaPlus, FaComments, FaStar, FaUsers, FaXmark, FaCheck } from "react-icons/fa6";
import clsx from "clsx";

const LOCAL_STORAGE_SPOTS_KEY = "sket_ok_custom_skate_spots";

export function SkateMap() {
  const { t } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  // States
  const [spots, setSpots] = useState<SkateSpot[]>([]);
  const [activeMode, setActiveMode] = useState<"spots" | "editor">("spots");
  const [selectedCategory, setSelectedCategory] = useState<SpotCategory | "all">("all");
  const [selectedSpot, setSelectedSpot] = useState<SkateSpot | null>(null);

  // Add spot modal state (Editor Mode)
  const [isAddSpotModalOpen, setIsAddSpotModalOpen] = useState(false);
  const [newSpotCoords, setNewSpotCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [newSpotName, setNewSpotName] = useState("");
  const [newSpotCategory, setNewSpotCategory] = useState<SpotCategory>("skatepark");
  const [newSpotDesc, setNewSpotDesc] = useState("");
  const [newSpotCity, setNewSpotCity] = useState("Warszawa");

  // New review state inside spot modal
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewAuthor, setNewReviewAuthor] = useState("");
  const [newReviewEmoji, setNewReviewEmoji] = useState("🔥");

  // Load spots from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_SPOTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSpots([...INITIAL_SKATE_SPOTS, ...parsed]);
      } else {
        setSpots(INITIAL_SKATE_SPOTS);
      }
    } catch {
      setSpots(INITIAL_SKATE_SPOTS);
    }
  }, []);

  // Save custom spots to localStorage
  const saveSpots = useCallback((updatedSpots: SkateSpot[]) => {
    setSpots(updatedSpots);
    const customOnly = updatedSpots.filter((s) => !INITIAL_SKATE_SPOTS.some((init) => init.id === s.id));
    localStorage.setItem(LOCAL_STORAGE_SPOTS_KEY, JSON.stringify(customOnly));
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Warsaw center default
    const map = L.map(mapContainerRef.current, {
      center: [52.2297, 21.0122],
      zoom: 12,
      zoomControl: false,
    });

    // Crisp Light Voyager CartoDB Tiles (high contrast, clear street names & roads)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
      subdomains: "abcd",
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    }).addTo(map);

    // Zoom control at bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    markersGroupRef.current = L.layerGroup().addTo(map);
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle map clicks in Editor Mode
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    function handleMapClick(e: L.LeafletMouseEvent) {
      if (activeMode === "editor") {
        setNewSpotCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        setIsAddSpotModalOpen(true);
      }
    }

    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [activeMode]);

  // Update map markers when spots, category, or mode changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    const filtered = spots.filter((spot) => {
      if (selectedCategory === "all") return true;
      return spot.category === selectedCategory;
    });

    filtered.forEach((spot) => {
      const getCategoryBadge = () => {
        switch (spot.category) {
          case "skatepark":
            return { icon: "🛹", bg: "bg-emerald-500", border: "border-emerald-400" };
          case "street":
            return { icon: "🏙️", bg: "bg-purple-600", border: "border-brand-amethyst" };
          case "event":
            return { icon: "🔥", bg: "bg-rose-500", border: "border-rose-400" };
          case "diy":
            return { icon: "🛠️", bg: "bg-amber-500", border: "border-amber-400" };
        }
      };

      const badge = getCategoryBadge();
      const isEvent = spot.category === "event";

      const customIcon = L.divIcon({
        className: "custom-skate-marker",
        html: `
          <div class="relative group cursor-pointer">
            ${isEvent ? `<div class="absolute -inset-2 rounded-full ${badge.bg}/40 animate-ping"></div>` : ""}
            <div class="size-11 rounded-2xl ${badge.bg} border-2 ${badge.border} flex items-center justify-center text-xl shadow-xl shadow-black/80 transition-transform duration-300 group-hover:scale-125">
              ${badge.icon}
            </div>
            <div class="absolute top-12 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[11px] font-sans font-bold px-2 py-0.5 rounded-full whitespace-nowrap shadow-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              ${spot.name}
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const marker = L.marker([spot.lat, spot.lng], { icon: customIcon });
      marker.on("click", () => {
        setSelectedSpot(spot);
        map.flyTo([spot.lat, spot.lng], 14, { duration: 1.2 });
      });

      markersGroup.addLayer(marker);
    });
  }, [spots, selectedCategory, activeMode]);

  // Add new spot handler
  function handleCreateSpot(e: React.FormEvent) {
    e.preventDefault();
    if (!newSpotCoords || !newSpotName.trim()) return;

    const newSpot: SkateSpot = {
      id: `spot-custom-${Date.now()}`,
      name: newSpotName,
      category: newSpotCategory,
      lat: newSpotCoords.lat,
      lng: newSpotCoords.lng,
      city: newSpotCity || "Polska",
      address: `${newSpotCoords.lat.toFixed(4)}, ${newSpotCoords.lng.toFixed(4)}`,
      rating: 5.0,
      activeRidersCount: 1,
      description: newSpotDesc || "Nowo dodany spot przez społeczność SKET-OK!",
      image: "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=800&q=80",
      reactions: { fire: 1, skate: 1, shaka: 1, lightning: 1, trophy: 0 },
      reviews: [],
    };

    saveSpots([newSpot, ...spots]);
    setIsAddSpotModalOpen(false);
    setSelectedSpot(newSpot);

    // Reset form
    setNewSpotName("");
    setNewSpotDesc("");
  }

  // Handle reaction increments
  function handleReaction(reactionKey: keyof SkateSpot["reactions"]) {
    if (!selectedSpot) return;

    const updatedSpots = spots.map((s) => {
      if (s.id === selectedSpot.id) {
        return {
          ...s,
          reactions: {
            ...s.reactions,
            [reactionKey]: s.reactions[reactionKey] + 1,
          },
        };
      }
      return s;
    });

    saveSpots(updatedSpots);
    setSelectedSpot({
      ...selectedSpot,
      reactions: {
        ...selectedSpot.reactions,
        [reactionKey]: selectedSpot.reactions[reactionKey] + 1,
      },
    });
  }

  // Handle submitting new review
  function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSpot || !newReviewText.trim()) return;

    const newRev: SpotReview = {
      id: `rev-${Date.now()}`,
      author: newReviewAuthor.trim() || "Rider SKET-OK",
      text: newReviewText,
      date: "Przed chwilą",
      emoji: newReviewEmoji,
      rating: 5,
    };

    const updatedSpots = spots.map((s) => {
      if (s.id === selectedSpot.id) {
        return {
          ...s,
          reviews: [newRev, ...s.reviews],
        };
      }
      return s;
    });

    saveSpots(updatedSpots);
    setSelectedSpot({
      ...selectedSpot,
      reviews: [newRev, ...selectedSpot.reviews],
    });

    setNewReviewText("");
    setNewReviewAuthor("");
  }

  return (
    <div className="relative w-full h-[calc(100vh-80px)] mt-20 overflow-hidden bg-brand-black text-white font-sans">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Header & Mode Switcher Tumbler */}
      <div className="absolute top-4 inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-30 flex flex-col items-center gap-3">
        {/* Mode Switcher Tumbler Bar */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-brand-black/85 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black">
          <button
            onClick={() => setActiveMode("spots")}
            className={clsx(
              "flex items-center gap-2 px-5 py-2 rounded-full font-sans text-xs md:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer",
              activeMode === "spots"
                ? "bg-gradient-to-r from-brand-amethyst to-purple-600 text-white shadow-lg shadow-brand-amethyst/40"
                : "text-white/70 hover:text-white hover:bg-white/10"
            )}
          >
            <FaLocationDot className="text-brand-pale" />
            <span>{t("map.modeSpots")}</span>
          </button>

          <button
            onClick={() => setActiveMode("editor")}
            className={clsx(
              "flex items-center gap-2 px-5 py-2 rounded-full font-sans text-xs md:text-sm font-bold uppercase tracking-wider transition-all cursor-pointer",
              activeMode === "editor"
                ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/40"
                : "text-white/70 hover:text-white hover:bg-white/10"
            )}
          >
            <FaPlus className="text-amber-300" />
            <span>{t("map.modeEditor")}</span>
          </button>
        </div>

        {/* Category Filters (Spots Mode) */}
        {activeMode === "spots" && (
          <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-full bg-brand-black/75 backdrop-blur-md border border-white/10 shadow-lg">
            {[
              { id: "all", label: t("map.all"), icon: "🌍" },
              { id: "skatepark", label: t("map.skateparks"), icon: "🛹" },
              { id: "street", label: t("map.street"), icon: "🏙️" },
              { id: "event", label: t("map.events"), icon: "🔥" },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as SpotCategory | "all")}
                className={clsx(
                  "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer",
                  selectedCategory === cat.id
                    ? "bg-white/20 text-white border border-white/40 shadow"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Editor Mode Instruction Notice */}
        {activeMode === "editor" && (
          <div className="px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-sans text-xs font-bold animate-pulse backdrop-blur-md shadow-lg flex items-center gap-2">
            <FaPlus />
            <span>{t("map.clickToPlace")}</span>
          </div>
        )}
      </div>

      {/* Spot Detail Modal / Drawer */}
      {selectedSpot && (
        <div className="absolute inset-y-0 right-0 z-40 w-full md:w-[420px] bg-texture bg-brand-black/95 backdrop-blur-2xl border-l border-white/15 p-6 overflow-y-auto flex flex-col justify-between shadow-2xl animate-fade-in">
          <div>
            {/* Header & Close Button */}
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brand-amethyst/30 border border-brand-amethyst/60 text-purple-300 mb-2">
                  {selectedSpot.category.toUpperCase()}
                </span>
                <h2 className="text-xl font-bold font-sans text-white leading-tight">
                  {selectedSpot.name}
                </h2>
                <p className="text-xs text-white/60 flex items-center gap-1 mt-1">
                  <FaLocationDot className="text-brand-pale size-3 shrink-0" />
                  <span>{selectedSpot.address}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedSpot(null)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              >
                <FaXmark size={18} />
              </button>
            </div>

            {/* Photo */}
            <div className="relative aspect-video rounded-2xl overflow-hidden mb-4 border border-white/10 shadow-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedSpot.image}
                alt={selectedSpot.name}
                className="w-full h-full object-cover"
                onError={() => {}}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs text-white">
                <span className="flex items-center gap-1 bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-sm">
                  <FaStar className="text-yellow-400 size-3" />
                  {selectedSpot.rating.toFixed(1)}
                </span>
                <span className="flex items-center gap-1 bg-black/60 px-2.5 py-1 rounded-full backdrop-blur-sm text-emerald-400 font-bold">
                  <FaUsers className="size-3" />
                  {selectedSpot.activeRidersCount} riderów wczoraj
                </span>
              </div>
            </div>

            {/* Event Banner (if event) */}
            {selectedSpot.eventDate && (
              <div className="p-3 mb-4 rounded-xl bg-gradient-to-r from-rose-500/20 to-purple-500/20 border border-rose-500/50 text-rose-300 font-sans text-xs font-bold flex items-center gap-2">
                <FaFire className="text-rose-400 size-4 shrink-0" />
                <span>Wydarzenie: {selectedSpot.eventDate}</span>
              </div>
            )}

            {/* Description */}
            <p className="text-sm text-white/80 leading-relaxed mb-6 font-sans">
              {selectedSpot.description}
            </p>

            {/* Emoji Reactions Bar */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-2.5 flex items-center gap-2">
                <FaFire className="text-amber-400" />
                <span>Reakcje społeczności</span>
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { key: "fire", emoji: "🔥", count: selectedSpot.reactions.fire },
                  { key: "skate", emoji: "🛹", count: selectedSpot.reactions.skate },
                  { key: "shaka", emoji: "🤙", count: selectedSpot.reactions.shaka },
                  { key: "lightning", emoji: "⚡", count: selectedSpot.reactions.lightning },
                  { key: "trophy", emoji: "🏆", count: selectedSpot.reactions.trophy },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => handleReaction(item.key as keyof SkateSpot["reactions"])}
                    className="flex flex-col items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-brand-amethyst transition-all cursor-pointer hover:scale-105"
                  >
                    <span className="text-xl mb-0.5">{item.emoji}</span>
                    <span className="text-[10px] font-bold text-white/80">{item.count}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Community Reviews */}
            <div className="mb-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/60 mb-3 flex items-center gap-2">
                <FaComments className="text-brand-pale" />
                <span>Opinie riderów ({selectedSpot.reviews.length})</span>
              </h3>

              {selectedSpot.reviews.length === 0 ? (
                <p className="text-xs text-white/40 italic">Brak opinii. Bądź pierwszym, który doda wpis!</p>
              ) : (
                <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-1">
                  {selectedSpot.reviews.map((rev) => (
                    <div key={rev.id} className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                      <div className="flex items-center justify-between text-white/70 mb-1">
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <span>{rev.emoji}</span>
                          <span>{rev.author}</span>
                        </span>
                        <span className="text-[10px] text-white/40">{rev.date}</span>
                      </div>
                      <p className="text-white/80">{rev.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Review Form */}
              <form onSubmit={handleAddReview} className="mt-3 flex flex-col gap-2">
                <input
                  type="text"
                  placeholder="Twoje imię / nick"
                  value={newReviewAuthor}
                  onChange={(e) => setNewReviewAuthor(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl py-2 px-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brand-amethyst"
                />
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder={t("map.writeComment")}
                    value={newReviewText}
                    onChange={(e) => setNewReviewText(e.target.value)}
                    className="grow bg-white/5 border border-white/15 rounded-xl py-2 px-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brand-amethyst"
                  />
                  <select
                    value={newReviewEmoji}
                    onChange={(e) => setNewReviewEmoji(e.target.value)}
                    className="bg-white/10 border border-white/20 rounded-xl px-2 text-base focus:outline-none"
                  >
                    <option value="🔥">🔥</option>
                    <option value="🛹">🛹</option>
                    <option value="🤙">🤙</option>
                    <option value="⚡">⚡</option>
                    <option value="🏆">🏆</option>
                  </select>
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-brand-amethyst hover:bg-purple-600 text-white font-sans text-xs font-bold uppercase transition-all cursor-pointer shrink-0"
                  >
                    <FaCheck />
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      )}

      {/* Modal: Add New Spot (Editor Mode) */}
      {isAddSpotModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-texture bg-brand-black border border-white/20 rounded-3xl p-6 shadow-2xl text-white">
            <button
              onClick={() => setIsAddSpotModalOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <FaXmark size={18} />
            </button>

            <h2 className="text-xl font-bold font-sans text-white mb-1">
              Dodaj Nowy Spot na Mapie
            </h2>
            <p className="text-xs text-white/60 mb-5">
              Współrzędne: {newSpotCoords?.lat.toFixed(4)}, {newSpotCoords?.lng.toFixed(4)}
            </p>

            <form onSubmit={handleCreateSpot} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1">
                  {t("map.spotName")}
                </label>
                <input
                  type="text"
                  required
                  placeholder="np. Ledge przy Teatrze / DIY Bowl"
                  value={newSpotName}
                  onChange={(e) => setNewSpotName(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl py-2.5 px-3.5 text-white placeholder-white/30 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1">
                  {t("map.spotType")}
                </label>
                <select
                  value={newSpotCategory}
                  onChange={(e) => setNewSpotCategory(e.target.value as SpotCategory)}
                  className="w-full bg-brand-black border border-white/15 rounded-xl py-2.5 px-3.5 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="skatepark">🛹 Skatepark / Bowl</option>
                  <option value="street">🏙️ Street Spot / Murki</option>
                  <option value="event">🔥 Wydarzenie / Сходка</option>
                  <option value="diy">🛠️ DIY Spot</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1">
                  Miasto
                </label>
                <input
                  type="text"
                  placeholder="np. Warszawa"
                  value={newSpotCity}
                  onChange={(e) => setNewSpotCity(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl py-2.5 px-3.5 text-white placeholder-white/30 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1">
                  {t("map.spotDescription")}
                </label>
                <textarea
                  rows={3}
                  placeholder="Opisz nawierzchnię, przeszkody, godziny lub zorganizowaną сходkę..."
                  value={newSpotDesc}
                  onChange={(e) => setNewSpotDesc(e.target.value)}
                  className="w-full bg-white/5 border border-white/15 rounded-xl py-2.5 px-3.5 text-white placeholder-white/30 focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 font-sans text-sm font-bold uppercase tracking-wider text-white shadow-lg cursor-pointer hover:scale-[1.02] transition-transform mt-2"
              >
                Dodaj Spot do Mapy
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
