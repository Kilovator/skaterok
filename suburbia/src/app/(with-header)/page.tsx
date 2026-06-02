import Hero from "@/slices/Hero";
import ProductGrid from "@/slices/ProductGrid";
import TeamGrid from "@/slices/TeamGrid";
import TextAndImage from "@/slices/TextAndImage";
import VideoBlock from "@/slices/VideoBlock";
import { textAndImageSections } from "@/data/homepage";

export default function Page() {
  return (
    <>
      <Hero />
      <ProductGrid />
      <div>
        {textAndImageSections.map((section, i) => (
          <TextAndImage key={section.id} data={section} index={i} />
        ))}
      </div>
      <TeamGrid />
      <VideoBlock />
    </>
  );
}
