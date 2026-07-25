"use client";

import dynamic from "next/dynamic";

export const SkateMapDynamic = dynamic(
  () => import("./SkateMap").then((mod) => mod.SkateMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[calc(100vh-80px)] mt-20 bg-brand-black flex flex-col items-center justify-center text-white gap-4 font-sans">
        <div className="size-12 rounded-full border-4 border-brand-amethyst border-t-transparent animate-spin" />
        <p className="text-sm font-bold uppercase tracking-wider text-white/70">
          Ładowanie Mapy Deskorolkowej...
        </p>
      </div>
    ),
  }
);
