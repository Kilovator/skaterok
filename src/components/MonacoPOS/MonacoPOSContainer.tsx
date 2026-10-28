"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { monacoTranslations, MonacoLang } from "@/data/monacoTranslations";
import { MonacoTab, Order, OrderItem, StaffUser } from "./types";
import { MonacoNavbar } from "./MonacoNavbar";
import { MonacoSidebar } from "./MonacoSidebar";
import { MonacoDashboard } from "./MonacoDashboard";
import { MonacoPOSTerminal } from "./MonacoPOSTerminal";
import { MonacoOrdersTable } from "./MonacoOrdersTable";
import { MonacoProductsView } from "./MonacoProductsView";
import { MonacoCategoriesView } from "./MonacoCategoriesView";
import { MonacoPeopleView } from "./MonacoPeopleView";
import { MonacoReportsView } from "./MonacoReportsView";
import { MonacoModals } from "./MonacoModals";
import { MonacoAuthLock } from "./MonacoAuthLock";

const STAFF_SECRET_TOKEN = "SKATE-STAFF-SECURE-998877";

export function MonacoPOSContainer() {
  const [currentLang, setCurrentLang] = useState<MonacoLang>("pl");
  const [activeTab, setActiveTab] = useState<MonacoTab>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [storeName, setStoreName] = useState("Center Market");
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Authentication & Security state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [staffToken, setStaffToken] = useState("");
  const [currentStaffUser, setCurrentStaffUser] = useState<StaffUser | null>(null);
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [authError, setAuthError] = useState<string | null>(null);

  // Orders and Database state
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());

  // Modals state
  const [isOpenBackup, setIsOpenBackup] = useState(false);
  const [isOpenStores, setIsOpenStores] = useState(false);
  const [isOpenShortcuts, setIsOpenShortcuts] = useState(false);
  const [isOpenSettings, setIsOpenSettings] = useState(false);

  const previousOrdersRef = useRef<Order[]>([]);

  const t = monacoTranslations[currentLang] || monacoTranslations.pl;

  // Load language, store name, and session token on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("monaco_pos_lang") as MonacoLang;
    if (savedLang && (savedLang === "pl" || savedLang === "en" || savedLang === "ru")) {
      setCurrentLang(savedLang);
    } else {
      setCurrentLang("pl");
      localStorage.setItem("monaco_pos_lang", "pl");
    }
    const savedStore = localStorage.getItem("monaco_pos_store_name");
    if (savedStore) {
      setStoreName(savedStore);
    }
    const savedToken = sessionStorage.getItem("skate_staff_token");
    if (savedToken) {
      setStaffToken(savedToken);
      setIsAuthenticated(true);
    }
    const savedStaffUser = sessionStorage.getItem("skate_staff_user");
    if (savedStaffUser) {
      try {
        setCurrentStaffUser(JSON.parse(savedStaffUser));
      } catch {}
    }
  }, []);

  const handleSelectLang = (lang: MonacoLang) => {
    setCurrentLang(lang);
    localStorage.setItem("monaco_pos_lang", lang);
  };

  const handleUpdateStoreName = (name: string) => {
    setStoreName(name);
    localStorage.setItem("monaco_pos_store_name", name);
  };

  // Audio chime for new incoming order
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
      // Audio fallback
    }
  }, [soundEnabled]);

  // Fetch orders from database
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
        setAuthError(t.invalidPin);
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
      // Quiet catch
    } finally {
      setLoading(false);
      if (isManualRefresh) {
        setTimeout(() => setIsRefreshing(false), 500);
      }
    }
  }, [staffToken, playNewOrderAudio, t.invalidPin]);

  // Fetch staff users from PostgreSQL
  const fetchStaffUsers = useCallback(async () => {
    const token = staffToken || sessionStorage.getItem("skate_staff_token");
    if (!token) return;
    try {
      const res = await fetch("/api/staff", {
        headers: { "x-staff-token": token },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setStaffUsers(data.users);
      }
    } catch (e) {
      console.error("Failed to fetch staff:", e);
    }
  }, [staffToken]);

  // Initial load and live polling every 5s
  useEffect(() => {
    if (!isAuthenticated) return;
    fetchOrders();
    fetchStaffUsers();
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, [isAuthenticated, fetchOrders, fetchStaffUsers]);

  // Handle staff PIN authentication via /api/staff/verify-pin
  const handleAuthenticate = async (enteredPin: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/staff/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin: enteredPin }),
      });
      const data = await res.json();
      if (data.success && data.user && data.token) {
        sessionStorage.setItem("skate_staff_token", data.token);
        sessionStorage.setItem("skate_staff_user", JSON.stringify(data.user));
        setStaffToken(data.token);
        setCurrentStaffUser(data.user);
        setIsAuthenticated(true);
        setAuthError(null);
        return true;
      } else {
        setAuthError(data.error || t.invalidPin);
        return false;
      }
    } catch {
      setAuthError(t.invalidPin);
      return false;
    }
  };

  // Lock terminal
  const handleLockTerminal = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("skate_staff_token");
    sessionStorage.removeItem("skate_staff_user");
    setStaffToken("");
    setCurrentStaffUser(null);
  };

  // Update order status in PostgreSQL via PATCH /api/orders
  const handleUpdateStatus = async (orderId: string, newStatus: Order["status"]) => {
    const token = staffToken || sessionStorage.getItem("skate_staff_token");
    if (!token) return;

    setIsUpdatingId(orderId);
    try {
      const res = await fetch("/api/orders", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-staff-token": token,
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch {
      alert("Error updating order status.");
    } finally {
      setIsUpdatingId(null);
    }
  };

  // Complete in-store POS cash register sale via POST /api/orders
  const handleCompleteSale = async (orderData: {
    items: OrderItem[];
    subtotal: number;
    shippingFee: number;
    total: number;
    shippingMethod: string;
    shippingDetails: {
      fullName: string;
      notes: string;
    };
    paymentMethod: string;
    paymentInfo: string;
  }) => {
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "pos_cashier",
          orderData: {
            ...orderData,
            status: "Delivered",
          },
        }),
      });

      if (res.ok) {
        const json = await res.json();
        // Immediately refresh orders list
        fetchOrders();
        return json.order?.id as string | undefined;
      }
    } catch (e) {
      console.error("POS Sale error:", e);
    }
    return undefined;
  };

  // Keyboard shortcut listener (e.g. F2 for POS / checkout)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        setActiveTab("pos");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // If not authenticated, show MonacoAuthLock screen
  if (!isAuthenticated) {
    return (
      <MonacoAuthLock
        t={t}
        storeName={storeName}
        onAuthenticate={handleAuthenticate}
        error={authError}
      />
    );
  }

  const pendingOrdersCount = orders.filter((o) => o.status === "Processing").length;

  return (
    <div className="min-h-screen bg-[#eceef1] flex flex-col font-sans select-none overflow-x-hidden">
      {/* 1. Monaco POS Red Top Navigation Bar */}
      <MonacoNavbar
        t={t}
        currentLang={currentLang}
        onSelectLang={handleSelectLang}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        onRefreshOrders={() => fetchOrders(true)}
        isRefreshing={isRefreshing}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        pendingOrdersCount={pendingOrdersCount}
        onLockTerminal={handleLockTerminal}
        onOpenShortcuts={() => setIsOpenShortcuts(true)}
        adminName={currentStaffUser?.name || "Super adminchik"}
        adminAvatar={currentStaffUser?.avatar}
        adminRole={currentStaffUser?.role}
        storeName={storeName}
        onChangeStoreName={handleUpdateStoreName}
      />

      {/* 2. Main Body: Left Dark Sidebar + Active Content View */}
      <div className="flex-1 flex min-h-[calc(100vh-3.5rem)] overflow-hidden">
        {/* Monaco POS Dark Left Sidebar */}
        <MonacoSidebar
          t={t}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          isOpen={isSidebarOpen}
          ordersBadge={pendingOrdersCount}
        />

        {/* Dynamic View Component */}
        {activeTab === "dashboard" && (
          <MonacoDashboard
            t={t}
            onSelectTab={setActiveTab}
            orders={orders}
            onOpenBackupModal={() => setIsOpenBackup(true)}
            onOpenStoresModal={() => setIsOpenStores(true)}
            staffUsersCount={staffUsers.filter((u) => u.posAccess).length || staffUsers.length || 1}
          />
        )}

        {activeTab === "pos" && (
          <MonacoPOSTerminal
            t={t}
            storeName={storeName}
            adminName={currentStaffUser?.name || "Super adminchik"}
            onBackToDashboard={() => setActiveTab("dashboard")}
            onCompleteSale={handleCompleteSale}
            soundEnabled={soundEnabled}
          />
        )}

        {activeTab === "sales" && (
          <MonacoOrdersTable
            t={t}
            orders={orders}
            onUpdateStatus={handleUpdateStatus}
            isUpdatingId={isUpdatingId}
            newOrderIds={newOrderIds}
            storeName={storeName}
            adminName={currentStaffUser?.name || "Super adminchik"}
          />
        )}

        {activeTab === "products" && (
          <MonacoProductsView
            t={t}
            onAddToCart={() => setActiveTab("pos")}
          />
        )}

        {activeTab === "categories" && (
          <MonacoCategoriesView
            t={t}
            onSelectCategory={() => setActiveTab("products")}
          />
        )}

        {activeTab === "people" && (
          <MonacoPeopleView
            t={t}
            orders={orders}
            staffToken={staffToken}
            currentStaffUser={currentStaffUser}
            onStaffUpdated={fetchStaffUsers}
          />
        )}

        {activeTab === "reports" && (
          <MonacoReportsView
            t={t}
            orders={orders}
          />
        )}

        {(activeTab === "purchases" || activeTab === "giftcards" || activeTab === "settings") && (
          <div className="flex-1 bg-[#eceef1] p-6 overflow-y-auto">
            <div className="max-w-xl mx-auto bg-white p-6 rounded border border-gray-200 shadow-sm mt-8 text-center font-sans">
              <h2 className="text-base font-bold text-gray-800 uppercase mb-2">
                {activeTab === "purchases" && t.purchases}
                {activeTab === "giftcards" && t.giftCards}
                {activeTab === "settings" && t.settings}
              </h2>
              <p className="text-xs text-gray-600 mb-6">
                {t.moduleActive}
              </p>
              <button
                onClick={() => setActiveTab("dashboard")}
                className="px-5 py-2 bg-[#e53935] hover:bg-[#d32f2f] text-white text-xs font-bold rounded cursor-pointer transition-colors"
              >
                &larr; {t.backToDashboard}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 3. Utility Modals (Backup, Stores, Shortcuts, Settings) */}
      <MonacoModals
        t={t}
        orders={orders}
        isOpenBackup={isOpenBackup}
        onCloseBackup={() => setIsOpenBackup(false)}
        isOpenStores={isOpenStores}
        onCloseStores={() => setIsOpenStores(false)}
        isOpenShortcuts={isOpenShortcuts}
        onCloseShortcuts={() => setIsOpenShortcuts(false)}
        isOpenSettings={isOpenSettings}
        onCloseSettings={() => setIsOpenSettings(false)}
        storeName={storeName}
        onUpdateStoreName={handleUpdateStoreName}
      />
    </div>
  );
}
