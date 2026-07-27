"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { INITIAL_SKATE_SPOTS, SkateSpot, SpotCategory, SpotReview } from "@/data/skateSpots";
import { useLanguage } from "@/context/LanguageContext";
import { 
  FaFire, 
  FaLocationDot, 
  FaPlus, 
  FaComments, 
  FaStar, 
  FaUsers, 
  FaXmark, 
  FaCheck, 
  FaLocationCrosshairs,
  FaClock,
  FaBoxArchive,
  FaCalendarDays,
  FaBolt,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaMagnifyingGlass,
  FaCity
} from "react-icons/fa6";
import clsx from "clsx";

const LOCAL_STORAGE_SPOTS_KEY = "sket_ok_custom_skate_spots";

export function SkateMap() {
  const { t } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // States
  const [spots, setSpots] = useState<SkateSpot[]>([]);
  const [activeMode, setActiveMode] = useState<"spots" | "editor">("spots");
  const [selectedCategory, setSelectedCategory] = useState<SpotCategory | "all" | "archive">("all");
  const [selectedSpot, setSelectedSpot] = useState<SkateSpot | null>(null);
  
  // Geolocation states
  const [isLocating, setIsLocating] = useState(false);
  const [geoStatus, setGeoStatus] = useState<"idle" | "granted" | "denied">("idle");
  const [locationError, setLocationError] = useState<string | null>(null);

  // Cat animation frame state
  const [catFrameIndex, setCatFrameIndex] = useState(0);
  const catImages = ["/images/cat-1.png", "/images/cat-2.png", "/images/cat-3.png"];

  // Live Feed LEFT Sidebar Panel state (Expanded by default on left side!)
  const [isLiveFeedOpen, setIsLiveFeedOpen] = useState(true);
  const [feedCityFilter, setFeedCityFilter] = useState<string>("all");
  const [feedCategoryFilter, setFeedCategoryFilter] = useState<SpotCategory | "all">("all");
  const [feedSearchQuery, setFeedSearchQuery] = useState("");

  // Add spot modal state (Editor Mode)
  const [isAddSpotModalOpen, setIsAddSpotModalOpen] = useState(false);
  const [newSpotCoords, setNewSpotCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [newSpotName, setNewSpotName] = useState("");
  const [newSpotCategory, setNewSpotCategory] = useState<SpotCategory>("skatepark");
  const [newSpotDesc, setNewSpotDesc] = useState("");
  const [eventDurationHours, setEventDurationHours] = useState<number>(6);

  // New review state inside spot modal
  const [newReviewText, setNewReviewText] = useState("");
  const [newReviewAuthor, setNewReviewAuthor] = useState("");
  const [newReviewEmoji, setNewReviewEmoji] = useState("🔥");

  // Cycle cat animation frames every 350ms
  useEffect(() => {
    const interval = setInterval(() => {
      setCatFrameIndex((prev) => (prev + 1) % catImages.length);
    }, 350);
    return () => clearInterval(interval);
  }, [catImages.length]);

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

  // Initialize Leaflet Map with smooth dark theme
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Warsaw center default
    const map = L.map(mapContainerRef.current, {
      center: [52.2297, 21.0122],
      zoom: 12,
      zoomControl: false,
    });

    // Sleek Dark CartoDB Tiles (high contrast street names, soft dark slate background)
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
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

  // Geolocation Handler
  const handleLocateUser = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolokalizacja nie jest wspierana przez Twoją przeglądarkę.");
      setGeoStatus("denied");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const map = mapInstanceRef.current;

        setGeoStatus("granted");

        if (map) {
          map.flyTo([latitude, longitude], 14, { duration: 1.5 });

          // Remove existing user marker if any
          if (userMarkerRef.current) {
            map.removeLayer(userMarkerRef.current);
          }

          // Blue pulsing user location marker
          const userIcon = L.divIcon({
            className: "user-location-marker",
            html: `
              <div class="relative flex items-center justify-center">
                <div class="absolute -inset-3 rounded-full bg-cyan-400/30 animate-ping"></div>
                <div class="size-7 rounded-full bg-cyan-400 border-2 border-white shadow-xl shadow-cyan-400/80 flex items-center justify-center">
                  <div class="size-2.5 rounded-full bg-white"></div>
                </div>
                <div class="absolute top-8 left-1/2 -translate-x-1/2 bg-black/90 text-cyan-300 text-[11px] font-sans font-bold px-2.5 py-0.5 rounded-full whitespace-nowrap shadow-md border border-cyan-500/40">
                  Ty jesteś tutaj 🛹
                </div>
              </div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          const userMarker = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
          userMarkerRef.current = userMarker;
        }

        setIsLocating(false);
      },
      (error) => {
        setIsLocating(false);
        setGeoStatus("denied");
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError("Dostęp do geolokalizacji został odrzucony.");
        } else {
          setLocationError("Nie udało się pobrać Twojej lokalizacji.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  // Auto-attempt geolocation on component mount
  useEffect(() => {
    const timer = setTimeout(() => {
      handleLocateUser();
    }, 600);
    return () => clearTimeout(timer);
  }, [handleLocateUser]);

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

  // Filter spots into Active vs Archived
  const now = Date.now();

  const isSpotExpired = useCallback((spot: SkateSpot) => {
    if (!spot.expiresAt) return false;
    return now >= spot.expiresAt;
  }, [now]);

  // Unique list of cities from spots
  const availableCities = useMemo(() => {
    const citiesSet = new Set<string>();
    spots.forEach((s) => {
      if (s.city) citiesSet.add(s.city);
    });
    return Array.from(citiesSet);
  }, [spots]);

  // Filtered spots for Live Feed
  const liveFeedSpots = useMemo(() => {
    return spots.filter((spot) => {
      if (feedCityFilter !== "all" && spot.city !== feedCityFilter) return false;
      if (feedCategoryFilter !== "all" && spot.category !== feedCategoryFilter) return false;
      if (feedSearchQuery.trim()) {
        const q = feedSearchQuery.toLowerCase();
        const matchName = spot.name.toLowerCase().includes(q);
        const matchDesc = spot.description.toLowerCase().includes(q);
        const matchAddress = spot.address.toLowerCase().includes(q);
        if (!matchName && !matchDesc && !matchAddress) return false;
      }
      return true;
    });
  }, [spots, feedCityFilter, feedCategoryFilter, feedSearchQuery]);

  // Update map markers when spots, category, or mode changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    markersGroup.clearLayers();

    const filtered = spots.filter((spot) => {
      const expired = isSpotExpired(spot);

      if (selectedCategory === "archive") {
        return expired;
      }

      // If not archived view, exclude expired spots from live map
      if (expired) return false;

      if (selectedCategory === "all") return true;
      return spot.category === selectedCategory;
    });

    filtered.forEach((spot) => {
      const expired = isSpotExpired(spot);

      const getCategoryBadge = () => {
        if (expired) {
          return { icon: "📁", bg: "bg-slate-700", border: "border-slate-500" };
        }
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
      const isEvent = spot.category === "event" && !expired;

      const customIcon = L.divIcon({
        className: "custom-skate-marker",
        html: `
          <div class="relative group cursor-pointer">
            ${isEvent ? `<div class="absolute -inset-2 rounded-full ${badge.bg}/40 animate-ping"></div>` : ""}
            <div class="size-11 rounded-2xl ${badge.bg} border-2 ${badge.border} flex items-center justify-center text-xl shadow-xl shadow-black/80 transition-transform duration-300 group-hover:scale-125">
              ${badge.icon}
            </div>
            <div class="absolute top-12 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[11px] font-sans font-bold px-2.5 py-1 rounded-full whitespace-nowrap shadow-xl border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
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
  }, [spots, selectedCategory, activeMode, isSpotExpired]);

  // Add new spot handler (Without City Input)
  function handleCreateSpot(e: React.FormEvent) {
    e.preventDefault();
    if (!newSpotCoords || !newSpotName.trim()) return;

    let expiresAt: number | undefined = undefined;
    if (newSpotCategory === "event" && eventDurationHours > 0) {
      expiresAt = Date.now() + eventDurationHours * 3600 * 1000;
    }

    const newSpot: SkateSpot = {
      id: `spot-custom-${Date.now()}`,
      name: newSpotName,
      category: newSpotCategory,
      lat: newSpotCoords.lat,
      lng: newSpotCoords.lng,
      address: `${newSpotCoords.lat.toFixed(4)}, ${newSpotCoords.lng.toFixed(4)}`,
      rating: 5.0,
      activeRidersCount: 1,
      description: newSpotDesc || "Nowo dodany spot przez społeczność SKET-OK!",
      image: "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=800&q=80",
      expiresAt,
      eventDate: newSpotCategory === "event" ? `Aktywne przez ${eventDurationHours}h` : undefined,
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

  // Format remaining time for temporary events
  function formatRemainingTime(expiresAt?: number) {
    if (!expiresAt) return null;
    const diff = expiresAt - Date.now();
    if (diff <= 0) return "Wydarzenie zakończone (W archiwum)";
    const hours = Math.floor(diff / (1000 * 3600));
    const mins = Math.floor((diff % (1000 * 3600)) / (1000 * 60));
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `Zostało: ${days} d. ${hours % 24}h`;
    }
    return `Zostało: ${hours}h ${mins}m`;
  }

  // Select spot from Live Feed drawer
  function handleSelectSpotFromFeed(spot: SkateSpot) {
    setSelectedSpot(spot);
    const map = mapInstanceRef.current;
    if (map) {
      map.flyTo([spot.lat, spot.lng], 14, { duration: 1.2 });
    }
  }

  const archivedCount = spots.filter(isSpotExpired).length;

  return (
    <div className="relative w-full h-[calc(100vh-80px)] mt-20 overflow-hidden bg-[#12161f] text-white font-sans">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Top Floating Header & Mode Switcher Tumbler */}
      <div className="absolute top-4 inset-x-4 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 z-30 flex flex-col items-center gap-3">
        {/* Mode Switcher Tumbler Bar */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-full bg-brand-black/90 backdrop-blur-xl border border-white/20 shadow-2xl shadow-black">
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

        {/* Category Filters + Archive Filter (Spots Mode) */}
        {activeMode === "spots" && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-full bg-brand-black/85 backdrop-blur-md border border-white/15 shadow-xl">
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
                    ? "bg-white/25 text-white border border-white/40 shadow"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                )}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}

            {/* Archive Filter Button */}
            <button
              onClick={() => setSelectedCategory("archive")}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer border",
                selectedCategory === "archive"
                  ? "bg-slate-700 text-white border-slate-400 shadow"
                  : "bg-white/5 text-slate-300 border-white/10 hover:text-white hover:bg-white/15"
              )}
            >
              <FaBoxArchive className="text-slate-400 size-3" />
              <span>Archiwum ({archivedCount})</span>
            </button>
          </div>
        )}

        {/* Editor Mode Notice */}
        {activeMode === "editor" && (
          <div className="px-4 py-2 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 font-sans text-xs font-bold animate-pulse backdrop-blur-md shadow-lg flex items-center gap-2">
            <FaPlus />
            <span>{t("map.clickToPlace")}</span>
          </div>
        )}
      </div>

      {/* Floating User Location GPS Button */}
      <div className="absolute bottom-24 right-4 z-30 flex flex-col gap-2 items-end">
        {locationError && (
          <div className="px-3 py-1.5 rounded-xl bg-rose-900/90 text-rose-200 text-xs font-bold border border-rose-500/40 shadow-lg animate-fade-in backdrop-blur-md max-w-xs">
            {locationError}
          </div>
        )}

        <button
          onClick={handleLocateUser}
          disabled={isLocating}
          title="Moja Lokalizacja"
          className="size-11 rounded-2xl bg-brand-black/90 hover:bg-brand-amethyst text-white border border-white/20 shadow-2xl flex items-center justify-center cursor-pointer transition-all hover:scale-110 active:scale-95 backdrop-blur-xl group"
        >
          <FaLocationCrosshairs
            className={clsx(
              "size-5 transition-transform group-hover:rotate-45",
              isLocating ? "animate-spin text-cyan-400" : "text-white"
            )}
          />
        </button>
      </div>

      {/* Cat Skater Banner when Geolocation is Off / Denied */}
      {geoStatus === "denied" && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 bg-brand-black/95 backdrop-blur-2xl border border-brand-amethyst/50 p-3.5 rounded-3xl shadow-2xl flex items-center justify-between gap-3 text-white animate-fade-in max-w-md w-full">
          {/* Animated Cycling Cat Image */}
          <div className="relative size-14 shrink-0 overflow-hidden rounded-2xl bg-white/10 border border-white/15 p-1 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={catImages[catFrameIndex]}
              alt="Cat Skater"
              className="w-full h-full object-contain transition-all duration-300"
              onError={() => {}}
            />
          </div>

          <div className="grow">
            <p className="text-xs font-bold text-white/90 leading-tight">
              {t("map.geoBannerText")}
            </p>
          </div>

          <button
            onClick={handleLocateUser}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-brand-amethyst to-purple-600 hover:from-purple-600 hover:to-brand-amethyst text-white font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer shrink-0 shadow-lg hover:scale-105"
          >
            {t("map.enableGeoBtn")}
          </button>
        </div>
      )}

      {/* LIVE FEED LEFT SIDEBAR PANEL (Placed on the left side of the screen) */}
      <div
        className={clsx(
          "absolute left-0 top-0 bottom-0 z-30 bg-brand-black/95 backdrop-blur-2xl border-r border-white/20 shadow-[10px_0_40px_rgba(0,0,0,0.8)] transition-all duration-500 flex flex-col pt-4",
          isLiveFeedOpen ? "w-80 md:w-96" : "w-12"
        )}
      >
        {/* Sidebar Header & Collapse/Expand Toggle */}
        <div className="px-3 pb-3 flex items-center justify-between border-b border-white/10 shrink-0">
          {isLiveFeedOpen ? (
            <div className="flex items-center gap-2 font-sans font-bold text-xs md:text-sm uppercase tracking-wider text-white">
              <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
              <FaBolt className="text-amber-400 size-4" />
              <span>Live Feed ({liveFeedSpots.length})</span>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center pt-2">
              <FaBolt className="text-amber-400 size-5 animate-pulse" />
            </div>
          )}

          <button
            onClick={() => setIsLiveFeedOpen(!isLiveFeedOpen)}
            title={isLiveFeedOpen ? "Zwiń panel" : "Rozwiń panel Live Feed"}
            className="size-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors shrink-0"
          >
            {isLiveFeedOpen ? <FaChevronLeft size={13} /> : <FaChevronRight size={13} />}
          </button>
        </div>

        {/* Live Feed Sidebar Content (Shown when expanded) */}
        {isLiveFeedOpen && (
          <div className="p-3.5 grow overflow-y-auto flex flex-col gap-3">
            {/* Filter Section */}
            <div className="flex flex-col gap-2.5 p-3 rounded-2xl bg-white/5 border border-white/10">
              {/* Search Bar */}
              <div className="relative w-full">
                <FaMagnifyingGlass className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 size-3.5" />
                <input
                  type="text"
                  placeholder="Szukaj spotu lub wydarzenia..."
                  value={feedSearchQuery}
                  onChange={(e) => setFeedSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/15 rounded-xl py-1.5 pl-8 pr-3 text-xs text-white placeholder-white/40 focus:outline-none focus:border-brand-amethyst"
                />
              </div>

              {/* City Filter Dropdown */}
              <div className="flex items-center gap-2">
                <FaCity className="text-brand-pale size-3.5 shrink-0" />
                <select
                  value={feedCityFilter}
                  onChange={(e) => setFeedCityFilter(e.target.value)}
                  className="w-full bg-brand-black border border-white/20 rounded-xl py-1.5 px-3 text-xs text-white font-bold focus:outline-none focus:border-brand-amethyst cursor-pointer"
                >
                  <option value="all">Wszystkie Miasta</option>
                  {availableCities.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap items-center gap-1">
                <FaFilter className="text-amber-400 size-3 shrink-0 mr-1" />
                {[
                  { id: "all", label: "Wszystkie" },
                  { id: "event", label: "🔥 Wydarzenia" },
                  { id: "skatepark", label: "🛹 Skateparki" },
                  { id: "street", label: "🏙️ Street" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setFeedCategoryFilter(cat.id as SpotCategory | "all")}
                    className={clsx(
                      "px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer",
                      feedCategoryFilter === cat.id
                        ? "bg-brand-amethyst text-white shadow"
                        : "text-white/60 hover:text-white hover:bg-white/10"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Feed List Items */}
            {liveFeedSpots.length === 0 ? (
              <p className="text-xs text-white/40 italic text-center py-8">
                Brak wydarzeń spełniających kryteria wyszukiwania.
              </p>
            ) : (
              <div className="flex flex-col gap-2.5">
                {liveFeedSpots.map((spot) => (
                  <div
                    key={spot.id}
                    onClick={() => handleSelectSpotFromFeed(spot)}
                    className="p-3 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 hover:border-brand-amethyst/60 transition-all cursor-pointer flex items-center gap-3 group shadow-md"
                  >
                    {/* Spot Thumbnail */}
                    <div className="relative size-14 rounded-xl overflow-hidden shrink-0 border border-white/10">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={spot.image}
                        alt={spot.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={() => {}}
                      />
                    </div>

                    {/* Spot Info */}
                    <div className="grow min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={clsx(
                          "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider",
                          spot.category === "event" ? "bg-rose-500/30 text-rose-300 border border-rose-500/50" : "bg-brand-amethyst/30 text-purple-300 border border-brand-amethyst/50"
                        )}>
                          {spot.category}
                        </span>
                        {spot.city && (
                          <span className="text-[10px] text-white/50 truncate">
                            {spot.city}
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-white truncate group-hover:text-brand-pale transition-colors">
                        {spot.name}
                      </h4>

                      <div className="flex items-center justify-between text-[10px] text-white/60 mt-1">
                        <span className="flex items-center gap-1">
                          <FaStar className="text-yellow-400 size-2.5" />
                          {spot.rating.toFixed(1)}
                        </span>
                        <span className="flex items-center gap-1 font-bold text-amber-300">
                          🔥 {spot.reactions.fire + spot.reactions.skate}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
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
                  {isSpotExpired(selectedSpot) && " (ARCHIWUM)"}
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

            {/* Event Banner / Live Countdown Timer */}
            {selectedSpot.category === "event" && (
              <div className={clsx(
                "p-3 mb-4 rounded-xl border text-xs font-bold flex flex-col gap-1",
                isSpotExpired(selectedSpot)
                  ? "bg-slate-800/80 border-slate-600 text-slate-300"
                  : "bg-gradient-to-r from-rose-500/20 to-purple-500/20 border-rose-500/50 text-rose-300"
              )}>
                <div className="flex items-center gap-2">
                  <FaFire className="text-rose-400 size-4 shrink-0" />
                  <span>Wydarzenie / Сходка</span>
                </div>
                {selectedSpot.expiresAt && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-300 mt-0.5">
                    <FaClock className="size-3" />
                    <span>{formatRemainingTime(selectedSpot.expiresAt)}</span>
                  </div>
                )}
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

      {/* Modal: Add New Spot (Editor Mode - WITHOUT CITY INPUT) */}
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
                  <option value="event">🔥 Wydarzenie / Сходка (Czasowe)</option>
                  <option value="diy">🛠️ DIY Spot</option>
                </select>
              </div>

              {/* Event Expiration Picker (Only shown when category is Event/Сходка) */}
              {newSpotCategory === "event" && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <label className="block text-xs font-bold uppercase text-amber-300 mb-1.5 flex items-center gap-1.5">
                    <FaCalendarDays className="size-3.5" />
                    <span>Czas trwania сходки (Wygasa i trafia do archiwum)</span>
                  </label>
                  <select
                    value={eventDurationHours}
                    onChange={(e) => setEventDurationHours(Number(e.target.value))}
                    className="w-full bg-brand-black border border-amber-500/40 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value={3}>3 godziny (Szybka сходка)</option>
                    <option value={6}>6 godzin (Popołudniowa sesja)</option>
                    <option value={12}>12 godzin (Cały dzień)</option>
                    <option value={24}>24 godziny (1 dzień)</option>
                    <option value={72}>3 dni (Weekendowy jam)</option>
                    <option value={0}>Bez limitu czasu (Stałe)</option>
                  </select>
                </div>
              )}

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
