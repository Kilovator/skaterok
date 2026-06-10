import Image from "next/image";
import { ButtonLink } from "@/components/ButtonLink";
import { SkaterScribble } from "./SkaterScribble";
import clsx from "clsx";
import { type Skater as SkaterType } from "@/data/skaters";

type Props = {
  skater: SkaterType;
  index: number;
};

export function Skater({ skater, index }: Props) {
  const colors = [
    "text-brand-amethyst",
    "text-brand-pale",
    "text-brand-silver",
    "text-brand-fog",
    "text-white",
  ];

  const scribbleColor = colors[index % colors.length];

  return (
    <div className="skater group relative flex flex-col items-center gap-4">
      <div className="stack-layout relative w-full overflow-hidden aspect-square">
        <Image
          src={skater.photoBackground.src}
          alt={skater.photoBackground.alt}
          fill
          quality={80}
          className="object-cover scale-110 transform transition-all duration-1000 ease-in-out group-hover:scale-100 group-hover:brightness-75 group-hover:saturate-[.8]"
        />
        <SkaterScribble className={clsx("relative z-10 w-full h-full", scribbleColor)} />
        <Image
          src={skater.photoForeground.src}
          alt={skater.photoForeground.alt}
          fill
          style={{ scale: skater.foregroundScale ?? 1 }}
          className="object-contain z-20 transform transition-transform duration-1000 ease-in-out group-hover:scale-110"
        />
        <div className="relative z-30 h-48 w-full place-self-end bg-gradient-to-t from-black via-transparent to-transparent"></div>
        <h3 className="relative z-30 grid place-self-end justify-self-start p-2 font-sans text-white ~text-2xl/3xl">
          <span className="mb-[-.3em] block">{skater.firstName}</span>
          {skater.lastName && <span className="block">{skater.lastName}</span>}
        </h3>
      </div>
      <ButtonLink href={skater.customizerLink} size="sm">
        Build their board
      </ButtonLink>
    </div>
  );
}
