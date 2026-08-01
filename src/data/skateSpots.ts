export type SpotCategory = "skatepark" | "street" | "event" | "diy" | "shop";

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
  isCovered?: boolean; // Covered from rain / Indoor
  hasLighting?: boolean; // Open after dark with lights
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
  // --- WARSZAWA ---
  {
    id: "spot-1",
    name: "Skatepark Jutrzenka Warsaw",
    category: "skatepark",
    lat: 52.2035,
    lng: 20.9412,
    city: "Warszawa",
    address: "ul. Jutrzenki 156, Warszawa",
    rating: 4.9,
    activeRidersCount: 28,
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
    city: "Warszawa",
    address: "Plac Defilad / Marszałkowska, Warszawa",
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
    city: "Warszawa",
    address: "Bulwary Wiślane przy Moście Świętokrzyskim",
    rating: 5.0,
    activeRidersCount: 65,
    eventDate: "Dzisiaj, do 23:59 — Wstęp wolny",
    expiresAt: (() => {
      const now = new Date();
      const target = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59));
      if (target.getTime() <= now.getTime()) {
        target.setUTCDate(target.getUTCDate() + 1);
      }
      return target.getTime();
    })(),
    description: "Ogromne wydarzenie i zawody Best Trick! Muzyka z DJ trucka, darmowa woskownica, napoje i nagrody od SKET-OK.",
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

  // --- KRAKÓW ---
  {
    id: "spot-4",
    name: "Park Jordana Bowl & Plaza",
    category: "skatepark",
    lat: 50.0617,
    lng: 19.9173,
    city: "Kraków",
    address: "Park im. Henryka Jordana, Kraków",
    rating: 4.8,
    activeRidersCount: 32,
    description: "Jeden z największych i najbardziej gładkich betonowych skateparków w Polsce. Ogromny bowl, sekcja piramid, schody i rurki.",
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 145, skate: 198, shaka: 92, lightning: 60, trophy: 42 },
    reviews: [
      {
        id: "rk1",
        author: "Bartek Kraków",
        text: "Bowl na Jordana to klasyk! W weekendy atmosfera jest mega wspierająca.",
        date: "2 dni temu",
        emoji: "🔥",
        rating: 5,
      },
    ],
  },
  {
    id: "spot-kr-street",
    name: "Forum Przestrzenie Ledges & Bank",
    category: "street",
    lat: 50.0465,
    lng: 19.9362,
    city: "Kraków",
    address: "ul. Marii Konopnickiej 28, Kraków",
    rating: 4.6,
    activeRidersCount: 14,
    description: "Kultowy krakowski spot z idealnie wygładzonym krawężnikiem, zjazdami po bankach i widokiem na Wawel. Znakomita nawierzchnia.",
    image: "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 88, skate: 110, shaka: 54, lightning: 22, trophy: 10 },
    reviews: [],
  },

  // --- WROCŁAW ---
  {
    id: "spot-wro-1",
    name: "Zajezdnia Legnicka Skatepark",
    category: "skatepark",
    lat: 51.1215,
    lng: 16.9918,
    city: "Wrocław",
    address: "ul. Legnicka 65, Wrocław",
    rating: 4.9,
    activeRidersCount: 40,
    description: "Słynna wrocławska mekka deskorolkowa z zadaszeniem i kompletnym parkiem betonowym. Świetne hubby, rurki, minirampy i flatboardy.",
    image: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 175, skate: 240, shaka: 112, lightning: 75, trophy: 55 },
    reviews: [
      {
        id: "rw1",
        author: "WrocloveSkater",
        text: "Legnicka to najlepsze miejsce we Wrocławiu! Oświetlenie działa do późna.",
        date: "3 dni temu",
        emoji: "⚡",
        rating: 5,
      },
    ],
  },
  {
    id: "spot-wro-street",
    name: "Plac Wolności NFM Ledges",
    category: "street",
    lat: 51.1062,
    lng: 17.0305,
    city: "Wrocław",
    address: "Plac Wolności 1, Wrocław",
    rating: 4.7,
    activeRidersCount: 22,
    description: "Ogromny płaski plac z polerowanymi granitymi murkami przed Narodowym Forum Muzyki. Glajd idzie sam z siebie!",
    image: "https://images.unsplash.com/photo-1516912821115-5a835ec9ee75?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 120, skate: 165, shaka: 80, lightning: 45, trophy: 20 },
    reviews: [],
  },

  // --- TRÓJMIASTO (GDAŃSK, GDYNIA, SOPOT) ---
  {
    id: "spot-5",
    name: "Gdańsk Zaspa DIY & Plaza",
    category: "diy",
    lat: 54.3982,
    lng: 18.6015,
    city: "Gdańsk",
    address: "al. Rzeczypospolitej, Gdańsk",
    rating: 4.7,
    activeRidersCount: 19,
    description: "Legendarny lokalny DIY i betonowy skatepark stworzony przez trójmiejskich skaterów. Wyprofilowane kątowniki i zjazdy.",
    image: "https://images.unsplash.com/photo-1516912821115-5a835ec9ee75?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 95, skate: 140, shaka: 75, lightning: 32, trophy: 18 },
    reviews: [],
  },
  {
    id: "spot-gdynia-1",
    name: "Skatepark Gdynia Skwer Sue Ryder",
    category: "skatepark",
    lat: 54.5175,
    lng: 18.5470,
    city: "Gdynia",
    address: "ul. Zawiszy Czarnego, Gdynia",
    rating: 4.9,
    activeRidersCount: 35,
    description: "Prawdopodobnie najładniej położony betonowy skatepark w Polsce — tuż przy plaży i morzu! Nowoczesny bowl, piramidy i schody z railingiem.",
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 210, skate: 290, shaka: 155, lightning: 90, trophy: 68 },
    reviews: [
      {
        id: "rg1",
        author: "Morski Rider",
        text: "Jeździć na desce przy szumie fal morskich — bezcenne! Beton niesamowicie gładki.",
        date: "Wczoraj",
        emoji: "🌊",
        rating: 5,
      },
    ],
  },
  {
    id: "spot-sopot-ergo",
    name: "Sopot Ergo Arena Plaza",
    category: "street",
    lat: 54.4258,
    lng: 18.5714,
    city: "Sopot",
    address: "plac przy Ergo Arenie, Sopot/Gdańsk",
    rating: 4.5,
    activeRidersCount: 16,
    description: "Ogromny polerowany granitowy plac z murkami o różnej wysokości. Idealny do treningu technicznych trików flatground i grindów.",
    image: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 75, skate: 105, shaka: 42, lightning: 18, trophy: 9 },
    reviews: [],
  },

  // --- POZNAŃ ---
  {
    id: "spot-poznan-rataje",
    name: "Park Rataje Skatepark & Bowl",
    category: "skatepark",
    lat: 52.3892,
    lng: 16.9535,
    city: "Poznań",
    address: "Park Rataje, Poznań",
    rating: 4.8,
    activeRidersCount: 26,
    description: "Wielki, świetnie zaprojektowany betonowy skatepark z sekcją streetową, funboxami, bowlami i gładkim polerowanym betonem.",
    image: "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 132, skate: 180, shaka: 85, lightning: 50, trophy: 33 },
    reviews: [],
  },

  // --- KATOWICE & ŚLĄSK ---
  {
    id: "spot-katowice-ptg",
    name: "PTG Ledges & Monument Spot",
    category: "street",
    lat: 50.2825,
    lng: 18.9721,
    city: "Katowice",
    address: "Park Śląski / PTG, Katowice",
    rating: 4.8,
    activeRidersCount: 21,
    description: "Kultowy śląski street spot z idealnymi marmurowymi murkami i zjazdami. Miejsce dziesiątek sesji w polskich filmach deskorolkowych.",
    image: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 110, skate: 150, shaka: 68, lightning: 42, trophy: 25 },
    reviews: [],
  },
  {
    id: "spot-katowice-3stawy",
    name: "Skatepark Trzy Stawy Katowice",
    category: "skatepark",
    lat: 50.2421,
    lng: 19.0354,
    city: "Katowice",
    address: "Dolina Trzech Stawów, Katowice",
    rating: 4.7,
    activeRidersCount: 25,
    description: "Betonowy skatepark położony w zielonej Dolinie Trzech Stawów. Gładka nawierzchnia, rurki, quarterpipe i sekcja miniramp.",
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 98, skate: 135, shaka: 60, lightning: 35, trophy: 19 },
    reviews: [],
  },

  // --- ŁÓDŹ ---
  {
    id: "spot-lodz-zdrowie",
    name: "Park Zdrowie Concrete Skatepark",
    category: "skatepark",
    lat: 51.7682,
    lng: 19.4125,
    city: "Łódź",
    address: "Park im. Piłsudskiego, Łódź",
    rating: 4.8,
    activeRidersCount: 23,
    description: "Znakomity łódzki betonowy park z bowlami, zjazdami, schodkami i bardzo długimi rurkami na woskowanie.",
    image: "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 105, skate: 142, shaka: 70, lightning: 38, trophy: 24 },
    reviews: [],
  },

  // --- SZCZECIN ---
  {
    id: "spot-szczecin-arkonska",
    name: "Skatepark Arkońska Szczecin",
    category: "skatepark",
    lat: 53.4512,
    lng: 14.5420,
    city: "Szczecin",
    address: "Park Kasprowicza / Arkońska, Szczecin",
    rating: 4.7,
    activeRidersCount: 19,
    description: "Nowoczesny betonowy obiekt w Szczecinie z rozbudowanym płaskim plaza i zadaszonymi miejscami na odpoczynek.",
    image: "https://images.unsplash.com/photo-1516912821115-5a835ec9ee75?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 85, skate: 120, shaka: 55, lightning: 28, trophy: 16 },
    reviews: [],
  },

  // --- LUBLIN ---
  {
    id: "spot-lublin-rury",
    name: "Wąwóz Rury Skatepark Lublin",
    category: "skatepark",
    lat: 51.2378,
    lng: 22.5284,
    city: "Lublin",
    address: "Wąwóz Rury (ul. Zana), Lublin",
    rating: 4.6,
    activeRidersCount: 15,
    description: "Główny punkt lubelskich skaterów! Położony w malowniczym wąwozie, z rurkami, bankami i sekcją schodową.",
    image: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 72, skate: 98, shaka: 44, lightning: 20, trophy: 11 },
    reviews: [],
  },

  // --- RZESZÓW ---
  {
    id: "spot-rzeszow-podpromie",
    name: "Skatepark Podpromie Rzeszów",
    category: "skatepark",
    lat: 50.0312,
    lng: 22.0018,
    city: "Rzeszów",
    address: "ul. Podpromie 10, Rzeszów",
    rating: 4.7,
    activeRidersCount: 17,
    description: "Popularny rzeszowski park z sekcją streetową, schodami z poręczą i świetną atmosferą.",
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 80, skate: 105, shaka: 48, lightning: 22, trophy: 13 },
    reviews: [],
  },

  // --- ARCHIVED / INTERNATIONAL ---
  {
    id: "spot-archived-1",
    name: "Otwarcie Sezonu Skate Jam 2026 (Zakończone)",
    category: "event",
    lat: 52.2150,
    lng: 21.0350,
    city: "Warszawa",
    address: "Stadion Narodowy Plaza, Warszawa",
    rating: 4.9,
    activeRidersCount: 0,
    eventDate: "Minione wydarzenie",
    expiresAt: Date.now() - 24 * 3600 * 1000, // Already expired (Archived)
    description: "Poprzednie wydarzenie sezonowe. Wydarzenie zakończone i przeniesione do archiwum.",
    image: "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 180, skate: 240, shaka: 110, lightning: 60, trophy: 75 },
    reviews: [
      {
        id: "r5",
        author: "Tomek 'Ollie'",
        text: "Świetna impreza była! Czekamy na kolejną edycję!",
        date: "Tydzień temu",
        emoji: "🔥",
        rating: 5,
      },
    ],
  },
  {
    id: "spot-6",
    name: "MACBA Plaza Barcelona",
    category: "street",
    lat: 41.3832,
    lng: 2.1668,
    city: "Barcelona",
    address: "Plaça dels Àngels, Barcelona, Hiszpania",
    rating: 5.0,
    activeRidersCount: 120,
    description: "Światowa stolica deskorolki! Najsłynniejszy murek i mekka skaterów z całego świata. Kto nie był, ten musi odwiedzić.",
    image: "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 450, skate: 620, shaka: 340, lightning: 210, trophy: 180 },
    reviews: [],
  },

  // --- SKATESHOPY & SERWISY ---
  {
    id: "shop-sket-lab",
    name: "SKET-OK Central Lab & Skateshop",
    category: "shop",
    lat: 52.2300,
    lng: 21.0100,
    city: "Warszawa",
    address: "ul. Marszałkowska 100, Warszawa",
    rating: 5.0,
    activeRidersCount: 8,
    isCovered: true,
    description: "Flagowy sklep i strefa serwisowa SKET-OK! Montaż desek z Kreatora, darmowa woskownica, części zamienne, łożyska i strefa chillout dla skaterów.",
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 310, skate: 420, shaka: 210, lightning: 150, trophy: 95 },
    reviews: [
      {
        id: "rs1",
        author: "Piotr 'Grip'",
        text: "Najlepszy serwis w mieście! Wymienili łożyska od ręki i dostałem darmowy wosk!",
        date: "Dzisiaj",
        emoji: "🔥",
        rating: 5,
      },
    ],
  },
  {
    id: "shop-shcs-warsaw",
    name: "SHCS Skateshop Warszawa",
    category: "shop",
    lat: 52.2325,
    lng: 21.0150,
    city: "Warszawa",
    address: "ul. Chmielna, Warszawa",
    rating: 4.9,
    activeRidersCount: 5,
    isCovered: true,
    description: "Kultowy sklep deskorolkowy w centrum Warszawy. Ogromny wybór decków, kół, trucków i akcesoriów ulicznych.",
    image: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 140, skate: 190, shaka: 85, lightning: 40, trophy: 30 },
    reviews: [],
  },
  {
    id: "shop-amii-krakow",
    name: "Amii Skateshop Kraków",
    category: "shop",
    lat: 50.0580,
    lng: 19.9380,
    city: "Kraków",
    address: "ul. Grodzka 12, Kraków",
    rating: 4.8,
    activeRidersCount: 4,
    isCovered: true,
    description: "Krakowski hub sprzętowy tworzony przez lokalną ekipę. Pełny serwis, montaż gripów, woski oraz najnowsze kółka i łożyska.",
    image: "https://images.unsplash.com/photo-1516912821115-5a835ec9ee75?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 95, skate: 130, shaka: 60, lightning: 25, trophy: 18 },
    reviews: [],
  },
  {
    id: "shop-boarders-gdansk",
    name: "Boarders Skateshop Gdańsk",
    category: "shop",
    lat: 54.3490,
    lng: 18.6530,
    city: "Gdańsk",
    address: "ul. Długa 44, Gdańsk",
    rating: 4.9,
    activeRidersCount: 6,
    isCovered: true,
    description: "Główny trójmiejski skateshop ze sprzętem premium, ciuchami skate i punktem serwisowym.",
    image: "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 110, skate: 145, shaka: 70, lightning: 30, trophy: 20 },
    reviews: [],
  },

  // --- DODATKOWE SPOTY I SKATESHOPY W POLSCE ---
  {
    id: "spot-avepark-warszawa",
    name: "AvePark Kryty Skatepark Warszawa",
    category: "skatepark",
    lat: 52.1912,
    lng: 21.0540,
    city: "Warszawa",
    address: "ul. Krańcowa 14, Warszawa",
    rating: 4.9,
    activeRidersCount: 42,
    isCovered: true,
    hasLighting: true,
    description: "Całoroczny zadaszony skatepark w hali! Gładki drewniany park z resi-rampowym lądowaniem, foam pitem, rurkami i sekcją streetową.",
    image: "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 220, skate: 310, shaka: 140, lightning: 85, trophy: 60 },
    reviews: [],
  },
  {
    id: "shop-miniramp-poznan",
    name: "Miniramp Skateshop Poznań",
    category: "shop",
    lat: 52.4110,
    lng: 16.9150,
    city: "Poznań",
    address: "ul. Dąbrowskiego 24, Poznań",
    rating: 4.8,
    activeRidersCount: 7,
    isCovered: true,
    description: "Poznańska klasyka deskorolkowa. Sprzęt, traki, kółka, profesjonalny montaż gripa i doradztwo sprzętowe.",
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 115, skate: 160, shaka: 75, lightning: 35, trophy: 22 },
    reviews: [],
  },
  {
    id: "spot-torun-plaza",
    name: "Skatepark Toruń Martówka",
    category: "skatepark",
    lat: 53.0115,
    lng: 18.5910,
    city: "Toruń",
    address: "Park Miejski Martówka, Toruń",
    rating: 4.7,
    activeRidersCount: 18,
    hasLighting: true,
    description: "Betonowy plaza park w parku miejskim w Toruniu. Kątowniki, rurki, minirampy i płaskie murki.",
    image: "https://images.unsplash.com/photo-1516912821115-5a835ec9ee75?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 85, skate: 112, shaka: 50, lightning: 22, trophy: 14 },
    reviews: [],
  },
  {
    id: "spot-olsztyn-lyna",
    name: "Skatepark Park Podzamcze Olsztyn",
    category: "skatepark",
    lat: 53.7760,
    lng: 20.4740,
    city: "Olsztyn",
    address: "Park Podzamcze, Olsztyn",
    rating: 4.6,
    activeRidersCount: 14,
    description: "Zielony skatepark nad Łyną w Olsztynie. Dobre profile, zjazdy i spory flat do szlifowania trików.",
    image: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 65, skate: 92, shaka: 38, lightning: 18, trophy: 10 },
    reviews: [],
  },
  {
    id: "shop-lodz-piotrkowska",
    name: "Skate Pro Shop Łódź",
    category: "shop",
    lat: 51.7600,
    lng: 19.4570,
    city: "Łódź",
    address: "ul. Piotrkowska 120, Łódź",
    rating: 4.8,
    activeRidersCount: 5,
    isCovered: true,
    description: "Centrum sprzętowe na Piotrkowskiej. Złożysz tu idealną deskę i dostaniesz świeży wosk na uliczne murki.",
    image: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    reactions: { fire: 90, skate: 125, shaka: 55, lightning: 25, trophy: 16 },
    reviews: [],
  },
];
