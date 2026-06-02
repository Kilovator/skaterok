import { Logo } from "@/components/Logo";
import Link from "next/link";

import { CustomizerControlsProvider } from "./context";
import Preview from "./Preview";
import Controls from "./Controls";
import Loading from "./Loading";
import { BuildPageClient } from "./BuildPageClient";
import { decks, wheels, metals } from "@/data/boardCustomizer";

type SearchParams = {
  wheel?: string;
  deck?: string;
  truck?: string;
  bolt?: string;
};

export default async function Page(props: {
  searchParams: Promise<SearchParams>;
}) {
  const searchParams = await props.searchParams;

  const defaultWheel = wheels.find((w) => w.uid === searchParams.wheel) ?? wheels[0];
  const defaultDeck = decks.find((d) => d.uid === searchParams.deck) ?? decks[0];
  const defaultTruck = metals.find((m) => m.uid === searchParams.truck) ?? metals[0];
  const defaultBolt = metals.find((m) => m.uid === searchParams.bolt) ?? metals[0];

  const wheelTextureURLs = wheels.map((w) => w.textureUrl);
  const deckTextureURLs = decks.map((d) => d.textureUrl);

  return (
    <div className="flex min-h-screen flex-col lg:flex-row">
      <CustomizerControlsProvider
        defaultWheel={defaultWheel}
        defaultDeck={defaultDeck}
        defaultTruck={defaultTruck}
        defaultBolt={defaultBolt}
      >
        <div className="relative aspect-square shrink-0 bg-brand-black lg:aspect-auto lg:grow">
          <div className="absolute inset-0">
            <Preview
              deckTextureURLs={deckTextureURLs}
              wheelTextureURLs={wheelTextureURLs}
            />
          </div>

          <Link href="/" className="absolute left-6 top-6">
            <Logo className="h-12 text-white" />
          </Link>
        </div>
        <BuildPageClient>
          <Controls
            wheels={wheels}
            decks={decks}
            metals={metals}
            className="mb-6"
          />
        </BuildPageClient>
      </CustomizerControlsProvider>
      <Loading />
    </div>
  );
}

