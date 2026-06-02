import { Bounded } from "@/components/Bounded";
import { Heading } from "@/components/Heading";
import { Skater } from "./Skater";
import { SlideIn } from "@/components/SlideIn";
import { teamGridData } from "@/data/homepage";
import { skaters } from "@/data/skaters";

const TeamGrid = (): JSX.Element => {
  return (
    <Bounded
      id="team"
      className="bg-texture bg-brand-black"
    >
      <SlideIn>
        <Heading as="h2" size="lg" className="mb-8 text-center text-white">
          {teamGridData.heading}
        </Heading>
      </SlideIn>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
        {skaters.map((skater, index) => (
          <SlideIn key={skater.id}>
            <Skater index={index} skater={skater} />
          </SlideIn>
        ))}
      </div>
    </Bounded>
  );
};

export default TeamGrid;
