"use client";

import { Bounded } from "@/components/Bounded";
import { Heading } from "@/components/Heading";
import { SkateboardProduct } from "./SkateboardProduct";
import { SlideIn } from "@/components/SlideIn";
import { electricCategories } from "@/data/products";
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
        <div className="text-center ~mb-6/10 max-w-2xl mx-auto">
          <p className="text-stone-600 font-sans text-sm md:text-base leading-relaxed">
            {t("products.body")}
          </p>
        </div>
      </SlideIn>

      {/* 3 Electric Category Blocks */}
      <div className="grid w-full grid-cols-1 gap-6 md:grid-cols-3 max-w-5xl mx-auto">
        {electricCategories.map((cat) => (
          <SkateboardProduct
            key={cat.id}
            category={cat}
          />
        ))}
      </div>
    </Bounded>
  );
};

export default ProductGrid;
