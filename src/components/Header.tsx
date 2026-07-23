"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { CartButton } from "./CartButton";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { siteSettings } from "@/data/settings";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { FaRightToBracket } from "react-icons/fa6";

export function Header() {
  const { t } = useLanguage();
  const { user, isLoggedIn, openAuthModal } = useAuth();

  return (
    <header className="header absolute left-0 right-0 top-0 z-50 px-4 py-3 lg:py-6 text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col lg:flex-row items-center justify-between gap-2.5 lg:gap-8">
        
        {/* Left: Logo */}
        <Link href="/" className="shrink-0">
          <Logo className="text-brand-amethyst h-8 lg:h-12" />
        </Link>

        {/* Center: Navigation - wrap on mobile to avoid scrollbar, horizontal on desktop */}
        <nav
          aria-label="Main"
          className="order-3 lg:order-2 w-full lg:w-auto flex justify-center py-1"
        >
          <ul className="flex flex-wrap lg:flex-nowrap items-center justify-center gap-x-6 gap-y-3 md:gap-x-10">
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

        {/* Right: Controls & Account */}
        <div className="order-2 lg:order-3 flex items-center justify-center gap-6 lg:gap-5 shrink-0 w-full lg:w-auto">
          <LanguageSwitcher />

          {/* User Account / Login Button */}
          {isLoggedIn && user ? (
            <Link
              href="/account"
              className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-brand-amethyst/25 hover:bg-brand-amethyst/40 border border-brand-amethyst/50 text-sm font-mono font-medium tracking-wide text-white transition-all shadow-md hover:scale-105 shrink-0 whitespace-nowrap"
              title={t("nav.account")}
            >
              <div className="size-7 rounded-full bg-brand-amethyst text-white flex items-center justify-center text-xs font-mono shrink-0 shadow-inner">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline max-w-[110px] truncate">
                {user.name.split(" ")[0]}
              </span>
            </Link>
          ) : (
            <button
              onClick={() => openAuthModal("login")}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-sm font-mono font-medium tracking-wide text-white transition-all cursor-pointer whitespace-nowrap hover:scale-105 shadow-md shrink-0"
            >
              <FaRightToBracket size={15} className="text-brand-amethyst shrink-0" />
              <span className="hidden sm:inline">{t("nav.login")}</span>
            </button>
          )}

          <CartButton />
        </div>
      </div>
    </header>
  );
}
