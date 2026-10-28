"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FaUsers,
  FaUserShield,
  FaMagnifyingGlass,
  FaKey,
  FaPen,
  FaCheck,
  FaXmark,
  FaShuffle,
  FaShieldHalved,
  FaCircleCheck,
  FaCircleXmark,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa6";
import { MonacoTranslations } from "@/data/monacoTranslations";
import { Order, StaffUser } from "./types";

interface MonacoPeopleViewProps {
  t: MonacoTranslations;
  orders: Order[];
  staffToken: string;
  currentStaffUser?: StaffUser | null;
  onStaffUpdated?: () => void;
}

export function MonacoPeopleView({
  t,
  orders,
  staffToken,
  currentStaffUser,
  onStaffUpdated,
}: MonacoPeopleViewProps) {
  const [activeTab, setActiveTab] = useState<"customers" | "users">("customers");
  const [search, setSearch] = useState("");
  const [staffUsers, setStaffUsers] = useState<StaffUser[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);

  // PIN modal state
  const [selectedUserForPin, setSelectedUserForPin] = useState<StaffUser | null>(null);
  const [newPinValue, setNewPinValue] = useState("");
  const [isSavingPin, setIsSavingPin] = useState(false);
  const [pinModalError, setPinModalError] = useState<string | null>(null);
  const [revealedPins, setRevealedPins] = useState<Set<string>>(new Set());

  // Check if current user is the main administrator
  const isMainAdmin =
    currentStaffUser?.isMainAdmin ||
    currentStaffUser?.email?.toLowerCase() === "dimonkrasula5@gmail.com" ||
    currentStaffUser?.role === "admin";

  // Fetch real users from /api/staff
  const fetchStaff = useCallback(async () => {
    const token = staffToken || sessionStorage.getItem("skate_staff_token");
    if (!token) return;

    setLoadingStaff(true);
    try {
      const res = await fetch("/api/staff", {
        headers: { "x-staff-token": token },
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setStaffUsers(data.users);
      }
    } catch (e) {
      console.error("Failed to load staff users:", e);
    } finally {
      setLoadingStaff(false);
    }
  }, [staffToken]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  // Extract real unique customers from orders
  const customersMap = new Map<
    string,
    {
      id: string;
      name: string;
      phone?: string;
      email?: string;
      ordersCount: number;
      totalSpent: number;
      lastDate?: string;
    }
  >();

  orders.forEach((o) => {
    const key = o.shippingDetails?.fullName || o.shippingDetails?.email || o.userId || "Klient";
    const existing = customersMap.get(key);
    if (existing) {
      existing.ordersCount += 1;
      existing.totalSpent += o.total || 0;
      if (!existing.phone && o.shippingDetails?.phone) existing.phone = o.shippingDetails.phone;
      if (!existing.email && o.shippingDetails?.email) existing.email = o.shippingDetails.email;
    } else {
      customersMap.set(key, {
        id: o.userId || key,
        name: o.shippingDetails?.fullName || o.userId || "Klient stacjonarny",
        phone: o.shippingDetails?.phone,
        email: o.shippingDetails?.email || (o.userId?.includes("@") ? o.userId : undefined),
        ordersCount: 1,
        totalSpent: o.total || 0,
        lastDate: o.date,
      });
    }
  });

  const customersList = Array.from(customersMap.values()).filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q))
    );
  });

  const filteredStaff = staffUsers.filter((u) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.posPin && u.posPin.includes(q))
    );
  });

  // Toggle user POS access
  const handleToggleAccess = async (user: StaffUser) => {
    if (!isMainAdmin) {
      alert("Tylko główny administrator może zarządzać dostępem personelu.");
      return;
    }

    const token = staffToken || sessionStorage.getItem("skate_staff_token");
    if (!token) return;

    const newAccess = !user.posAccess;
    // If enabling access and user has no PIN, prompt to set one
    if (newAccess && !user.posPin) {
      setSelectedUserForPin(user);
      setNewPinValue(String(Math.floor(1000 + Math.random() * 9000)));
      return;
    }

    try {
      const res = await fetch("/api/staff", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-staff-token": token,
        },
        body: JSON.stringify({
          userId: user.id,
          posAccess: newAccess,
          role: newAccess && user.role === "user" ? "cashier" : user.role,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setStaffUsers(data.users);
        if (onStaffUpdated) onStaffUpdated();
      }
    } catch (e) {
      console.error("Toggle access error:", e);
      alert("Błąd podczas zmiany dostępu.");
    }
  };

  // Save new PIN
  const handleSavePin = async () => {
    if (!selectedUserForPin) return;
    const cleanPin = newPinValue.trim();

    if (!cleanPin) {
      setPinModalError("PIN nie może być pusty.");
      return;
    }

    const token = staffToken || sessionStorage.getItem("skate_staff_token");
    if (!token) return;

    setIsSavingPin(true);
    setPinModalError(null);
    try {
      const res = await fetch("/api/staff", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-staff-token": token,
        },
        body: JSON.stringify({
          userId: selectedUserForPin.id,
          posPin: cleanPin,
          posAccess: true,
          role: selectedUserForPin.role === "user" ? "cashier" : selectedUserForPin.role,
        }),
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.users)) {
        setStaffUsers(data.users);
        setSelectedUserForPin(null);
        setNewPinValue("");
        if (onStaffUpdated) onStaffUpdated();
      } else {
        setPinModalError(data.error || "Błąd podczas zapisu PIN.");
      }
    } catch (e) {
      console.error("Save PIN error:", e);
      setPinModalError("Błąd serwera podczas zapisu PIN.");
    } finally {
      setIsSavingPin(false);
    }
  };

  // Toggle reveal PIN
  const toggleRevealPin = (userId: string) => {
    setRevealedPins((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  return (
    <div className="flex-1 bg-[#eceef1] p-4 sm:p-6 overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-5 border-b border-gray-300 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-normal text-gray-700 tracking-tight flex items-center gap-2">
            <FaUsers size={20} className="text-[#e84393]" />
            <span>
              {t.people} ({t.customers}: {customersMap.size} &bull; {t.users}: {staffUsers.length})
            </span>
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Zarządzaj kontami klientów i uprawnieniami personelu z bazy Skate-OK
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex items-center gap-1 bg-white p-1 rounded border border-gray-300 shadow-2xs">
          <button
            onClick={() => setActiveTab("customers")}
            className={`px-4 py-1.5 text-xs font-bold rounded cursor-pointer transition-colors ${
              activeTab === "customers"
                ? "bg-[#e84393] text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {t.customers} ({customersMap.size})
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-1.5 text-xs font-bold rounded cursor-pointer transition-colors ${
              activeTab === "users" ? "bg-[#2980b9] text-white" : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {t.users} / Personel ({staffUsers.length})
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-sm border border-gray-200 mb-4 shadow-2xs flex items-center gap-3">
        <div className="relative flex-1">
          <FaMagnifyingGlass size={12} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              activeTab === "customers"
                ? "Szukaj klientów po nazwisku, e-mailu, telefonie..."
                : "Szukaj pracowników po nazwie, e-mailu lub PIN..."
            }
            className="w-full text-xs pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:border-[#2980b9]"
          />
        </div>
        {search && (
          <button
            onClick={() => setSearch("")}
            className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1"
          >
            Wyczyść
          </button>
        )}
      </div>

      {/* Tab 1: Customers Table */}
      {activeTab === "customers" && (
        <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f7f8fa] text-gray-600 border-b border-gray-200 uppercase font-bold text-[11px]">
                <th className="py-3 px-4">Klient</th>
                <th className="py-3 px-4">Telefon</th>
                <th className="py-3 px-4">E-mail</th>
                <th className="py-3 px-4">Zamówienia</th>
                <th className="py-3 px-4">Wydano łącznie</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans">
              {customersList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400 font-medium">
                    Brak klientów spełniających kryteria wyszukiwania.
                  </td>
                </tr>
              ) : (
                customersList.map((cust, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-gray-800 flex items-center gap-2.5">
                      <div className="size-7 rounded-full bg-emerald-600/15 text-emerald-800 flex items-center justify-center font-bold text-xs font-mono">
                        {cust.name.charAt(0).toUpperCase()}
                      </div>
                      <span>{cust.name}</span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-mono">
                      {cust.phone || "—"}
                    </td>
                    <td className="py-3 px-4 text-gray-600 font-mono text-[11px]">
                      {cust.email || "—"}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-gray-700">
                      {cust.ordersCount} {cust.ordersCount === 1 ? "zamówienie" : "zamówień"}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#27ae60]">
                      ${(cust.totalSpent / 100).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        Aktywny Klient
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Real Staff Accounts from Skate-OK & PIN Management */}
      {activeTab === "users" && (
        <div className="space-y-4">
          {/* Admin Info Banner */}
          <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-sm flex items-start gap-3 text-xs text-blue-900">
            <FaShieldHalved size={18} className="text-[#2980b9] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">
                Konta personelu są powiązane z kontami zarejestrowanymi na stronie Skate-OK.
              </p>
              <p className="text-[11px] text-blue-800 mt-0.5 leading-relaxed">
                Jako główny administrator możesz nadać pracownikowi dostęp do systemu POS oraz
                przydzielić mu unikalny kod PIN. Pracownik loguje się do kasy za pomocą swojego PIN-u,
                a system automatycznie przypisuje jego imię i nazwisko do wystawianych paragonów.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f7f8fa] text-gray-600 border-b border-gray-200 uppercase font-bold text-[11px]">
                  <th className="py-3 px-4">Konto Użytkownika</th>
                  <th className="py-3 px-4">E-mail</th>
                  <th className="py-3 px-4">Rola w systemie</th>
                  <th className="py-3 px-4">Dostęp do Kasy POS</th>
                  <th className="py-3 px-4">Osobisty PIN POS</th>
                  <th className="py-3 px-4 text-right">Zarządzanie (Admin)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-sans">
                {loadingStaff ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400 font-medium">
                      Ładowanie kont z bazy danych...
                    </td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400 font-medium">
                      Brak zarejestrowanych kont.
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((user) => {
                    const isUserRevealed = revealedPins.has(user.id);
                    const isUserMainAdmin = user.isMainAdmin || user.email === "dimonkrasula5@gmail.com";

                    return (
                      <tr key={user.id} className="hover:bg-gray-50/80 transition-colors">
                        {/* User identity & Avatar */}
                        <td className="py-3 px-4 font-bold text-gray-900 flex items-center gap-2.5">
                          <div className="size-8 rounded-full bg-[#2980b9] text-white flex items-center justify-center font-bold text-xs shadow-inner overflow-hidden shrink-0">
                            {user.avatar ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={user.avatar} alt="" className="size-full object-cover" />
                            ) : (
                              user.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-gray-800">{user.name}</p>
                            <p className="text-[10px] text-gray-400 font-mono">ID: {user.id.slice(0, 8)}...</p>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-3 px-4 font-mono text-gray-600 text-[11px]">
                          {user.email}
                        </td>

                        {/* Role */}
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              isUserMainAdmin
                                ? "bg-purple-100 text-purple-800 border border-purple-200"
                                : user.posAccess
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {isUserMainAdmin ? "Główny Admin" : user.posAccess ? "Kasjer / Personel" : "Użytkownik"}
                          </span>
                        </td>

                        {/* POS Access status badge */}
                        <td className="py-3 px-4">
                          {user.posAccess ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              <FaCircleCheck size={11} />
                              <span>Aktywny w POS</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-medium">
                              <FaCircleXmark size={11} />
                              <span>Brak dostępu</span>
                            </span>
                          )}
                        </td>

                        {/* Personal PIN column */}
                        <td className="py-3 px-4">
                          {user.posPin ? (
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-extrabold text-xs tracking-wider bg-gray-100 px-2 py-0.5 rounded border border-gray-200 text-gray-800">
                                {isUserRevealed ? user.posPin : "••••"}
                              </span>
                              <button
                                onClick={() => toggleRevealPin(user.id)}
                                title={isUserRevealed ? "Ukryj PIN" : "Pokaż PIN"}
                                className="text-gray-400 hover:text-gray-700 p-1 cursor-pointer"
                              >
                                {isUserRevealed ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
                              </button>
                            </div>
                          ) : (
                            <span className="text-gray-400 italic text-[11px]">Brak PIN-u</span>
                          )}
                        </td>

                        {/* Admin Action Buttons */}
                        <td className="py-3 px-4 text-right">
                          {isMainAdmin ? (
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Edit / Set PIN button */}
                              <button
                                onClick={() => {
                                  setSelectedUserForPin(user);
                                  setNewPinValue(user.posPin || "");
                                  setPinModalError(null);
                                }}
                                className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-[11px] font-bold cursor-pointer transition-colors"
                                title="Ustaw lub zmień PIN pracownika"
                              >
                                <FaKey size={10} />
                                <span>{user.posPin ? "Zmień PIN" : "Nadaj PIN"}</span>
                              </button>

                              {/* Toggle access button (main admin cannot revoke own access) */}
                              {!isUserMainAdmin && (
                                <button
                                  onClick={() => handleToggleAccess(user)}
                                  className={`px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                                    user.posAccess
                                      ? "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200"
                                      : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                                  }`}
                                >
                                  {user.posAccess ? "Odbierz dostęp" : "Nadaj dostęp"}
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-[11px]">Tylko dla Admina</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Set / Change PIN Modal */}
      {selectedUserForPin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs font-sans text-xs">
          <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full border border-gray-300 overflow-hidden animate-fade-in">
            {/* Modal Header */}
            <div className="bg-[#2980b9] text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FaKey size={14} />
                <span className="font-bold text-sm">
                  {selectedUserForPin.posPin ? "Zmień PIN personelu" : "Nadaj PIN dostępu do POS"}
                </span>
              </div>
              <button
                onClick={() => setSelectedUserForPin(null)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <FaXmark size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              <div className="bg-gray-50 p-3 rounded border border-gray-200 flex items-center gap-3">
                <div className="size-8 rounded-full bg-[#2980b9] text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {selectedUserForPin.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-800 text-xs truncate">{selectedUserForPin.name}</p>
                  <p className="text-[11px] text-gray-500 font-mono truncate">{selectedUserForPin.email}</p>
                </div>
              </div>

              {pinModalError && (
                <div className="p-2 rounded bg-red-50 border border-red-200 text-red-600 text-[11px] font-bold">
                  {pinModalError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Wprowadź kod PIN pracownika (np. 4 lub 6 cyfr):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newPinValue}
                    onChange={(e) => setNewPinValue(e.target.value)}
                    placeholder="Wpisz PIN (np. 1234 lub 998877)"
                    autoFocus
                    className="flex-1 font-mono font-bold text-center tracking-widest text-base px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-[#2980b9]"
                  />
                  <button
                    type="button"
                    onClick={() => setNewPinValue(String(Math.floor(1000 + Math.random() * 9000)))}
                    title="Wygeneruj losowy 4-cyfrowy PIN"
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 rounded flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <FaShuffle size={12} />
                    <span className="text-[11px]">Losuj</span>
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">
                  Ten PIN posłuży pracownikowi do odblokowania kasy na ekranie Monaco POS.
                </p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSelectedUserForPin(null)}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded cursor-pointer"
                >
                  Anuluj
                </button>
                <button
                  type="button"
                  onClick={handleSavePin}
                  disabled={isSavingPin}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#27ae60] hover:bg-[#219150] disabled:opacity-50 text-white font-bold rounded cursor-pointer shadow"
                >
                  {isSavingPin ? (
                    <span>Zapisywanie...</span>
                  ) : (
                    <>
                      <FaCheck size={12} />
                      <span>Zapisz PIN i Aktywuj</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
