export type SpotCategory = "skatepark" | "street" | "event" | "diy";

export type SpotReview = {
  id: string;
  author: string;
  avatar?: string;
  text: string;
  date: string;
  emoji?: string;
  rating?: number;
};

export type SkateSpot = {
  id: string;
  name: string;
  category: SpotCategory;
  lat: number;
  lng: number;
  city?: string;
  address: string;
  rating: number;
  activeRidersCount: number;
  description: string;
  image: string;
  eventDate?: string;
  expiresAt?: number; // Expiration timestamp in ms for temporary events/meetups
  reactions: {
    fire: number;
    skate: number;
    shaka: number;
    lightning: number;
    trophy: number;
  };
  reviews: SpotReview[];
  createdBy?: string;
};

export const INITIAL_SKATE_SPOTS: SkateSpot[] = [
  {
    id: "spot-1",
    name: "Skatepark Jutrzenka Warsaw",
    category: "skatepark",
    lat: 52.2035,
    lng: 20.9412,
    address: "ul. Jutrzenki 156, Warszawa",
    rating: 4.9,
    activeRidersCount: 24,
    description: "Kultowy zadaszony i otwarty skatepark w Warszawie. Smooth beton, głębokie bowle, sekcje street i schody z poręczami.",
    image: "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 142, skate: 215, shaka: 89, lightning: 54, trophy: 31 },
    reviews: [
      {
        id: "r1",
        author: "Kamil 'Flip' Kowalski",
        text: "Najlepszy gładki beton w mieście! Wieczorami klimat jest niesamowity, zawsze znajdziesz kogoś do wspólnej sesji.",
        date: "Wczoraj, 19:40",
        emoji: "🔥",
        rating: 5,
      },
      {
        id: "r2",
        author: "Marek SKET",
        text: "Idealny hub na jesienne i zimowe dni. Nawierzchnia trzyma świetnie.",
        date: "3 dni temu",
        emoji: "🛹",
        rating: 5,
      },
    ],
  },
  {
    id: "spot-2",
    name: "Capitol Ledges Street Spot",
    category: "street",
    lat: 52.2319,
    lng: 21.0067,
    address: "Plac Defilad / Marszałkowska",
    rating: 4.7,
    activeRidersCount: 18,
    description: "Słynne marmurowe murki i schody w centrum Warszawy. Idealny spot do kręcenia streetowych filmów i grindów.",
    image: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 98, skate: 130, shaka: 45, lightning: 38, trophy: 12 },
    reviews: [
      {
        id: "r3",
        author: "Piotr StreetRider",
        text: "Marmur idzie jak masełko. Trzeba tylko uważać na ochronę po 20:00!",
        date: "Dzisiaj, 14:15",
        emoji: "⚡",
        rating: 5,
      },
    ],
  },
  {
    id: "spot-3",
    name: "Warsaw Night Street Session & Best Trick",
    category: "event",
    lat: 52.2396,
    lng: 21.0122,
    address: "Bulwary Wiślane przy Moście Świętokrzyskim",
    rating: 5.0,
    activeRidersCount: 65,
    eventDate: "Dzisiaj, do 23:00 — Wstęp wolny",
    expiresAt: Date.now() + 6 * 3600 * 1000, // Active for 6 hours
    description: "Ogromna сходка i zawody Best Trick! Muzyka z DJ trucka, darmowa woskownica, napoje i nagrody od SKET-OK.",
    image: "https://images.unsplash.com/photo-1564982752979-3f7bc974d29a?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 230, skate: 310, shaka: 180, lightning: 95, trophy: 110 },
    reviews: [
      {
        id: "r4",
        author: "Ania SkateQueen",
        text: "Wpadam ze swoją ekipą! Złożyliśmy specjalne deski w Kreatorze na tę okazję!",
        date: "Dzisiaj, 11:00",
        emoji: "🏆",
        rating: 5,
      },
    ],
  },
  {
    id: "spot-archived-1",
    name: "Otwarcie Sezonu Skate Jam 2026 (Zakończone)",
    category: "event",
    lat: 52.2150,
    lng: 21.0350,
    address: "Stadion Narodowy Plaza",
    rating: 4.9,
    activeRidersCount: 0,
    eventDate: "Minione wydarzenie",
    expiresAt: Date.now() - 24 * 3600 * 1000, // Already expired (Archived)
    description: "Poprzednia сходка sezonowa. Wydarzenie zakończone i przeniesione do archiwum.",
    image: "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 180, skate: 240, shaka: 110, lightning: 60, trophy: 75 },
    reviews: [
      {
        id: "r5",
        author: "Tomek 'Ollie'",
        text: "Świetna сходка была! Czekamy na kolejną edycję!",
        date: "Tydzień temu",
        emoji: "🔥",
        rating: 5,
      },
    ],
  },
  {
    id: "spot-4",
    name: "Park Jordana Bowl & Plaza",
    category: "skatepark",
    lat: 50.0617,
    lng: 19.9173,
    address: "Park im. Henryka Jordana, Kraków",
    rating: 4.8,
    activeRidersCount: 30,
    description: "Jeden z największych betonowych skateparków w południowej Polsce. Świetna sekcja płaska, piramidy i głęboki bowl.",
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 115, skate: 185, shaka: 70, lightning: 40, trophy: 22 },
    reviews: [],
  },
  {
    id: "spot-5",
    name: "Gdańsk Zaspa DIY Spot",
    category: "diy",
    lat: 54.3982,
    lng: 18.6015,
    address: "al. Rzeczypospolitej, Gdańsk",
    rating: 4.6,
    activeRidersCount: 12,
    description: "Lokalny DIY stworzony przez trójmiejskich skaterów. Rurki, kątowniki i betony wyprofilowane własnoręcznie.",
    image: "https://images.unsplash.com/photo-1516912821115-5a835ec9ee75?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 85, skate: 95, shaka: 60, lightning: 20, trophy: 15 },
    reviews: [],
  },
  {
    id: "spot-6",
    name: "MACBA Plaza Barcelona",
    category: "street",
    lat: 41.3832,
    lng: 2.1668,
    address: "Plaça dels Àngels, Barcelona, Hiszpania",
    rating: 5.0,
    activeRidersCount: 120,
    description: "Światowa stolica deskorolki! Najsłynniejszy murek i mekka skaterów z całego świata. Kto nie był, ten musi odwiedzić.",
    image: "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 450, skate: 620, shaka: 340, lightning: 210, trophy: 180 },
    reviews: [],
  },
];
