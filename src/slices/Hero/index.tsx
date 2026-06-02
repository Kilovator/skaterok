"use client";

import { Bounded } from "@/components/Bounded";
import { Heading } from "@/components/Heading";
import { ButtonLink } from "@/components/ButtonLink";
import { WideLogo } from "./WideLogo";
import { TallLogo } from "./TallLogo";
import { InteractiveSkateboard } from "./InteractiveSkateboard";
import { heroData } from "@/data/homepage";
import { useLanguage } from "@/context/LanguageContext";

const Hero = (): JSX.Element => {
  const { t } = useLanguage();

  return (
    <Bounded className="bg-brand-black relative h-dvh overflow-hidden text-white bg-texture">
      <div className="absolute inset-0 flex items-center pt-20">
        <WideLogo className="w-full text-brand-amethyst hidden opacity-30 mix-blend-overlay lg:block" />
        <TallLogo className="w-full text-brand-amethyst opacity-30 mix-blend-overlay lg:hidden" />
      </div>

      <div className="absolute inset-0 mx-auto mt-24 grid max-w-6xl grid-rows-[1fr,auto] place-items-end px-6 ~py-10/16">
        <Heading className="relative max-w-2xl place-self-start">
          {t("hero.heading")}
        </Heading>
        <div className="flex relative w-full flex-col items-center justify-between ~gap-2/4 lg:flex-row">
          <div className="max-w-[45ch] font-semibold ~text-lg/xl">
            <p>{t("hero.body")}</p>
          </div>
          <ButtonLink
            href={heroData.buttonHref}
            icon="skateboard"
            size="lg"
            className="z-20 mt-2 block"
          >
            {t("hero.buttonText")}
          </ButtonLink>
        </div>
      </div>

      <InteractiveSkateboard
        deckTextureURL={heroData.deckTextureURL}
        wheelTextureURL={heroData.wheelTextureURL}
        truckColor={heroData.truckColor}
        boltColor={heroData.boltColor}
      />
    </Bounded>
  );
};

export default Hero;
