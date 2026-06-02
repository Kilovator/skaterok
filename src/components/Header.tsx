"use client";

import Link from "next/link";
import { Logo } from "./Logo";
import { CartButton } from "./CartButton";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { siteSettings } from "@/data/settings";
import { useLanguage } from "@/context/LanguageContext";

export function Header() {
  const { t } = useLanguage();

  return (
    <header className="header absolute left-0 right-0 top-0 z-50 ~h-32/48 ~px-4/6 ~py-4/6 hd:h-32 text-white">
      <div className="mx-auto grid w-full max-w-6xl grid-cols-[auto,auto] items-center gap-6 md:grid-cols-[1fr,auto,1fr]">
        <Link href="/" className="justify-self-start">
          <Logo className="text-brand-amethyst ~h-12/20" />
        </Link>
        <nav
          aria-label="Main"
          className="col-span-full row-start-2 md:col-span-1 md:col-start-2 md:row-start-1"
        >
          <ul className="flex flex-wrap items-center justify-center gap-8">
            {siteSettings.navigation.map((item) => (
              <li key={item.labelKey}>
                <Link href={item.href} className="~text-lg/xl hover:text-brand-amethyst transition-colors">
                  {t(item.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-3 justify-self-end">
          <LanguageSwitcher />
          <CartButton />
        </div>
      </div>
    </header>
  );
}
