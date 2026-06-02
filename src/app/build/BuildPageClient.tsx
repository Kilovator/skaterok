"use client";

import { Heading } from "@/components/Heading";
import { ButtonLink } from "@/components/ButtonLink";
import { useLanguage } from "@/context/LanguageContext";

type Props = {
  children: React.ReactNode;
};

export function BuildPageClient({ children }: Props) {
  const { t } = useLanguage();

  return (
    <div className="grow bg-texture bg-brand-deep text-white ~p-4/6 lg:w-96 lg:shrink-0 lg:grow-0">
      <Heading as="h1" size="sm" className="mb-6 mt-0">
        {t("build.heading")}
      </Heading>
      {children}
      <ButtonLink href="" color="orange" icon="plus">
        {t("build.addToCart")}
      </ButtonLink>
    </div>
  );
}
