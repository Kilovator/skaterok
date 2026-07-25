import { Metadata } from "next";
import { Header } from "@/components/Header";
import { SkateMapDynamic } from "@/components/SkateMap";

export const metadata: Metadata = {
  title: "Mapa Deskorolkowa | SKET-OK",
  description: "Odkrywaj najlepsze spoty, wydarzenia i twórz społeczność z innymi riderami w całej Polsce i świecie.",
};

export default function MapaPage() {
  return (
    <div className="flex flex-col min-h-screen bg-brand-black overflow-hidden relative">
      <Header />
      <main className="grow relative">
        <SkateMapDynamic />
      </main>
    </div>
  );
}
