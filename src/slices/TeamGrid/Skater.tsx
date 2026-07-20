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
<<<<<<< HEAD
    <div className="skater group relative flex flex-col items-center gap-4 w-full">
      <div className="relative overflow-hidden w-full aspect-[4/5] bg-brand-gray rounded-md">
=======
    <div className="skater group relative flex flex-col items-center gap-4">
      <div className="stack-layout relative w-full overflow-hidden aspect-square">
>>>>>>> b6a3b22b20fede2df7ceb6dc701a4e193d81ba4b
        <Image
          src={skater.photoBackground.src}
          alt={skater.photoBackground.alt}
          fill
<<<<<<< HEAD
          quality={20}
          className="object-cover scale-110 transform transition-all duration-1000 ease-in-out group-hover:scale-100 group-hover:brightness-75 group-hover:saturate-[.8]"
        />
        <div className="absolute inset-0 flex items-center justify-center">
            <SkaterScribble className={clsx("w-full h-full opacity-80", scribbleColor)} />
        </div>
=======
          quality={80}
          className="object-cover scale-110 transform transition-all duration-1000 ease-in-out group-hover:scale-100 group-hover:brightness-75 group-hover:saturate-[.8]"
        />
        <SkaterScribble className={clsx("relative z-10 w-full h-full", scribbleColor)} />
>>>>>>> b6a3b22b20fede2df7ceb6dc701a4e193d81ba4b
        <Image
          src={skater.photoForeground.src}
          alt={skater.photoForeground.alt}
          fill
<<<<<<< HEAD
          className={clsx(
            "object-contain transform transition-transform duration-1000 ease-in-out",
            skater.firstName === "Carter" && "scale-[1.2] group-hover:scale-[1.25]",
            skater.firstName === "Jordan" && "scale-[1.4] group-hover:scale-[1.5]",
            skater.firstName === "Sophie" && "scale-[2.2] group-hover:scale-[2.25]",
            (skater.firstName !== "Carter" && skater.firstName !== "Sophie" && skater.firstName !== "Jordan") && "scale-100 group-hover:scale-110"
          )}
        />
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none"></div>
        <h3 className="absolute bottom-4 left-4 z-10 font-sans text-white ~text-2xl/3xl w-full text-left">
=======
          style={{ scale: skater.foregroundScale ?? 1 }}
          className="object-contain z-20 transform transition-transform duration-1000 ease-in-out group-hover:scale-110"
        />
        <div className="relative z-30 h-48 w-full place-self-end bg-gradient-to-t from-black via-transparent to-transparent"></div>
        <h3 className="relative z-30 grid place-self-end justify-self-start p-2 font-sans text-white ~text-2xl/3xl">
>>>>>>> b6a3b22b20fede2df7ceb6dc701a4e193d81ba4b
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
