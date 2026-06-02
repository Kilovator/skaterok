import clsx from "clsx";

import { Bounded } from "@/components/Bounded";
import { ButtonLink } from "@/components/ButtonLink";
import { Heading } from "@/components/Heading";
import { SlideIn } from "@/components/SlideIn";
import { ParallaxImage } from "./ParallaxImage";
import { type TextAndImageSection } from "@/data/homepage";

declare module "react" {
  interface CSSProperties {
    "--index"?: number;
  }
}

type Props = {
  data: TextAndImageSection;
  index: number;
};

const TextAndImage = ({ data, index }: Props): JSX.Element => {
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
            "flex flex-col items-center gap-8 text-center md:items-start md:text-left",
            data.variation === "imageOnLeft" && "md:order-2"
          )}
        >
          <SlideIn>
            <Heading size="lg" as="h2">
              {data.heading}
            </Heading>
          </SlideIn>
          <SlideIn>
            <div className="max-w-md text-lg leading-relaxed">
              <p>{data.body}</p>
            </div>
          </SlideIn>
          <SlideIn>
            <ButtonLink
              href={data.buttonHref}
              color={data.theme === "Lime" ? "purple" : "orange"}
            >
              {data.buttonText}
            </ButtonLink>
          </SlideIn>
        </div>

        <ParallaxImage
          foregroundImage={data.foregroundImage}
          backgroundImage={data.backgroundImage}
        />
      </div>
    </Bounded>
  );
};

export default TextAndImage;
