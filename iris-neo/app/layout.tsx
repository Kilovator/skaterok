import type { Metadata } from "next";
import { Orbitron, Share_Tech_Mono } from "next/font/google";
import "./globals.css";

const shareTechMono = Share_Tech_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
});

const orbitron = Orbitron({
  weight: ["500", "700"],
  subsets: ["latin"],
  variable: "--font-orbitron",
});

export const metadata: Metadata = {
  title: "Iris — Specimen Dossier",
  description: "Interactive 3D iris specimen dossier with cinematic HUD",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${shareTechMono.variable} ${orbitron.variable}`}>
        {children}
      </body>
    </html>
  );
}
