import Image from "next/image";
import Link from "next/link";
import { SkaterScribble } from "./SkaterScribble";
import clsx from "clsx";
import { type Skater as SkaterType } from "@/data/skaters";
import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  skater: SkaterType;
  index: number;
};

export function Skater({ skater, index }: Props) {
  const { t } = useLanguage();
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
    <Link
      href={skater.customizerLink}
      className="skater group relative flex flex-col items-center gap-2 md:gap-4 w-full block transition-transform duration-300 hover:scale-[1.02]"
    >
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
            "object-contain z-20 transform transition-transform duration-1000 ease-in-out origin-bottom",
            skater.firstName === "Carter" && "object-bottom scale-[1.20] md:group-hover:scale-[1.25]",
            skater.firstName === "Dylan" && "object-right scale-[1.00] md:group-hover:scale-[1.05]",
            skater.firstName === "Jordan" && "object-bottom scale-[0.98] md:group-hover:scale-[1.03]",
            skater.firstName === "Sophie" && "object-bottom scale-[0.92] md:group-hover:scale-[0.97]"
          )}
        />
        <div className="relative z-30 h-48 w-full place-self-end bg-gradient-to-t from-black via-black/20 to-transparent pointer-events-none"></div>
        <h3 className="relative z-30 grid place-self-end justify-self-start p-2 md:p-4 font-sans text-white text-lg md:text-2xl text-left w-full leading-tight">
          <span className="mb-[-.3em] block">{skater.firstName}</span>
          {skater.lastName && <span className="block">{skater.lastName}</span>}
        </h3>

        {/* Hover overlay with translated button */}
        <div className="absolute inset-0 z-40 bg-brand-black/60 opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
          <div className="py-2.5 px-5 rounded-full bg-brand-amethyst text-white font-sans text-xs font-bold uppercase tracking-wider shadow-lg transform translate-y-4 md:group-hover:translate-y-0 transition-all duration-300 border border-brand-amethyst/30">
            {t("team.buildBoard")}
          </div>
        </div>
      </div>
    </Link>
  );
}
