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
  FaCity,
  FaTrash,
  FaPenToSquare,
  FaShieldHalved,
  FaUser
} from "react-icons/fa6";
import clsx from "clsx";
import { useAuth } from "@/context/AuthContext";

const LOCAL_STORAGE_SPOTS_KEY = "sket_ok_custom_skate_spots";
const ADMIN_EMAIL = "dimonkrasula5@gmail.com";

export function SkateMap() {
  const { t } = useLanguage();
  const { user } = useAuth();
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

  // Live 1-second ticker for real-time UTC countdown
  const [, setTicker] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setTicker((t) => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Cycle cat animation frames every 350ms
  useEffect(() => {
    const interval = setInterval(() => {
      setCatFrameIndex((prev) => (prev + 1) % catImages.length);
    }, 350);
    return () => clearInterval(interval);
  }, [catImages.length]);

  // Dynamic Authorized Admin Emails List State (Saved in localStorage)
  const [adminEmails, setAdminEmails] = useState<string[]>([ADMIN_EMAIL]);
  const [newAdminEmailInput, setNewAdminEmailInput] = useState("");
  const [adminManageError, setAdminManageError] = useState("");

  // Restore Authorized Admin Emails from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("sket_ok_authorized_admin_emails");
      if (stored) {
        const parsed: string[] = JSON.parse(stored);
        if (!parsed.map(e => e.toLowerCase()).includes(ADMIN_EMAIL)) {
          parsed.push(ADMIN_EMAIL);
        }
        setAdminEmails(parsed);
      }
    } catch {
      setAdminEmails([ADMIN_EMAIL]);
    }
  }, []);

  // Save Admin Emails to localStorage
  function saveAdminEmails(emails: string[]) {
    setAdminEmails(emails);
    try {
      localStorage.setItem("sket_ok_authorized_admin_emails", JSON.stringify(emails));
    } catch (e) {
      console.error("Failed to save admin emails to localStorage", e);
    }
  }

  // Check if current logged-in user is an authorized admin
  const currentEmailClean = user?.email?.toLowerCase().trim();
  const isAdmin = !!currentEmailClean && adminEmails.some((e) => e.toLowerCase().trim() === currentEmailClean);

  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Edit Spot Modal state (Admin)
  const [editingSpot, setEditingSpot] = useState<SkateSpot | null>(null);

  // Add new email to Admin list
  function handleAddAdminEmail(e: React.FormEvent) {
    e.preventDefault();
    setAdminManageError("");
    const cleanInput = newAdminEmailInput.toLowerCase().trim();
    if (!cleanInput || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanInput)) {
      setAdminManageError("Wpisz poprawny adres e-mail.");
      return;
    }
    if (adminEmails.map(e => e.toLowerCase()).includes(cleanInput)) {
      setAdminManageError("Ten adres e-mail już posiada uprawnienia Admina.");
      return;
    }
    const updated = [...adminEmails, cleanInput];
    saveAdminEmails(updated);
    setNewAdminEmailInput("");
  }

  // Remove email from Admin list
  function handleRemoveAdminEmail(emailToRemove: string) {
    if (emailToRemove.toLowerCase().trim() === ADMIN_EMAIL) {
      alert("Nie możesz usunąć głównego administratora (Dimonkrasula5@gmail.com).");
      return;
    }
    const updated = adminEmails.filter((e) => e.toLowerCase().trim() !== emailToRemove.toLowerCase().trim());
    saveAdminEmails(updated);
  }

  // Admin: Delete spot / event
  function handleDeleteSpot(spotId: string) {
    if (!isAdmin) return;
    const updated = spots.filter((s) => s.id !== spotId);
    saveSpots(updated);
    if (selectedSpot?.id === spotId) {
      setSelectedSpot(null);
    }
  }

  // Admin: Delete review / comment
  function handleDeleteReview(spotId: string, reviewId: string) {
    if (!isAdmin) return;
    const updated = spots.map((s) => {
      if (s.id === spotId) {
        return {
          ...s,
          reviews: s.reviews.filter((r) => r.id !== reviewId),
        };
      }
      return s;
    });
    saveSpots(updated);
    if (selectedSpot?.id === spotId) {
      setSelectedSpot({
        ...selectedSpot,
        reviews: selectedSpot.reviews.filter((r) => r.id !== reviewId),
      });
    }
  }

  // Admin: Save edited spot
  function handleSaveSpotEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingSpot || !isAdmin) return;

    const updated = spots.map((s) => (s.id === editingSpot.id ? editingSpot : s));
    saveSpots(updated);
    setSelectedSpot(editingSpot);
    setEditingSpot(null);
  }

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
      if (activeMode === "editor" && isAdmin) {
        setNewSpotCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
        setIsAddSpotModalOpen(true);
      }
    }

    map.on("click", handleMapClick);
    return () => {
      map.off("click", handleMapClick);
    };
  }, [activeMode, isAdmin]);

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

  // Filtered spots for Live Feed (Synchronized with Map Filters)
  const liveFeedSpots = useMemo(() => {
    return spots.filter((spot) => {
      const expired = isSpotExpired(spot);

      // Map filter sync
      if (selectedCategory === "archive") {
        if (!expired) return false;
      } else {
        if (expired) return false;
        if (selectedCategory !== "all" && spot.category !== selectedCategory) return false;
      }

      // Sidebar specific filters
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
  }, [spots, selectedCategory, feedCityFilter, feedCategoryFilter, feedSearchQuery, isSpotExpired]);

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
          case "shop":
            return { icon: "🏬", bg: "bg-cyan-500", border: "border-cyan-400" };
          default:
            return { icon: "📍", bg: "bg-purple-600", border: "border-brand-amethyst" };
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

  // Check-in / Join Session at spot
  const [checkedInSpots, setCheckedInSpots] = useState<Record<string, boolean>>({});

  function handleCheckIn(spot: SkateSpot) {
    if (checkedInSpots[spot.id]) return;

    const updatedSpots = spots.map((s) => {
      if (s.id === spot.id) {
        return {
          ...s,
          activeRidersCount: s.activeRidersCount + 1,
        };
      }
      return s;
    });

    saveSpots(updatedSpots);
    setSelectedSpot({
      ...spot,
      activeRidersCount: spot.activeRidersCount + 1,
    });

    setCheckedInSpots((prev) => ({ ...prev, [spot.id]: true }));
  }

  // Handle submitting new review
  function handleAddReview(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedSpot || !newReviewText.trim()) return;

    const authorName = user ? user.name : (newReviewAuthor.trim() || "Rider SKET-OK");
    const authorAvatar = user ? user.avatar : undefined;

    const newRev: SpotReview = {
      id: `rev-${Date.now()}`,
      author: authorName,
      avatar: authorAvatar,
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

  // Format remaining time for temporary events tied to global UTC clock
  function formatRemainingTime(expiresAt?: number) {
    if (!expiresAt) return null;
    const diff = expiresAt - Date.now();
    if (diff <= 0) return "Wydarzenie zakończone (W archiwum)";
    const hours = Math.floor(diff / (1000 * 3600));
    const mins = Math.floor((diff % (1000 * 3600)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `Zostało: ${days} d. ${hours % 24}h ${mins}m`;
    }
    return `Zostało: ${hours}h ${mins}m ${secs}s`;
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

          {/* Editor mode button (ONLY VISIBLE FOR AUTHORIZED ADMIN EMAILS) */}
          {isAdmin && (
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
          )}

          {/* Admin Moderation Mode Button (ONLY VISIBLE FOR AUTHORIZED ADMIN EMAILS) */}
          {isAdmin && (
            <button
              onClick={() => setIsAdminModalOpen(true)}
              title={`Aktywny Tryb Admina (${user?.email})`}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full font-sans text-xs font-bold uppercase tracking-wider transition-all cursor-pointer border bg-rose-600/30 text-rose-300 border-rose-500/60 shadow-lg animate-pulse"
            >
              <span>👑 Admin ON</span>
            </button>
          )}
        </div>

        {/* Category Filters + Archive Filter (Spots Mode) */}
        {activeMode === "spots" && (
          <div className="flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-full bg-brand-black/85 backdrop-blur-md border border-white/15 shadow-xl">
            {[
              { id: "all", label: t("map.all"), icon: "🌍" },
              { id: "skatepark", label: t("map.skateparks"), icon: "🛹" },
              { id: "street", label: t("map.street"), icon: "🏙️" },
              { id: "event", label: t("map.events"), icon: "🔥" },
              { id: "shop", label: "🏬 Skateshopy & Serwis", icon: "🏬" },
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

      {/* Floating Toggle Button to re-open Live Feed when collapsed 100% */}
      {!isLiveFeedOpen && (
        <button
          onClick={() => setIsLiveFeedOpen(true)}
          title="Otwórz Live Feed"
          className="absolute left-3 top-24 z-30 px-3.5 py-2.5 rounded-2xl bg-brand-black/90 hover:bg-brand-amethyst text-white border border-white/20 shadow-2xl flex items-center gap-2 cursor-pointer transition-all hover:scale-105 backdrop-blur-xl group"
        >
          <FaBolt className="text-amber-400 size-4 animate-pulse group-hover:scale-110" />
          <span className="font-sans text-xs font-bold uppercase tracking-wider hidden sm:inline">Live Feed ({liveFeedSpots.length})</span>
          <FaChevronRight size={12} className="text-white/70" />
        </button>
      )}

      {/* LIVE FEED LEFT SIDEBAR PANEL (Clean 100% translate slide-out) */}
      <div
        className={clsx(
          "absolute left-0 top-0 bottom-0 z-40 bg-brand-black/95 backdrop-blur-2xl border-r border-white/20 shadow-[10px_0_40px_rgba(0,0,0,0.8)] transition-transform duration-300 flex flex-col pt-4 w-80 md:w-96 max-w-[85vw]",
          isLiveFeedOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header & Collapse Toggle */}
        <div className="px-4 pb-3 flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 font-sans font-bold text-xs md:text-sm uppercase tracking-wider text-white">
            <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
            <FaBolt className="text-amber-400 size-4" />
            <span>Live Feed ({liveFeedSpots.length})</span>
          </div>

          <button
            onClick={() => setIsLiveFeedOpen(false)}
            title="Zamknij panel"
            className="size-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer transition-colors shrink-0"
          >
            <FaChevronLeft size={13} />
          </button>
        </div>

        {/* Live Feed Sidebar Content */}
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
                { id: "shop", label: "🏬 Skateshopy" },
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
                  className={clsx(
                    "p-3 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 group shadow-md",
                    selectedSpot?.id === spot.id
                      ? "bg-brand-amethyst/30 border-brand-amethyst shadow-lg shadow-purple-950/80 ring-1 ring-brand-amethyst"
                      : "bg-white/5 hover:bg-white/15 border-white/10 hover:border-brand-amethyst/60"
                  )}
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
                  <span>Wydarzenie Spotowe</span>
                </div>
                {selectedSpot.expiresAt && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-300 mt-0.5">
                    <FaClock className="size-3" />
                    <span>{formatRemainingTime(selectedSpot.expiresAt)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons: Check-in / Join Session & Google Maps Navigation */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <button
                onClick={() => handleCheckIn(selectedSpot)}
                disabled={checkedInSpots[selectedSpot.id]}
                className={clsx(
                  "py-2.5 px-3 rounded-xl font-sans text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md",
                  checkedInSpots[selectedSpot.id]
                    ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-300"
                    : "bg-gradient-to-r from-brand-amethyst to-purple-600 hover:from-purple-600 hover:to-brand-amethyst text-white border border-brand-amethyst/50 hover:scale-[1.02]"
                )}
              >
                <FaUsers className="size-3.5" />
                <span>{checkedInSpots[selectedSpot.id] ? "Jestem na spocie! ✓" : "Dołącz do Sesji"}</span>
              </button>

              <button
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${selectedSpot.lat},${selectedSpot.lng}`,
                    "_blank"
                  )
                }
                className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-sans text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer hover:scale-[1.02]"
              >
                <FaLocationCrosshairs className="size-3.5 text-cyan-400" />
                <span>Nawiguj (Nawigacja)</span>
              </button>
            </div>

            {/* Admin Moderation Control Panel (Only visible when Admin Mode ON) */}
            {isAdmin && (
              <div className="p-3 mb-4 rounded-2xl bg-rose-950/60 border border-rose-500/50 text-white flex flex-col gap-2 shadow-xl animate-fade-in">
                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-300 uppercase tracking-wider">
                  <FaShieldHalved className="size-4" />
                  <span>Panel Moderacji Admina</span>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <button
                    onClick={() => setEditingSpot({ ...selectedSpot })}
                    className="py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-amber-200 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FaPenToSquare className="size-3.5 text-amber-300" />
                    <span>Edytuj Spot</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Czy na pewno chcesz usunąć spot "${selectedSpot.name}"?`)) {
                        handleDeleteSpot(selectedSpot.id);
                      }
                    }}
                    className="py-2 px-3 rounded-xl bg-rose-600/40 hover:bg-rose-600/60 border border-rose-500/70 text-rose-100 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <FaTrash className="size-3.5 text-rose-300" />
                    <span>Usuń Spot</span>
                  </button>
                </div>
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
                    <div key={rev.id} className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs relative group">
                      <div className="flex items-center justify-between text-white/70 mb-1">
                        <span className="font-bold text-white flex items-center gap-2">
                          {rev.avatar ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={rev.avatar} alt={rev.author} className="size-6 rounded-full object-cover border border-brand-amethyst/60 shadow-sm shrink-0" />
                          ) : (
                            <div className="size-6 rounded-full bg-brand-amethyst/25 border border-brand-amethyst/50 flex items-center justify-center text-xs shrink-0 font-bold">
                              {rev.emoji || "🛹"}
                            </div>
                          )}
                          <span>{rev.author}</span>
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-white/40">{rev.date}</span>
                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteReview(selectedSpot.id, rev.id)}
                              title="Usuń komentarz (Admin)"
                              className="text-rose-400 hover:text-rose-300 p-0.5 transition-colors cursor-pointer"
                            >
                              <FaTrash className="size-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-white/80 pl-8">{rev.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Add Review Form */}
              <form onSubmit={handleAddReview} className="mt-3 flex flex-col gap-2">
                {!user ? (
                  <input
                    type="text"
                    placeholder="Twoje imię / nick"
                    value={newReviewAuthor}
                    onChange={(e) => setNewReviewAuthor(e.target.value)}
                    className="w-full bg-white/5 border border-white/15 rounded-xl py-2 px-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brand-amethyst"
                  />
                ) : (
                  <div className="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-brand-amethyst/15 border border-brand-amethyst/30 text-xs">
                    {user.avatar ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={user.avatar} alt={user.name} className="size-5 rounded-full object-cover border border-brand-amethyst" />
                    ) : (
                      <FaUser className="size-3 text-brand-amethyst" />
                    )}
                    <span className="text-white/70">Komentujesz jako:</span>
                    <span className="font-bold text-white">{user.name}</span>
                  </div>
                )}
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

      {/* Modal: Add New Spot (Editor Mode - ONLY FOR ADMINS) */}
      {isAddSpotModalOpen && isAdmin && (
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
                  <option value="event">🔥 Wydarzenie Spotowe (Czasowe)</option>
                  <option value="diy">🛠️ DIY Spot</option>
                </select>
              </div>

              {/* Event Expiration Picker (Only shown when category is Event) */}
              {newSpotCategory === "event" && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                  <label className="block text-xs font-bold uppercase text-amber-300 mb-1.5 flex items-center gap-1.5">
                    <FaCalendarDays className="size-3.5" />
                    <span>Czas trwania wydarzenia (Wygasa i trafia do archiwum)</span>
                  </label>
                  <select
                    value={eventDurationHours}
                    onChange={(e) => setEventDurationHours(Number(e.target.value))}
                    className="w-full bg-brand-black border border-amber-500/40 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value={3}>3 godziny (Szybkie wydarzenie)</option>
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
                  placeholder="Opisz nawierzchnię, przeszkody, godziny lub zorganizowane wydarzenie..."
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

      {/* Modal: Admin Access Management Panel */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-texture bg-brand-black border border-rose-500/40 rounded-3xl p-6 shadow-2xl text-white">
            <button
              onClick={() => {
                setIsAdminModalOpen(false);
                setAdminManageError("");
              }}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <FaXmark size={18} />
            </button>

            <div className="flex items-center gap-2 mb-2 text-rose-400">
              <FaShieldHalved className="size-6" />
              <h2 className="text-xl font-bold font-sans text-white">
                Zarządzanie Dostępem Adminów
              </h2>
            </div>

            {adminManageError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-900/60 border border-rose-500/60 text-rose-200 text-xs font-bold">
                {adminManageError}
              </div>
            )}

            {/* Form to grant admin access to new email */}
            <form onSubmit={handleAddAdminEmail} className="mb-6 space-y-2">
              <label className="block text-xs font-bold uppercase text-white/70">
                Nadaj Dostęp Nowemu Adminowi (E-mail)
              </label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  placeholder="np. kolega@gmail.com"
                  value={newAdminEmailInput}
                  onChange={(e) => setNewAdminEmailInput(e.target.value)}
                  className="grow bg-white/5 border border-white/15 rounded-xl py-2 px-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-rose-500 font-mono"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-sans text-xs font-bold uppercase transition-all cursor-pointer shrink-0 shadow-md"
                >
                  Dodaj
                </button>
              </div>
            </form>

            {/* List of currently authorized Admin Emails */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/70 mb-2">
                Uprawnione Konta Adminów ({adminEmails.length})
              </h3>
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                {adminEmails.map((emailItem) => {
                  const isMainAdmin = emailItem.toLowerCase().trim() === ADMIN_EMAIL;
                  return (
                    <div
                      key={emailItem}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs font-mono"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-amber-400">{isMainAdmin ? "👑" : "👤"}</span>
                        <span className={isMainAdmin ? "text-amber-300 font-bold" : "text-white/90"}>
                          {isMainAdmin && user?.name ? user.name : emailItem}
                        </span>
                        {isMainAdmin && (
                          <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-sans font-bold">
                            SUPER ADMIN
                          </span>
                        )}
                      </div>
                      {!isMainAdmin && (
                        <button
                          onClick={() => handleRemoveAdminEmail(emailItem)}
                          title="Odbierz dostęp admina"
                          className="p-1 rounded bg-rose-600/30 hover:bg-rose-600/60 text-rose-300 transition-colors cursor-pointer"
                        >
                          <FaTrash className="size-3" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Admin Edit Spot */}
      {editingSpot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="relative w-full max-w-md bg-texture bg-brand-black border border-amber-500/40 rounded-3xl p-6 shadow-2xl text-white max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingSpot(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <FaXmark size={18} />
            </button>

            <h2 className="text-xl font-bold font-sans text-amber-300 mb-4 flex items-center gap-2">
              <FaPenToSquare className="size-5" />
              <span>Edycja Spotu (Admin)</span>
            </h2>

            <form onSubmit={handleSaveSpotEdit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1">
                  Nazwa Spotu
                </label>
                <input
                  type="text"
                  required
                  value={editingSpot.name}
                  onChange={(e) => setEditingSpot({ ...editingSpot, name: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl py-2.5 px-3.5 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1">
                  Miasto
                </label>
                <input
                  type="text"
                  value={editingSpot.city || ""}
                  onChange={(e) => setEditingSpot({ ...editingSpot, city: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl py-2.5 px-3.5 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1">
                  Adres
                </label>
                <input
                  type="text"
                  value={editingSpot.address}
                  onChange={(e) => setEditingSpot({ ...editingSpot, address: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl py-2.5 px-3.5 text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1">
                  Kategoria
                </label>
                <select
                  value={editingSpot.category}
                  onChange={(e) => setEditingSpot({ ...editingSpot, category: e.target.value as SpotCategory })}
                  className="w-full bg-brand-black border border-white/15 rounded-xl py-2.5 px-3.5 text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="skatepark">🛹 Skatepark / Bowl</option>
                  <option value="street">🏙️ Street Spot</option>
                  <option value="event">🔥 Wydarzenie Spotowe</option>
                  <option value="diy">🛠️ DIY Spot</option>
                  <option value="shop">🏬 Skateshop & Serwis</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1">
                  URL Zdjęcia (Image URL)
                </label>
                <input
                  type="text"
                  value={editingSpot.image}
                  onChange={(e) => setEditingSpot({ ...editingSpot, image: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl py-2.5 px-3.5 text-white focus:outline-none focus:border-amber-400 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-white/70 mb-1">
                  Opis Spotu
                </label>
                <textarea
                  rows={3}
                  value={editingSpot.description}
                  onChange={(e) => setEditingSpot({ ...editingSpot, description: e.target.value })}
                  className="w-full bg-white/5 border border-white/15 rounded-xl py-2.5 px-3.5 text-white focus:outline-none focus:border-amber-400 resize-none text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 font-sans text-xs font-bold uppercase tracking-wider text-white shadow-lg cursor-pointer hover:scale-[1.02] transition-transform mt-2"
              >
                Zapisz Zmiany (Save Spot)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
