"use client";

import clsx from "clsx";

import { Bounded } from "@/components/Bounded";
import { ButtonLink } from "@/components/ButtonLink";
import { Heading } from "@/components/Heading";
import { SlideIn } from "@/components/SlideIn";
import { ParallaxImage } from "./ParallaxImage";
import { type TextAndImageSection } from "@/data/homepage";
import { useLanguage } from "@/context/LanguageContext";

declare module "react" {
  interface CSSProperties {
    "--index"?: number;
  }
}

type Props = {
  data: TextAndImageSection;
  index: number;
};

// Map section IDs to their translation key prefix
const sectionKeyMap: Record<string, string> = {
  "tai-1": "tai1",
  "tai-2": "tai2",
  "tai-3": "tai3",
};

const TextAndImage = ({ data, index }: Props): JSX.Element => {
  const { t } = useLanguage();
  const keyPrefix = sectionKeyMap[data.id] || "";

  const heading = keyPrefix ? t(`${keyPrefix}.heading` as any) : data.heading;
  const body = keyPrefix ? t(`${keyPrefix}.body` as any) : data.body;
  const buttonText = keyPrefix ? t(`${keyPrefix}.buttonText` as any) : data.buttonText;

  return (
    <Bounded
      className={clsx(
        "sticky top-[calc(var(--index)*2rem)]",
        data.theme === "Blue" && "bg-texture bg-brand-amethyst text-white",
        data.theme === "Orange" && "bg-texture bg-brand-deep text-white",
        data.theme === "Navy" && "bg-texture bg-brand-black text-white",
        data.theme === "Lime" && "bg-texture bg-brand-fog text-zinc-800"
      )}
      style={{ "--index": index }}
    >
      <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-24">
        <div
          className={clsx(
            "flex min-w-0 flex-col items-center gap-8 text-center md:items-start md:text-left overflow-hidden",
            data.variation === "imageOnLeft" && "md:order-2"
          )}
        >
          <SlideIn>
            <Heading size="lg" as="h2" className="break-words hyphens-auto w-full">
              {heading}
            </Heading>
          </SlideIn>
          <SlideIn>
            <div className="max-w-md text-lg leading-relaxed">
              <p>{body}</p>
            </div>
          </SlideIn>
          <SlideIn>
            <ButtonLink
              href={data.buttonHref}
              color={data.theme === "Lime" ? "purple" : "orange"}
            >
              {buttonText}
            </ButtonLink>
          </SlideIn>
        </div>

        <ParallaxImage
          foregroundImage={data.foregroundImage}
          backgroundImage={data.backgroundImage}
          id={data.id}
        />
      </div>
    </Bounded>
  );
};

export default TextAndImage;
