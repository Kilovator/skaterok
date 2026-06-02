"use client";

import Image from "next/image";
import { FaStar } from "react-icons/fa6";
import { ButtonLink } from "@/components/ButtonLink";
import { HorizontalLine, VerticalLine } from "@/components/Line";
import { Scribble } from "./Scribble";
import { type Product } from "@/data/products";
import { useCart } from "@/context/CartContext";

type Props = {
  product: Product;
};

const VERTICAL_LINE_CLASSES =
  "absolute top-0 h-full stroke-2 text-stone-300 transition-colors group-hover:text-stone-400";

const HORIZONTAL_LINE_CLASSES =
  "-mx-8 stroke-2 text-stone-300 transition-colors group-hover:text-stone-400";

export function SkateboardProduct({ product }: Props) {
  const { addItem } = useCart();
  const price = `$${(product.price / 100).toFixed(2)}`;

  return (
    <div className="group relative mx-auto w-full max-w-72 px-8 pt-4">
      <VerticalLine className={`${VERTICAL_LINE_CLASSES} left-4`} />
      <VerticalLine className={`${VERTICAL_LINE_CLASSES} right-4`} />
      <HorizontalLine className={HORIZONTAL_LINE_CLASSES} />

      <div className="flex items-center justify-between ~text-sm/2xl">
        <span>{price}</span>
        <span className="inline-flex items-center gap-1">
          <FaStar className="text-yellow-400" /> 37
        </span>
      </div>
      <div className="-mb-1 overflow-hidden py-4">
        <Scribble
          className="absolute inset-0 h-full w-full"
          color={product.dominantColor}
        />
        <Image
          src={product.image.src}
          alt={product.image.alt}
          width={150}
          height={400}
          className="mx-auto w-[58%] origin-top transform-gpu transition-transform duration-500 ease-in-out group-hover:scale-150"
        />
      </div>
      <HorizontalLine className={HORIZONTAL_LINE_CLASSES} />

      <h3 className="my-2 text-center font-sans leading-tight ~text-lg/xl">
        {product.name}
      </h3>

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <ButtonLink href={product.customizerLink} size="sm">Customize</ButtonLink>
        <button
          onClick={() => addItem(product)}
          className="button-cutout group/btn mx-4 inline-flex items-center gap-2 bg-gradient-to-b from-brand-deep to-brand-amethyst from-25% to-75% bg-[length:100%_400%] px-1 py-2 text-base font-bold text-white transition-[background-position] duration-300 hover:bg-bottom"
        >
          + Add to cart
        </button>
      </div>
    </div>
  );
}
