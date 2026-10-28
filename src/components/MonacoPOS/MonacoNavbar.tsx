"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaBars,
  FaHouse,
  FaRotate,
  FaTv,
  FaKeyboard,
  FaBell,
  FaVolumeHigh,
  FaVolumeXmark,
  FaExpand,
  FaCompress,
  FaLock,
  FaRightFromBracket,
  FaChevronDown,
  FaShop,
  FaCheck,
  FaShieldHalved,
} from "react-icons/fa6";
import { MonacoLang, MonacoTranslations } from "@/data/monacoTranslations";
import { MonacoTab } from "./types";

interface MonacoNavbarProps {
  t: MonacoTranslations;
  currentLang: MonacoLang;
  onSelectLang: (lang: MonacoLang) => void;
  activeTab: MonacoTab;
  onSelectTab: (tab: MonacoTab) => void;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onRefreshOrders: () => void;
  isRefreshing: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  pendingOrdersCount: number;
  onLockTerminal: () => void;
  onOpenShortcuts: () => void;
  adminName?: string;
  adminAvatar?: string | null;
  adminRole?: string;
  storeName?: string;
  onChangeStoreName?: (name: string) => void;
}

export function MonacoNavbar({
  t,
  currentLang,
  onSelectLang,
  activeTab,
  onSelectTab,
  isSidebarOpen,
  onToggleSidebar,
  onRefreshOrders,
  isRefreshing,
  soundEnabled,
  onToggleSound,
  pendingOrdersCount,
  onLockTerminal,
  onOpenShortcuts,
  adminName = "Super adminchik",
  adminAvatar = null,
  adminRole = "admin",
  storeName = "Center Market",
  onChangeStoreName,
}: MonacoNavbarProps) {
  const [timeString, setTimeString] = useState<string>("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);

  // Live real-time clock matching Monaco POS format (e.g., "19th December 2018 05:29 PM")
  useEffect(() => {
    function updateClock() {
      const now = new Date();
      const day = now.getDate();
      let suffix = "th";
      if (day % 10 === 1 && day !== 11) suffix = "st";
      else if (day % 10 === 2 && day !== 12) suffix = "nd";
      else if (day % 10 === 3 && day !== 13) suffix = "rd";

      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ];
      const month = months[now.getMonth()];
      const year = now.getFullYear();

      let hours = now.getHours();
      const ampm = hours >= 12 ? "PM" : "AM";
      hours = hours % 12;
      hours = hours ? hours : 12;
      const strHours = hours < 10 ? `0${hours}` : hours;
      const minutes = now.getMinutes() < 10 ? `0${now.getMinutes()}` : now.getMinutes();

      setTimeString(`${day}${suffix} ${month} ${year} ${strHours}:${minutes} ${ampm}`);
    }

    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const langOptions: { id: MonacoLang; label: string; code: string }[] = [
    { id: "pl", label: "Polski (PL)", code: "PL" },
    { id: "en", label: "English (EN)", code: "EN" },
    { id: "ru", label: "Русский (RU)", code: "RU" },
  ];

  function renderFlag(lang: MonacoLang) {
    if (lang === "pl") {
      return (
        <svg className="w-4 h-2.5 rounded-xs border border-white/25 shrink-0 inline-block overflow-hidden" viewBox="0 0 640 480" aria-hidden="true">
          <rect width="640" height="240" fill="#ffffff" />
          <rect y="240" width="640" height="240" fill="#dc143c" />
        </svg>
      );
    }
    if (lang === "ru") {
      return (
        <svg className="w-4 h-2.5 rounded-xs border border-white/25 shrink-0 inline-block overflow-hidden" viewBox="0 0 640 480" aria-hidden="true">
          <rect width="640" height="160" fill="#ffffff" />
          <rect y="160" width="640" height="160" fill="#0039a6" />
          <rect y="320" width="640" height="160" fill="#d52b1e" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-2.5 rounded-xs border border-white/25 shrink-0 inline-block overflow-hidden" viewBox="0 0 640 480" aria-hidden="true">
        <path fill="#012169" d="M0 0h640v480H0z"/>
        <path fill="#FFF" d="m75 0 245 180L565 0h75v60L435 240l205 180v60h-75L320 300 75 480H0v-60l205-180L0 60V0h75z"/>
        <path fill="#C8102E" d="m424 281 216 159v40L370 281h54zm-208-82L0 40V0l270 200h-54zM640 0v11L450 152h-54L640 11V0zM0 480v-11l190-141h54L0 469v11z"/>
        <path fill="#FFF" d="M250 0h140v480H250zM0 170h640v140H0z"/>
        <path fill="#C8102E" d="M276 0h88v480h-88zM0 196h640v88H0z"/>
      </svg>
    );
  }

  return (
    <header className="h-14 bg-[#e53935] text-white flex items-center justify-between px-3 sm:px-4 shadow-md select-none relative z-50">
      {/* Left side: Brand, hamburger, language flag, store switcher */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        {/* Brand logo & store title */}
        <button
          onClick={() => onSelectTab("dashboard")}
          className="flex items-center gap-2 text-white hover:text-white/90 transition-colors font-bold tracking-wide cursor-pointer"
        >
          <span className="font-sans text-base sm:text-lg font-extrabold tracking-tight drop-shadow-sm flex items-center gap-1.5">
            <span className="bg-white/20 px-2 py-0.5 rounded text-sm uppercase">POS</span>
            <span>{storeName}</span>
          </span>
        </button>

        {/* Sidebar Hamburger Toggle */}
        <button
          onClick={onToggleSidebar}
          title={isSidebarOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          className="p-2 rounded hover:bg-black/15 active:bg-black/25 transition-colors cursor-pointer text-white"
        >
          <FaBars size={17} />
        </button>

        {/* Language Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
            className="flex items-center gap-1.5 px-2 py-1 rounded bg-black/15 hover:bg-black/25 text-xs font-semibold tracking-wide transition-colors cursor-pointer border border-white/20"
            title={currentLang === "pl" ? "Zmień język" : currentLang === "ru" ? "Сменить язык" : "Change language"}
          >
            {renderFlag(currentLang)}
            <span className="uppercase text-[11px] font-mono font-bold">{currentLang}</span>
            <FaChevronDown size={10} className="text-white/80" />
          </button>

          {isLangDropdownOpen && (
            <div
              className="absolute left-0 top-full mt-1.5 w-44 bg-[#222733] border border-white/15 rounded-lg shadow-2xl py-1 z-50 text-white font-sans text-xs"
              onClick={() => setIsLangDropdownOpen(false)}
            >
              {langOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onSelectLang(opt.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/10 transition-colors cursor-pointer ${
                    currentLang === opt.id ? "text-[#e53935] font-bold bg-white/5" : "text-white/80"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    {renderFlag(opt.id)}
                    <span>{opt.label}</span>
                  </span>
                  {currentLang === opt.id && <FaCheck size={11} className="text-[#e53935]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen Mode"}
          className="p-2 rounded hover:bg-black/15 text-white/90 hover:text-white transition-colors cursor-pointer hidden md:flex items-center"
        >
          {isFullscreen ? <FaCompress size={15} /> : <FaExpand size={15} />}
        </button>
      </div>

      {/* Right side: Live clock, quick nav action buttons, bell, user avatar */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Live Clock (exact Monaco POS styling) */}
        <div className="hidden lg:flex items-center font-sans text-xs text-white/90 font-medium px-2 py-1 rounded bg-black/10 border border-white/10">
          <span>{timeString}</span>
        </div>

        {/* Dashboard Home Shortcut */}
        <button
          onClick={() => onSelectTab("dashboard")}
          title={t.dashboard}
          className={`p-2 rounded transition-colors cursor-pointer ${
            activeTab === "dashboard" ? "bg-black/25 text-white" : "hover:bg-black/15 text-white/90"
          }`}
        >
          <FaHouse size={15} />
        </button>

        {/* Refresh / Sync Button */}
        <button
          onClick={onRefreshOrders}
          title={t.syncData}
          disabled={isRefreshing}
          className="p-2 rounded hover:bg-black/15 text-white/90 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
        >
          <FaRotate size={15} className={isRefreshing ? "animate-spin" : ""} />
        </button>

        {/* POS Cashier Quick Screen Shortcut */}
        <button
          onClick={() => onSelectTab("pos")}
          title={t.posTerminal}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded font-sans text-xs font-bold transition-all cursor-pointer shadow-sm ${
            activeTab === "pos"
              ? "bg-white text-[#d32f2f] shadow-md"
              : "bg-black/20 hover:bg-black/30 text-white border border-white/20"
          }`}
        >
          <FaTv size={14} />
          <span className="hidden sm:inline">POS</span>
        </button>

        {/* Shortcuts Guide Button */}
        <button
          onClick={onOpenShortcuts}
          title={t.shortcuts}
          className="p-2 rounded hover:bg-black/15 text-white/90 hover:text-white transition-colors cursor-pointer hidden sm:flex items-center"
        >
          <FaKeyboard size={15} />
        </button>

        {/* Sound toggle button */}
        <button
          onClick={onToggleSound}
          title={soundEnabled ? "Mute audio chimes" : "Enable order chime"}
          className="p-2 rounded hover:bg-black/15 text-white/90 hover:text-white transition-colors cursor-pointer"
        >
          {soundEnabled ? <FaVolumeHigh size={15} /> : <FaVolumeXmark size={15} className="text-white/60" />}
        </button>

        {/* Notification Bell with Badge */}
        <button
          onClick={() => onSelectTab("sales")}
          title={`${t.notifications}: ${pendingOrdersCount} ${t.openInvoices}`}
          className="relative p-2 rounded hover:bg-black/15 text-white transition-colors cursor-pointer"
        >
          <FaBell size={15} />
          {pendingOrdersCount > 0 && (
            <span className="absolute 1 top-1 right-1 size-4 rounded-full bg-amber-400 text-black text-[10px] font-black flex items-center justify-center font-mono shadow-md animate-pulse">
              {pendingOrdersCount > 9 ? "9+" : pendingOrdersCount}
            </span>
          )}
        </button>

        {/* Admin User Profile Dropdown */}
        <div className="relative ml-1">
          <button
            onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-full bg-black/20 hover:bg-black/30 transition-colors cursor-pointer border border-white/20 text-white"
          >
            <div className="size-6 rounded-full bg-white text-[#d32f2f] font-black flex items-center justify-center text-xs shadow-inner overflow-hidden">
              {adminAvatar ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={adminAvatar} alt="" className="size-full object-cover" />
              ) : (
                adminName.charAt(0).toUpperCase()
              )}
            </div>
            <span className="font-sans text-xs font-bold hidden md:inline truncate max-w-[120px]">
              {adminName}
            </span>
            <FaChevronDown size={10} className="text-white/70" />
          </button>

          {isUserDropdownOpen && (
            <div
              className="absolute right-0 top-full mt-2 w-56 bg-[#222733] border border-white/15 rounded-xl shadow-2xl py-2 z-50 text-white font-sans text-xs"
              onClick={() => setIsUserDropdownOpen(false)}
            >
              <div className="px-4 py-2 border-b border-white/10">
                <p className="font-bold text-white text-sm truncate">{adminName}</p>
                <p className="text-[11px] text-white/60 font-mono">
                  {adminRole === "admin" ? "Główny Administrator" : "Personel POS"}
                </p>
              </div>

              <button
                onClick={() => onSelectTab("settings")}
                className="w-full text-left px-4 py-2.5 hover:bg-white/10 flex items-center gap-2.5 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <FaShop size={13} className="text-emerald-400" />
                <span>{t.settings}</span>
              </button>

              <button
                onClick={onLockTerminal}
                className="w-full text-left px-4 py-2.5 hover:bg-white/10 flex items-center gap-2.5 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <FaLock size={13} className="text-amber-400" />
                <span>{t.lockTerminal}</span>
              </button>

              <div className="border-t border-white/10 mt-1 pt-1">
                <Link
                  href="/"
                  className="w-full text-left px-4 py-2 hover:bg-white/10 flex items-center gap-2.5 text-white/70 hover:text-white transition-colors"
                >
                  <FaHouse size={13} />
                  <span>Skate-OK Store</span>
                </Link>

                <button
                  onClick={onLockTerminal}
                  className="w-full text-left px-4 py-2 hover:bg-red-500/20 text-red-400 hover:text-red-300 flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <FaRightFromBracket size={13} />
                  <span>{t.logout}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
