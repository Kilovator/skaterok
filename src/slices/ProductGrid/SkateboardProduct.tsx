"use client";

import Link from "next/link";
import { FaStar, FaArrowRight } from "react-icons/fa6";
import { HorizontalLine, VerticalLine } from "@/components/Line";
import { Scribble } from "./Scribble";
import { type CategoryBlock } from "@/data/products";

type Props = {
  category: CategoryBlock;
};

const VERTICAL_LINE_CLASSES =
  "absolute top-0 h-full stroke-2 text-stone-300 transition-colors group-hover:text-stone-400";

const HORIZONTAL_LINE_CLASSES =
  "-mx-8 stroke-2 text-stone-300 transition-colors group-hover:text-stone-400";

export function SkateboardProduct({ category }: Props) {
  return (
    <div className="group relative mx-auto w-full max-w-72 px-8 pt-4">
      <VerticalLine className={`${VERTICAL_LINE_CLASSES} left-4`} />
      <VerticalLine className={`${VERTICAL_LINE_CLASSES} right-4`} />
      <HorizontalLine className={HORIZONTAL_LINE_CLASSES} />

      <div className="flex items-center justify-between ~text-sm/2xl font-bold font-sans">
        <span>{category.priceTag}</span>
        <span className="inline-flex items-center gap-1">
          <FaStar className="text-yellow-400" /> {category.rating.toFixed(1)}
        </span>
      </div>

      {/* Image container with original 3D scale animation */}
      <div className="-mb-1 overflow-hidden py-4 relative h-72">
        <Scribble
          className="absolute inset-0 h-full w-full"
          color={category.dominantColor}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={category.image.src}
          alt={category.image.alt}
          className="mx-auto h-full w-[65%] object-cover rounded-2xl origin-top transform-gpu transition-transform duration-500 ease-in-out group-hover:scale-150 shadow-xl"
        />
      </div>

      <HorizontalLine className={HORIZONTAL_LINE_CLASSES} />

      <h3 className="my-3 text-center font-sans font-bold leading-tight ~text-base/lg text-zinc-900">
        {category.name}
      </h3>

      {/* Hover Overlay: ONLY ONE BUTTON "PRZEJDŹ DO TOWARÓW" -> Navigates to /sklep */}
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-black/60 backdrop-blur-sm rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100">
        <Link
          href={`/sklep?cat=${category.id}`}
          className="button-cutout group/btn mx-2 inline-flex items-center justify-center gap-2 bg-gradient-to-b from-brand-amethyst to-purple-700 from-25% to-75% bg-[length:100%_400%] px-4 py-3 text-sm font-bold text-white transition-[background-position] duration-300 hover:bg-bottom shadow-2xl cursor-pointer uppercase tracking-wider text-center"
        >
          <span>Przejdź do Towarów</span>
          <FaArrowRight className="size-4 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
