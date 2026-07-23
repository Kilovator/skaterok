import Image from "next/image";
import { ButtonLink } from "@/components/ButtonLink";
import { SkaterScribble } from "./SkaterScribble";
import clsx from "clsx";
import { type Skater as SkaterType } from "@/data/skaters";
import { useEffect, useRef, useState } from "react";

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
  const [inView, setInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        } else {
          setInView(false);
        }
      },
      { threshold: 0.5 } // Trigger when 50% of the element is visible
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="skater group relative flex flex-col items-center gap-2 md:gap-4 w-full">
      <div 
        ref={containerRef}
        className={clsx(
          "stack-layout relative overflow-hidden w-full aspect-[4/5] bg-brand-gray rounded-md transition-all duration-500",
          inView ? "is-active" : ""
        )}
      >
        <Image
          src={skater.photoBackground.src}
          alt={skater.photoBackground.alt}
          fill
          quality={20}
          sizes="(max-width: 768px) 50vw, 25vw"
          className={clsx(
            "object-cover transform transition-all duration-1000 ease-in-out md:group-hover:scale-100 md:group-hover:brightness-75 md:group-hover:saturate-[.8]",
            inView ? "scale-100 brightness-75 saturate-[.8]" : "scale-110"
          )}
        />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <SkaterScribble className={clsx("w-full h-full opacity-80", scribbleColor)} />
        </div>
        <Image
          src={skater.photoForeground.src}
          alt={skater.photoForeground.alt}
          fill
          sizes="(max-width: 768px) 50vw, 25vw"
          className={clsx(
            "object-contain z-20 transform transition-transform duration-1000 ease-in-out",
            skater.firstName === "Carter" && clsx("scale-[1.2] md:group-hover:scale-[1.25]", inView && "scale-[1.25]"),
            skater.firstName === "Jordan" && clsx("scale-[1.4] md:group-hover:scale-[1.5]", inView && "scale-[1.5]"),
            skater.firstName === "Sophie" && clsx("scale-[2.2] md:group-hover:scale-[2.25]", inView && "scale-[2.25]"),
            (skater.firstName !== "Carter" && skater.firstName !== "Sophie" && skater.firstName !== "Jordan") && clsx("scale-100 md:group-hover:scale-110", inView && "scale-110")
          )}
        />
        <div className="relative z-30 h-48 w-full place-self-end bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none"></div>
        <h3 className="relative z-30 grid place-self-end justify-self-start p-2 md:p-4 font-sans text-white text-lg md:text-2xl text-left w-full leading-tight">
          <span className="mb-[-.3em] block">{skater.firstName}</span>
          {skater.lastName && <span className="block">{skater.lastName}</span>}
        </h3>
      </div>
      <ButtonLink href={skater.customizerLink} size="sm" className="!text-xs md:!text-sm px-2">
        Build board
      </ButtonLink>
    </div>
  );
}
