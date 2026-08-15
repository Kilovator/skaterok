"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import {
  FaBox,
  FaPhone,
  FaEnvelope,
  FaUser,
  FaLocationDot,
  FaRotate,
  FaClock,
  FaXmark,
  FaVolumeHigh,
  FaVolumeXmark,
  FaShieldHalved,
  FaArrowLeft,
  FaCircleInfo,
} from "react-icons/fa6";
import { CustomBuildDetails } from "@/data/products";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: { src: string; alt: string };
  dominantColor?: string;
  buildDetails?: CustomBuildDetails;
};

type Order = {
  id: string;
  userId: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingMethod: string;
  shippingDetails: {
    fullName?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    paczkomatCode?: string;
    notes?: string;
  };
  paymentMethod: string;
  paymentInfo?: string;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
};

export default function StaffOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [staffToken, setStaffToken] = useState<string>("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [pinInput, setPinInput] = useState("");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const previousOrdersRef = useRef<Order[]>([]);

  const downloadImage = (src: string, filename: string) => {
    if (!src) return;

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width || 800;
        canvas.height = img.naturalHeight || img.height || 1000;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              const blobUrl = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = blobUrl;
              link.download = filename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);
            } else {
              window.open(src, "_blank");
            }
          }, "image/png");
        } else {
          window.open(src, "_blank");
        }
      };
      img.onerror = () => {
        const link = document.createElement("a");
        link.href = src;
        link.download = filename;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      img.src = src;
    } catch {
      window.open(src, "_blank");
    }
  };

  // Initialize session token on mount
  useEffect(() => {
    const savedToken = sessionStorage.getItem("skate_staff_token");
    if (savedToken) {
      setStaffToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  // Play audio chime when a new order arrives
  const playNewOrderAudio = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.3); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.5);
    } catch {
      // Audio playback fallback
    }
  }, [soundEnabled]);

  // Fetch orders function with secure header
  const fetchOrders = useCallback(async (isManualRefresh = false) => {
    const token = staffToken || sessionStorage.getItem("skate_staff_token");
    if (!token) {
      setLoading(false);
      return;
    }

    if (isManualRefresh) setIsRefreshing(true);
    try {
      const res = await fetch("/api/orders?all=true", {
        cache: "no-store",
        headers: { "x-staff-token": token },
      });

      if (res.status === 401) {
        setIsAuthenticated(false);
        setAuthError("Klucz dostępu wygasł lub jest nieprawidłowy. Zaloguj się ponownie.");
        sessionStorage.removeItem("skate_staff_token");
        setStaffToken("");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        const fetchedOrders: Order[] = data.orders;

        // Check if there are new orders that were not in previous fetch
        if (previousOrdersRef.current.length > 0) {
          const prevIds = new Set(previousOrdersRef.current.map((o) => o.id));
          const newlyAdded = fetchedOrders.filter((o) => !prevIds.has(o.id));
          if (newlyAdded.length > 0) {
            playNewOrderAudio();
            const addedIds = new Set(newlyAdded.map((o) => o.id));
            setNewOrderIds((prev) => new Set([...prev, ...addedIds]));
          }
        }

        previousOrdersRef.current = fetchedOrders;
        setOrders(fetchedOrders);
        setAuthError(null);
      }
    } catch {
      // Quiet network catch to prevent dev overlay popup
    } finally {
      setLoading(false);
      if (isManualRefresh) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  }, [staffToken, playNewOrderAudio]);

  // Initial load and live 5-second polling loop when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchOrders();
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchOrders]);

  // Update order status in Neon DB PostgreSQL with secure header
  async function handleUpdateStatus(orderId: string, newStatus: Order["status"]) {
    const token = staffToken || sessionStorage.getItem("skate_staff_token");
    if (!token) return;

    setUpdatingStatusId(orderId);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-staff-token": token,
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      } else {
        alert(data.error || "Błąd aktualizacji statusu");
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingStatusId(null);
    }
  }

  // Filtered orders list
  const filteredOrders = orders.filter((order) => {
    const matchesStatus =
      statusFilter === "all" || order.status.toLowerCase() === statusFilter.toLowerCase();

    const name = order.shippingDetails?.fullName?.toLowerCase() || "";
    const phone = order.shippingDetails?.phone?.toLowerCase() || "";
    const city = order.shippingDetails?.city?.toLowerCase() || "";
    const id = order.id.toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch =
      id.includes(query) || name.includes(query) || phone.includes(query) || city.includes(query);

    return matchesStatus && matchesSearch;
  });

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const pendingCount = orders.filter((o) => o.status === "Processing").length;
  const shippedCount = orders.filter((o) => o.status === "Shipped").length;
  const deliveredCount = orders.filter((o) => o.status === "Delivered").length;

  // PIN / Master key submit
  function handlePinSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = pinInput.trim();
    
    // Accept standard PINs or secret key
    const validTokens = ["7777", "1234", "skate-staff", "SKATE-STAFF-SECURE-998877"];
    if (validTokens.includes(trimmed)) {
      const token = "SKATE-STAFF-SECURE-998877";
      setStaffToken(token);
      sessionStorage.setItem("skate_staff_token", token);
      setIsAuthenticated(true);
      setAuthError(null);
    } else {
      setAuthError("Niepoprawny PIN lub klucz dostępu personelu!");
    }
  }

  function handleLockDashboard() {
    sessionStorage.removeItem("skate_staff_token");
    setStaffToken("");
    setIsAuthenticated(false);
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4">
        <form
          onSubmit={handlePinSubmit}
          className="w-full max-w-md p-8 rounded-3xl border border-brand-amethyst/40 bg-white/5 backdrop-blur-2xl text-center space-y-6 shadow-2xl"
        >
          <div className="size-16 rounded-2xl bg-brand-amethyst/20 border border-brand-amethyst/50 text-brand-amethyst flex items-center justify-center mx-auto">
            <FaShieldHalved size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold font-display uppercase tracking-wider text-white">
              Panel Pracowników
            </h1>
            <p className="text-xs text-white/50 mt-1 font-mono">
              Wprowadź PIN
            </p>
          </div>
          {authError && (
            <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-300 font-mono text-xs">
              ⚠️ {authError}
            </div>
          )}
          <input
            type="password"
            maxLength={15}
            value={pinInput}
            onChange={(e) => setPinInput(e.target.value)}
            className="w-full text-center tracking-[0.5em] font-mono text-2xl bg-black/50 border border-white/20 rounded-2xl py-3 text-brand-amethyst placeholder-white/20 focus:outline-none focus:border-brand-amethyst"
          />
          <button
            type="submit"
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brand-amethyst to-purple-600 font-bold uppercase tracking-wider text-white shadow-xl hover:brightness-110 transition-all cursor-pointer"
          >
            Zaloguj do Panelu Zamówień
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-24 pb-20 px-4 sm:px-8 font-sans selection:bg-brand-amethyst selection:text-white">
      {/* ── Top Header Bar ── */}
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 animate-pulse">
                <span className="size-2 rounded-full bg-emerald-400 animate-ping" />
                Live Auto-Sync
              </span>
              <span className="text-xs font-mono text-white/40">
                Neon DB PostgreSQL Connected
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold uppercase tracking-wider font-display text-white">
              Panel Zamówień Pracowników 
            </h1>
          </div>

          {/* Quick Actions & Live Controls */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={handleLockDashboard}
              className="px-4 py-2.5 rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg"
              title="Wyloguj i zablokuj panel"
            >
              Zablokuj Panel
            </button>

            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                soundEnabled
                  ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300"
                  : "border-white/20 bg-white/5 text-white/40"
              }`}
              title={soundEnabled ? "Dźwięk powiadomień włączony" : "Dźwięk wyłączony"}
            >
              {soundEnabled ? <FaVolumeHigh size={16} /> : <FaVolumeXmark size={16} />}
            </button>

            <button
              onClick={() => fetchOrders(true)}
              disabled={isRefreshing}
              className="px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <FaRotate size={14} className={isRefreshing ? "animate-spin" : ""} />
              {isRefreshing ? "Odświeżanie..." : "Odśwież"}
            </button>

            <Link
              href="/"
              className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/60 hover:text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all"
            >
              <FaArrowLeft size={12} />
              Do Sklepu
            </Link>
          </div>
        </div>

        {/* ── Stats Overview Widgets ── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="p-3.5 rounded-2xl border border-white/10 bg-white/[0.03] space-y-1">
            <span className="text-[9px] font-mono uppercase tracking-widest text-white/40">
              Zamówienia
            </span>
            <p className="text-xl font-bold font-mono text-white">{orders.length}</p>
          </div>
          <div className="p-3.5 rounded-2xl border border-amber-500/30 bg-amber-500/10 space-y-1">
            <span className="text-[9px] font-mono uppercase tracking-widest text-amber-300/80">
              W trakcie
            </span>
            <p className="text-xl font-bold font-mono text-amber-400">{pendingCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl border border-blue-500/30 bg-blue-500/10 space-y-1">
            <span className="text-[9px] font-mono uppercase tracking-widest text-blue-300/80">
              W drodze
            </span>
            <p className="text-xl font-bold font-mono text-blue-400">{shippedCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 space-y-1">
            <span className="text-[9px] font-mono uppercase tracking-widest text-emerald-300/80">
              Dostarczone
            </span>
            <p className="text-xl font-bold font-mono text-emerald-400">{deliveredCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl border border-purple-500/30 bg-purple-500/10 space-y-1 col-span-2 sm:col-span-1">
            <span className="text-[9px] font-mono uppercase tracking-widest text-purple-300/80">
              Łączny obrót
            </span>
            <p className="text-xl font-bold font-mono text-purple-300">
              ${(totalRevenue / 100).toFixed(2)}
            </p>
          </div>
        </div>

        {/* ── Search & Filter Tabs ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 p-3 rounded-2xl border border-white/10">
          {/* Search bar */}
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Szukaj po numerze zamówienia, nazwisku, mieście..."
            className="w-full sm:w-80 bg-black/40 border border-white/15 rounded-xl py-2 px-3.5 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brand-amethyst font-mono"
          />

          {/* Status Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {[
              { id: "all", label: "Wszystkie" },
              { id: "processing", label: "🟡 W trakcie" },
              { id: "shipped", label: "🚚 W drodze" },
              { id: "delivered", label: "✅ Dostarczone" },
              { id: "cancelled", label: "❌ Anulowane" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-all whitespace-nowrap cursor-pointer ${
                  statusFilter === tab.id
                    ? "bg-brand-amethyst text-white shadow-lg shadow-brand-amethyst/30"
                    : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Orders List ── */}
        {loading ? (
          <div className="py-20 text-center space-y-3">
            <FaRotate size={36} className="animate-spin mx-auto text-brand-amethyst" />
            <p className="font-mono text-sm uppercase tracking-widest text-white/40">
              Ładowanie zamówień z bazy Neon DB...
            </p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="py-20 text-center space-y-3 border border-white/10 rounded-3xl bg-white/[0.02]">
            <FaBox size={48} className="mx-auto text-white/20" />
            <p className="font-mono text-sm uppercase tracking-widest text-white/40">
              Brak zamówień spełniających kryteria.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => {
              const isNew = newOrderIds.has(order.id);
              const dateStr = new Date(order.date).toLocaleString("pl-PL", {
                dateStyle: "medium",
                timeStyle: "short",
              });

              return (
                <div
                  key={order.id}
                  className={`rounded-3xl border transition-all p-6 backdrop-blur-xl relative shadow-2xl ${
                    isNew
                      ? "border-emerald-500 bg-emerald-950/20 shadow-emerald-500/20"
                      : order.status === "Processing"
                      ? "border-amber-500/40 bg-gradient-to-b from-white/[0.06] to-white/[0.02]"
                      : order.status === "Shipped"
                      ? "border-blue-500/40 bg-gradient-to-b from-white/[0.06] to-white/[0.02]"
                      : order.status === "Delivered"
                      ? "border-emerald-500/30 bg-white/[0.03]"
                      : "border-red-500/30 bg-white/[0.02] opacity-60"
                  }`}
                >
                  {isNew && (
                    <span className="absolute -top-3 left-6 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-emerald-500 text-black shadow-lg">
                      Nowe Zamówienie!
                    </span>
                  )}

                  {/* Header: ID, Date, Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xl font-extrabold text-white tracking-wider">
                          {order.id}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest border ${
                            order.status === "Processing"
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                              : order.status === "Shipped"
                              ? "bg-blue-500/20 text-blue-300 border-blue-500/40"
                              : order.status === "Delivered"
                              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                              : "bg-red-500/20 text-red-300 border-red-500/40"
                          }`}
                        >
                          {order.status === "Processing" && "🟡 W trakcie realizacji"}
                          {order.status === "Shipped" && "🚚 Wysłano kurierem"}
                          {order.status === "Delivered" && "✅ Dostarczono"}
                          {order.status === "Cancelled" && "❌ Anulowane"}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-white/40 mt-1 flex items-center gap-2">
                        <FaClock size={12} />
                        Data złożenia: {dateStr}
                      </p>
                    </div>

                    {/* Status Changer Buttons */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono text-white/40 uppercase mr-1">
                        Zmień status:
                      </span>
                      <button
                        disabled={updatingStatusId === order.id}
                        onClick={() => handleUpdateStatus(order.id, "Processing")}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase border transition-all cursor-pointer ${
                          order.status === "Processing"
                            ? "bg-amber-500 text-black border-amber-500 font-extrabold"
                            : "bg-white/5 border-white/15 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        W trakcie
                      </button>
                      <button
                        disabled={updatingStatusId === order.id}
                        onClick={() => handleUpdateStatus(order.id, "Shipped")}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase border transition-all cursor-pointer ${
                          order.status === "Shipped"
                            ? "bg-blue-500 text-white border-blue-500 font-extrabold"
                            : "bg-white/5 border-white/15 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        Wysłano
                      </button>
                      <button
                        disabled={updatingStatusId === order.id}
                        onClick={() => handleUpdateStatus(order.id, "Delivered")}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase border transition-all cursor-pointer ${
                          order.status === "Delivered"
                            ? "bg-emerald-500 text-black border-emerald-500 font-extrabold"
                            : "bg-white/5 border-white/15 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        Dostarczono
                      </button>
                      <button
                        disabled={updatingStatusId === order.id}
                        onClick={() => handleUpdateStatus(order.id, "Cancelled")}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase border transition-all cursor-pointer ${
                          order.status === "Cancelled"
                            ? "bg-red-500 text-white border-red-500 font-extrabold"
                            : "bg-white/5 border-white/15 text-white/60 hover:bg-white/10"
                        }`}
                      >
                        Anuluj
                      </button>
                    </div>
                  </div>

                  {/* Customer & Shipping Details Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 font-mono text-xs">
                    {/* Klient */}
                    <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                      <span className="text-[10px] font-bold text-brand-amethyst uppercase tracking-widest flex items-center gap-1.5 mb-2">
                        <FaUser size={12} /> Dane Kupującego
                      </span>
                      <p className="font-bold text-white text-sm">
                        {order.shippingDetails?.fullName || "Brak imienia"}
                      </p>
                      <p className="text-white/60 flex items-center gap-1.5">
                        <FaPhone size={11} className="text-white/40" />
                        {order.shippingDetails?.phone || "Brak telefonu"}
                      </p>
                      <p className="text-white/60 flex items-center gap-1.5 truncate">
                        <FaEnvelope size={11} className="text-white/40" />
                        {order.userId}
                      </p>
                    </div>

                    {/* Dostawa */}
                    <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                      <span className="text-[10px] font-bold text-brand-amethyst uppercase tracking-widest flex items-center gap-1.5 mb-2">
                        <FaLocationDot size={12} /> Adres / Punkt Dostawy
                      </span>
                      <p className="font-bold text-white uppercase text-xs">
                        {order.shippingMethod === "paczkomat" ? "Paczkomat InPost" : "Kurier Pro"}
                      </p>
                      {order.shippingDetails?.paczkomatCode ? (
                        <p className="text-brand-lime font-bold">
                          Kod Paczkomatu: {order.shippingDetails.paczkomatCode}
                        </p>
                      ) : (
                        <p className="text-white/80">
                          {order.shippingDetails?.address}, {order.shippingDetails?.postalCode} {order.shippingDetails?.city}
                        </p>
                      )}
                    </div>

                    {/* Płatność i Kwota */}
                    <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 space-y-1.5">
                      <span className="text-[10px] font-bold text-brand-amethyst uppercase tracking-widest flex items-center gap-1.5 mb-2">
                         Płatność i Podsumowanie
                      </span>
                      <p className="text-white/80">
                        Metoda: <span className="font-bold text-white uppercase">{order.paymentMethod}</span>
                      </p>
                      <p className="text-white/60">
                        Dostawa: ${(order.shippingFee / 100).toFixed(2)}
                      </p>
                      <p className="text-base font-bold text-brand-amethyst pt-1 border-t border-white/10">
                        Razem: ${(order.total / 100).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Ordered Items Gallery */}
                  <div className="space-y-3 pt-2 border-t border-white/10">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-white/50 block">
                      Zamówione Produkty ({order.items.length}):
                    </span>

                    <div className="grid grid-cols-1 gap-4">
                      {order.items.map((item, idx) => {
                        const isCustomBoard =
                          !!item.buildDetails ||
                          item.name.toLowerCase().includes("custom") ||
                          item.name.toLowerCase().includes("wzór") ||
                          item.name.toLowerCase().includes("wlasny") ||
                          item.id.includes("custom") ||
                          item.id.includes("saved-build");

                        const buildDetails = item.buildDetails || (isCustomBoard ? {
                          deck: {
                            uid: item.name.includes("(") ? item.name.split("(")[1].replace(")", "") : "Twój własny wzór",
                            textureUrl: item.image?.src || "/skateboard/Deck.webp",
                          },
                          wheels: { uid: "SkateWheel Cream", textureUrl: "/skateboard/SkateWheel1.png" },
                          truck: { uid: "Czarny Metal", color: "#1a1a1a" },
                          bolt: { uid: "Złoty Metal", color: "#c8a96e" },
                        } : undefined);

                        const isCustomUploadedImage =
                          item.image?.src?.startsWith("data:") ||
                          item.image?.src?.startsWith("blob:") ||
                          item.name.toLowerCase().includes("wzór") ||
                          item.name.toLowerCase().includes("własny") ||
                          buildDetails?.deck?.textureUrl?.startsWith("data:") ||
                          buildDetails?.deck?.textureUrl?.startsWith("blob:");

                        const customImageSrc =
                          buildDetails?.deck?.textureUrl || item.image?.src || "/skateboard/Deck.webp";

                        return (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl border border-white/15 bg-black/60 flex flex-col gap-3 shadow-lg"
                          >
                            <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                              <div className="flex items-center gap-2 min-w-0">
                                {isCustomBoard && (
                                  <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-widest bg-brand-amethyst/30 text-purple-300 border border-brand-amethyst/50 shrink-0">
                                    Custom Setup
                                  </span>
                                )}
                                <h4 className="font-sans font-bold text-white text-sm truncate">
                                  {item.name}
                                </h4>
                              </div>
                              <span className="font-mono text-xs font-bold text-brand-amethyst shrink-0">
                                ${(item.price / 100).toFixed(2)} x {item.quantity}
                              </span>
                            </div>

                            {/* 📸 Custom Uploaded Photo Attachment Section */}
                            {isCustomUploadedImage && (
                              <div className="p-3.5 rounded-2xl bg-purple-950/40 border border-brand-amethyst/50 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                                <div
                                  onClick={() => setPreviewImageUrl(customImageSrc)}
                                  className="aspect-square size-28 sm:size-32 rounded-2xl overflow-hidden bg-zinc-950 border-2 border-brand-amethyst shrink-0 shadow-2xl relative group cursor-pointer hover:border-brand-pale transition-all p-1"
                                >
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={customImageSrc}
                                    alt="Własny wzór klienta"
                                    className="w-full h-full object-contain transition-transform group-hover:scale-105"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).src = "/skateboard/Deck.webp";
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold font-mono transition-opacity">
                                    🔍 Powiększ
                                  </div>
                                </div>
                                <div className="space-y-2 flex-1 min-w-0">
                                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                    Załączony Plik Graficzny Klienta
                                  </span>
                                  <p className="text-xs text-white/90 font-mono leading-relaxed">
                                    Klient przesłał własną grafikę do druku. Kliknij zdjęcie, aby powiększyć lub pobierz plik w pełnej rozdzielczości.
                                  </p>
                                  <div className="flex items-center gap-2 pt-1 flex-wrap">
                                    <button
                                      type="button"
                                      onClick={() => setPreviewImageUrl(customImageSrc)}
                                      className="px-3.5 py-2 rounded-xl bg-brand-amethyst hover:bg-brand-pale hover:text-black text-white font-mono text-xs font-bold uppercase transition-all cursor-pointer shadow-lg flex items-center gap-2"
                                    >
                                      🔍 Otwórz Pełne Zdjęcie
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => downloadImage(customImageSrc, `custom-print-${order.id}.png`)}
                                      className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold uppercase transition-all cursor-pointer border border-white/20 flex items-center gap-2"
                                    >
                                      📥 Pobierz Plik
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* 🛹 4-Component Build Breakdown (Deck, Wheels, Truck, Bolt) */}
                            {isCustomBoard && buildDetails && (
                              <div className="space-y-1.5">
                                <span className="text-[10px] font-mono uppercase tracking-widest text-white/40 block">
                                  Specyfikacja Zestawu:
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-sans">
                                  {/* 1. Deck */}
                                  <div className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/10">
                                    <div className="size-8 rounded-lg overflow-hidden bg-zinc-950 border border-white/20 shrink-0 flex items-center justify-center">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={buildDetails.deck.textureUrl || "/skateboard/Deck.webp"}
                                        alt="Deck"
                                        className="w-full h-full object-cover object-[80%_center]"
                                        onError={(e) => {
                                          (e.currentTarget as HTMLImageElement).src = "/skateboard/Deck.webp";
                                        }}
                                      />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <span className="text-[9px] text-white/40 block font-mono uppercase">Deska</span>
                                      <span className="font-bold text-white truncate block text-[11px]">
                                        {buildDetails.deck.uid.replace(/-/g, " ")}
                                      </span>
                                    </div>
                                  </div>

                                  {/* 2. Wheels */}
                                  <div className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/10">
                                    <div className="size-8 rounded-lg overflow-hidden bg-zinc-950 border border-white/20 shrink-0 flex items-center justify-center">
                                      {/* eslint-disable-next-line @next/next/no-img-element */}
                                      <img
                                        src={buildDetails.wheels.textureUrl || "/skateboard/SkateWheel1.png"}
                                        alt="Wheels"
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                          (e.currentTarget as HTMLImageElement).src = "/skateboard/SkateWheel1.png";
                                        }}
                                      />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <span className="text-[9px] text-white/40 block font-mono uppercase">Kółka</span>
                                      <span className="font-bold text-white truncate block text-[11px]">
                                        {buildDetails.wheels.uid.replace(/-/g, " ")}
                                      </span>
                                    </div>
                                  </div>

                                  {/* 3. Trucks */}
                                  <div className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/10">
                                    <div
                                      className="size-7 rounded-lg border border-white/30 shrink-0 shadow-inner"
                                      style={{ backgroundColor: buildDetails.truck.color }}
                                    />
                                    <div className="min-w-0 flex-1">
                                      <span className="text-[9px] text-white/40 block font-mono uppercase">Traki</span>
                                      <span className="font-bold text-white truncate block text-[11px]">
                                        {buildDetails.truck.uid}
                                      </span>
                                    </div>
                                  </div>

                                  {/* 4. Bolts */}
                                  <div className="flex items-center gap-2 p-2 rounded-xl bg-black/40 border border-white/10">
                                    <div
                                      className="size-7 rounded-full border border-white/30 shrink-0 shadow-inner"
                                      style={{ backgroundColor: buildDetails.bolt.color }}
                                    />
                                    <div className="min-w-0 flex-1">
                                      <span className="text-[9px] text-white/40 block font-mono uppercase">Śruby</span>
                                      <span className="font-bold text-white truncate block text-[11px]">
                                        {buildDetails.bolt.uid}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Standard non-custom item fallback */}
                            {!isCustomBoard && (
                              <div className="flex items-center gap-3 pt-1 border-t border-white/5">
                                <div className="aspect-square size-12 rounded-xl overflow-hidden bg-zinc-950 border border-white/20 shrink-0">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img
                                    src={item.image?.src || "/skateboard/Deck.webp"}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      (e.currentTarget as HTMLImageElement).src = "/skateboard/Deck.webp";
                                    }}
                                  />
                                </div>
                                <span className="font-mono text-xs text-white/60">
                                  Standardowy Pojazd / Akcesoria
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Real-Time Technology Guide Modal ── */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-2xl w-full bg-zinc-900 border border-brand-amethyst/50 rounded-3xl p-6 space-y-5 shadow-2xl relative">
            <button
              onClick={() => setShowGuideModal(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white p-2"
            >
              <FaXmark size={18} />
            </button>

            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <div className="size-10 rounded-xl bg-brand-amethyst/20 border border-brand-amethyst/50 text-brand-amethyst flex items-center justify-center">
                <FaCircleInfo size={20} />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white uppercase tracking-wider">
                  Narzędzia i Utylity dla Real-Time Zamówień
                </h3>
                <p className="text-xs text-white/50 font-mono">
                  Jak podłączyć błyskawiczne powiadomienia w czasie rzeczywistym
                </p>
              </div>
            </div>

            <div className="space-y-4 font-mono text-xs text-white/80 leading-relaxed max-h-96 overflow-y-auto pr-1">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="font-bold text-brand-amethyst uppercase mb-1">
                  1. Live Auto-Polling (Obecnie wdrożone)
                </h4>
                <p>
                  Strona automatycznie odświeża zamówienia z bazy **Neon DB PostgreSQL** co 5 sekund.
                  Gdy pojawi się nowe zamówienie, odtwarzany jest sygnał dźwiękowy Synth Chime, a karta podświetla się na zielono.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="font-bold text-emerald-400 uppercase mb-1">
                  2. Supabase Realtime / PostgreSQL LISTEN/NOTIFY
                </h4>
                <p>
                  Umożliwia natychmiastowe wysyłanie zdarzenia `INSERT` z tabeli `orders` w bazie danych do przeglądarki pracownika z opóźnieniem &lt; 50ms bez odświeżania.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="font-bold text-purple-300 uppercase mb-1">
                  3. Pusher / Ably Channels (WebSockets)
                </h4>
                <p>
                  Gdy klient klika &quot;Kupuję i płacę&quot; na `/checkout`, serwer wysyła sygnał `pusher.trigger(&apos;orders&apos;, &apos;new-order&apos;, data)`.
                  Wszystkie zalogowane ekrany pracowników natychmiast wywołują powiadomienie Push i dodają kartę do listy.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10">
                <h4 className="font-bold text-blue-300 uppercase mb-1">
                  4. Server-Sent Events (SSE) w Next.js
                </h4>
                <p>
                  Wbudowany natywny strumień HTTP w Next.js API (`/api/orders/stream`), który utrzymuje otwarte połączenie i przesyła nowe zamówienia do panelu pracowników.
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-3 rounded-xl bg-brand-amethyst hover:bg-brand-pale hover:text-black font-bold uppercase tracking-wider text-white transition-colors cursor-pointer"
            >
              Rozumiem
            </button>
          </div>
        </div>
      )}

      {/* ── High-Res Image Preview Lightbox Modal ── */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-8 animate-fade-in">
          <div className="relative max-w-4xl w-full h-[80vh] flex flex-col items-center justify-center bg-zinc-950/80 border border-brand-amethyst/50 rounded-3xl p-4 shadow-2xl">
            <button
              onClick={() => setPreviewImageUrl(null)}
              className="absolute top-4 right-4 z-10 size-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Zamknij podgląd"
            >
              <FaXmark size={20} />
            </button>

            <div className="w-full h-full flex items-center justify-center p-2 relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewImageUrl}
                alt="Własny wzór klienta w pełnej rozdzielczości"
                className="max-w-full max-h-full object-contain filter drop-shadow-2xl rounded-2xl"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/skateboard/Deck.webp";
                }}
              />
            </div>

            <div className="w-full pt-4 border-t border-white/10 flex items-center justify-between gap-4">
              <span className="text-xs font-mono text-white/60 truncate">
                📸 Grafika klienta przeznaczona do druku
              </span>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => downloadImage(previewImageUrl, "custom-print.png")}
                  className="px-5 py-2.5 rounded-xl bg-brand-amethyst hover:bg-brand-pale hover:text-black text-white font-mono text-xs font-bold uppercase transition-all cursor-pointer shadow-lg flex items-center gap-2"
                >
                  📥 Pobierz Pełną Grafikę
                </button>
                <button
                  onClick={() => setPreviewImageUrl(null)}
                  className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-mono text-xs font-bold uppercase transition-all cursor-pointer"
                >
                  Zamknij
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
