import type { Metadata } from "next";
import { Bowlby_One_SC, DM_Mono, Plus_Jakarta_Sans } from "next/font/google";

import "./globals.css";
import { SVGFilters } from "@/components/SVGFilters";
import { siteSettings } from "@/data/settings";
import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { CartDrawer } from "@/components/CartDrawer";
import { AuthModal } from "@/components/AuthModal";

const bowlby = Bowlby_One_SC({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bowlby-sc",
  weight: "400",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-dm-mono",
  weight: "500",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: siteSettings.siteTitle,
  description: siteSettings.metaDescription,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body
        className={`${bowlby.variable} ${dmMono.variable} ${plusJakartaSans.variable} antialiased font-sans font-medium text-zinc-800 bg-brand-black`}
      >
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <main>{children}</main>
              <CartDrawer />
              <AuthModal />
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
        <SVGFilters />
      </body>
    </html>
  );
}
