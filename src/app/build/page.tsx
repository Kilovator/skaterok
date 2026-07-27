import { Logo } from "@/components/Logo";
import Link from "next/link";

import { CustomizerControlsProvider } from "./context";
import Preview from "./Preview";
import Controls from "./Controls";
import Loading from "./Loading";
import { BuildPageClient, FloatingCartButtons } from "./BuildPageClient";
import { decks, wheels, metals } from "@/data/boardCustomizer";

type SearchParams = {
  wheel?: string;
  deck?: string;
  truck?: string;
  bolt?: string;
};

export default async function Page(props: {
  searchParams?: Promise<SearchParams>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};

  const defaultWheel = wheels.find((w) => w.uid === searchParams.wheel) ?? wheels[0];
  const defaultDeck = decks.find((d) => d.uid === searchParams.deck) ?? decks[0];
  const defaultTruck = metals.find((m) => m.uid === searchParams.truck) ?? metals[0];
  const defaultBolt = metals.find((m) => m.uid === searchParams.bolt) ?? metals[0];

  const wheelTextureURLs = wheels.map((w) => w.textureUrl);
  const deckTextureURLs = decks.map((d) => d.textureUrl);

  return (
    <div className="flex h-screen overflow-hidden flex-col lg:flex-row w-full">
      <CustomizerControlsProvider
        defaultWheel={defaultWheel}
        defaultDeck={defaultDeck}
        defaultTruck={defaultTruck}
        defaultBolt={defaultBolt}
      >
        {/* 3D Preview Viewport */}
        <div className="relative h-[45vh] lg:h-full w-full lg:w-auto lg:grow bg-brand-black shrink-0">
          <div className="absolute inset-0">
            <Preview
              deckTextureURLs={deckTextureURLs}
              wheelTextureURLs={wheelTextureURLs}
            />
          </div>

          <Link href="/" className="absolute left-4 top-4 z-20 md:left-6 md:top-6">
            <Logo className="h-7 sm:h-9 md:h-12 text-white drop-shadow-md" />
          </Link>

          {/* Floating Cart & Save Action Buttons */}
          <FloatingCartButtons />
        </div>

        <BuildPageClient>
          <Controls
            wheels={wheels}
            decks={decks}
            metals={metals}
            className="mb-2"
          />
        </BuildPageClient>
      </CustomizerControlsProvider>
      <Loading />
    </div>
  );
}
