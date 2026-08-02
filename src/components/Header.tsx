"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { CartButton } from "./CartButton";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { siteSettings } from "@/data/settings";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { FaRightToBracket, FaBars, FaXmark } from "react-icons/fa6";

export function Header() {
  const { t } = useLanguage();
  const { user, isLoggedIn, openAuthModal } = useAuth();
  const pathname = usePathname();
  const isMapPage = pathname === "/mapa";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="header absolute left-0 right-0 top-0 z-50 px-2.5 sm:px-4 py-2.5 lg:py-6 text-white max-w-full overflow-hidden">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-1.5 sm:gap-4">
        
        {/* Left: Logo */}
        <Link href="/" className="shrink-0 max-w-[110px] sm:max-w-none">
          <Logo className="text-brand-amethyst h-6 sm:h-8 lg:h-12 w-auto" />
        </Link>

        {/* Center: Desktop Navigation */}
        <nav aria-label="Main" className="hidden lg:flex items-center justify-center py-1">
          <ul className="flex items-center gap-x-10">
            {siteSettings.navigation.map((item) => (
              <li key={item.labelKey} className="shrink-0">
                <Link
                  href={item.href}
                  className="font-mono text-base md:text-lg font-medium tracking-wide text-white/90 hover:text-brand-amethyst transition-colors"
                >
                  {t(item.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Right: Controls, Account & Mobile Menu Toggle */}
        <div className="flex items-center justify-end gap-1.5 sm:gap-3 lg:gap-5 shrink-0">
          <div className="scale-80 sm:scale-100 origin-right shrink-0">
            <LanguageSwitcher />
          </div>

          {/* User Account / Login Button */}
          {isLoggedIn && user ? (
            <Link
              href="/account"
              className="flex items-center gap-1.5 sm:gap-2.5 px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-full bg-brand-amethyst/25 hover:bg-brand-amethyst/40 border border-brand-amethyst/50 text-[11px] sm:text-xs md:text-sm font-mono font-medium tracking-wide text-white transition-all shadow-md hover:scale-105 shrink-0 whitespace-nowrap"
              title={t("nav.account")}
            >
              <div className="size-5 sm:size-6 md:size-7 rounded-full bg-brand-amethyst text-white flex items-center justify-center text-[10px] sm:text-xs font-mono shrink-0 shadow-inner overflow-hidden border border-white/20">
                {user.avatar && !user.avatar.startsWith("blob:") ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={user.avatar}
                    alt=""
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                    className="size-full object-cover"
                  />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <span className="hidden sm:inline max-w-[110px] truncate">
                {user.name.split(" ")[0]}
              </span>
            </Link>
          ) : (
            <button
              onClick={() => openAuthModal("login")}
              className="flex items-center gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-[11px] sm:text-xs md:text-sm font-mono font-medium tracking-wide text-white transition-all cursor-pointer whitespace-nowrap hover:scale-105 shadow-md shrink-0"
            >
              <FaRightToBracket size={12} className="text-brand-amethyst shrink-0 sm:text-[14px]" />
              <span className="hidden sm:inline">{t("nav.login")}</span>
            </button>
          )}

          {!isMapPage && <CartButton />}

          {/* Mobile Hamburger Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all cursor-pointer shrink-0"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <FaXmark size={18} /> : <FaBars size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-14 sm:top-16 z-40 bg-brand-black/95 backdrop-blur-2xl border-b border-brand-amethyst/30 p-5 shadow-2xl shadow-purple-950/50 animate-fade-in max-w-full overflow-hidden">
          <nav aria-label="Mobile Main">
            <ul className="flex flex-col gap-3 text-center">
              {siteSettings.navigation.map((item) => (
                <li key={item.labelKey}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2.5 px-5 rounded-2xl bg-white/5 hover:bg-brand-amethyst/20 border border-white/10 font-mono text-base font-bold tracking-wider text-white transition-all"
                  >
                    {t(item.labelKey)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}
