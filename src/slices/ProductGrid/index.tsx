"use client";

import { Bounded } from "@/components/Bounded";
import { Heading } from "@/components/Heading";
import { SkateboardProduct } from "./SkateboardProduct";
import { SlideIn } from "@/components/SlideIn";
import { products } from "@/data/products";
import { useLanguage } from "@/context/LanguageContext";

const ProductGrid = (): JSX.Element => {
  const { t } = useLanguage();

  return (
    <Bounded
      id="products"
      className="bg-texture bg-brand-fog text-zinc-800"
    >
      <SlideIn>
        <Heading className="text-center ~mb-4/6" as="h2">
          {t("products.heading")}
        </Heading>
      </SlideIn>
      <SlideIn>
        <div className="text-center ~mb-6/10">
          <p>{t("products.body")}</p>
        </div>
      </SlideIn>
      <div className="grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <SkateboardProduct key={product.id} product={product} />
        ))}
      </div>
    </Bounded>
  );
};

export default ProductGrid;
