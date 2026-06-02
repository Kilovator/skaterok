import type { Metadata } from "next";
import { Bowlby_One_SC, DM_Mono } from "next/font/google";

import "./globals.css";
import { SVGFilters } from "@/components/SVGFilters";
import { siteSettings } from "@/data/settings";
import { LanguageProvider } from "@/context/LanguageContext";

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
        className={`${bowlby.variable} ${dmMono.variable} antialiased font-mono font-medium text-zinc-800 bg-brand-black`}
      >
        <LanguageProvider>
          <main>{children}</main>
        </LanguageProvider>
        <SVGFilters />
      </body>
    </html>
  );
}
