export type CategoryId = "eskate" | "hoverboard" | "euc";

export type CategoryBlock = {
  id: CategoryId;
  name: string;
  subtitle: string;
  priceTag: string;
  rating: number;
  image: { src: string; alt: string };
  dominantColor: string;
};

export type Product = {
  id: string;
  name: string;
  category?: CategoryId;
  price: number; // in cents or main currency
  rating?: number;
  reviewsCount?: number;
  specs?: {
    speed?: string;
    range?: string;
    power?: string;
    weight?: string;
  };
  description?: string;
  image: { src: string; alt: string };
  images?: string[]; // Array of gallery photos for swiping
  customizerLink?: string;
  dominantColor?: string;
};

// 3 Main Electric Categories displayed on home page
export const electricCategories: CategoryBlock[] = [
  {
    id: "eskate",
    name: "Deskorolki Elektryczne",
    subtitle: "Napęd pasowy i hub-motors. Prawdziwe czucie deski z silnikiem",
    priceTag: "$349.99",
    rating: 4.9,
    image: {
      src: "/images/boosted-stealth/2.png",
      alt: "Deskorolki Elektryczne",
    },
    dominantColor: "#3D396E",
  },
  {
    id: "hoverboard",
    name: "Hoverboardy & Segway",
    subtitle: "Samo-balansujące hoverboardy z głośnikami Bluetooth i podświetleniem LED",
    priceTag: "$249.99",
    rating: 4.8,
    image: {
      src: "/images/ninebot-minipro2/1.png",
      alt: "Hoverboardy & Segway",
    },
    dominantColor: "#9B94C8",
  },
  {
    id: "euc",
    name: "Monocykle Elektryczne",
    subtitle: "Monocykle terenowe z pneumatycznym zawieszeniem (Моноколеса)",
    priceTag: "$499.99",
    rating: 5.0,
    image: {
      src: "/images/inmotion-v12ht/1.png",
      alt: "Monocykle Elektryczne",
    },
    dominantColor: "#0F1820",
  },
];

// Full catalog of products (3 categories)
export const electricProducts: Product[] = [
  // --- 1. DESKOROLKI ELEKTRYCZNE (6 products) ---
  {
    id: "eskate-1",
    name: "Boosted Stealth Board 2000W",
    category: "eskate",
    price: 34999,
    rating: 4.9,
    reviewsCount: 185,
    specs: { speed: "40 km/h", range: "24 km", power: "2000W Belt", weight: "7.7 kg" },
    description: "Legenda e-skate z bambusowym deckiem SuperFlex i silnikami pasowymi zapewniającymi potężny moment obrotowy.",
    image: { src: "/images/boosted-stealth/2.png", alt: "Boosted Stealth Board 2000W" },
    images: [
      "/images/boosted-stealth/1.png",
      "/images/boosted-stealth/2.png",
      "/images/boosted-stealth/3.png",
      "/images/boosted-stealth/4.png",
      "/images/boosted-stealth/5.jpg",
    ],
    dominantColor: "#3D396E",
  },
  {
    id: "eskate-2",
    name: "Evolve GTR Series 2 Bamboo All Terrain",
    category: "eskate",
    price: 59999,
    rating: 5.0,
    reviewsCount: 76,
    specs: { speed: "42 km/h", range: "50 km", power: "3000W Dual", weight: "11.3 kg" },
    description: "Terenowe pneumatyczne koła 7 cali, unikalny pilot Phantasm z wyświetlaczem OLED i 4 trybami prędkości.",
    image: { src: "/images/evolve-gtr/2.png", alt: "Evolve GTR Series 2 Bamboo All Terrain" },
    images: [
      "/images/evolve-gtr/1.png",
      "/images/evolve-gtr/2.png",
      "/images/evolve-gtr/3.png",
      "/images/evolve-gtr/4.png",
      "/images/evolve-gtr/5.png",
    ],
    dominantColor: "#9B94C8",
  },
  {
    id: "eskate-3",
    name: "Daibot 2 w 1 Terenowa i Szosowa 1800W 8000mAh",
    category: "eskate",
    price: 27999,
    rating: 4.9,
    reviewsCount: 142,
    specs: { speed: "45 km/h", range: "35 km", power: "1800W Dual", weight: "9.2 kg" },
    description: "Uniwersalna deskorolka elektryczna 2 w 1 z wymiennymi kołami szosowymi i terenowymi, podwójnym silnikiem 1800W oraz akumulatorem 8000mAh.",
    image: { src: "/images/daibot-2in1/1.png", alt: "Daibot 2 w 1 Terenowa i Szosowa 1800W" },
    images: [
      "/images/daibot-2in1/1.png",
      "/images/daibot-2in1/2.png",
      "/images/daibot-2in1/3.png",
      "/images/daibot-2in1/4.png",
      "/images/daibot-2in1/5.png",
    ],
    dominantColor: "#0F1820",
  },
  {
    id: "eskate-4",
    name: "WowGo AT2 Plus Electric Skateboard & Longboard",
    category: "eskate",
    price: 89900,
    rating: 4.9,
    reviewsCount: 168,
    specs: { speed: "50 km/h", range: "45 km", power: "12S4P 604Wh 14Ah", weight: "12.0 kg" },
    description: "Mocna deskorolka terenowa AT2 Plus z purpurowym obramowaniem, akumulatorem 12S4P 604Wh 14Ah, pneumatycznymi kołami 175mm oraz opcjonalnymi kołami szosowymi 120mm.",
    image: { src: "/images/wowgo-at2plus/1.png", alt: "WowGo AT2 Plus Electric Skateboard" },
    images: [
      "/images/wowgo-at2plus/1.png",
      "/images/wowgo-at2plus/2.png",
      "/images/wowgo-at2plus/3.png",
      "/images/wowgo-at2plus/4.png",
      "/images/wowgo-at2plus/5.png",
    ],
    dominantColor: "#7B72B5",
  },
  {
    id: "eskate-5",
    name: "WowGo Mini 2S Electric Skateboard",
    category: "eskate",
    price: 79900,
    rating: 4.9,
    reviewsCount: 135,
    specs: { speed: "45 km/h", range: "30 km", power: "260Wh Samsung 30Q", weight: "6.9 kg" },
    description: "Kompaktowy zwrotny shortboard elektryczny z kicktailem, ogniwami Samsung 30Q 12S2P 260Wh, prędkością do 45 km/h i silnikami pasowymi.",
    image: { src: "/images/wowgo-mini2s/1.png", alt: "WowGo Mini 2S Electric Skateboard" },
    images: [
      "/images/wowgo-mini2s/1.png",
      "/images/wowgo-mini2s/2.png",
      "/images/wowgo-mini2s/3.png",
      "/images/wowgo-mini2s/4.png",
      "/images/wowgo-mini2s/5.png",
    ],
    dominantColor: "#0F1820",
  },
  {
    id: "eskate-6",
    name: "Deskorolka Elektryczna WowGo 2S MAX | Hub 216Wh",
    category: "eskate",
    price: 19999,
    rating: 4.8,
    reviewsCount: 114,
    specs: { speed: "40 km/h", range: "23 km", power: "2x550W Hub", weight: "6.8 kg" },
    description: "Kompaktowy zwrotny cruiser elektryczny z cichym napędem Hub 2x550W, akumulatorem 216Wh i pilotem bezprzewodowym z ekranem LCD.",
    image: { src: "/images/wowgo-2smax/1.png", alt: "Deskorolka Elektryczna WowGo 2S MAX" },
    images: [
      "/images/wowgo-2smax/1.png",
      "/images/wowgo-2smax/2.png",
      "/images/wowgo-2smax/3.png",
      "/images/wowgo-2smax/4.png",
      "/images/wowgo-2smax/5.jpg",
    ],
    dominantColor: "#3D396E",
  },

  // --- 2. HOVERBOARDY & SEGWAY (5 products) ---
  {
    id: "hoverboard-1",
    name: "Ninebot by Segway MiniPro 2 Smart Gyro",
    category: "hoverboard",
    price: 24999,
    rating: 4.9,
    reviewsCount: 210,
    specs: { speed: "18 km/h", range: "30 km", power: "800W Dual", weight: "12.8 kg" },
    description: "Samo-balansujący Segway z drążkiem kolanowym, podświetleniem LED RGB, głośnikami Bluetooth i oponami terenowymi.",
    image: { src: "/images/ninebot-minipro2/1.png", alt: "Ninebot by Segway MiniPro 2" },
    images: [
      "/images/ninebot-minipro2/1.png",
      "/images/ninebot-minipro2/2.png",
      "/images/ninebot-minipro2/3.png",
      "/images/ninebot-minipro2/4.png",
    ],
    dominantColor: "#9B94C8",
  },
  {
    id: "hoverboard-2",
    name: "Hover-1™ Titan Off-Road Bluetooth Hoverboard",
    category: "hoverboard",
    price: 17999,
    rating: 4.8,
    reviewsCount: 135,
    specs: { speed: "12 km/h", range: "13.5 km", power: "500W Dual (250Wx2)", weight: "10 kg" },
    description: "Terenowy hoverboard z szerokimi 10-calowymi kołami, błyszczącym obudowaniem w kolorze Chrome Blue, wbudowanym głośnikiem Bluetooth i podświetleniem LED.",
    image: { src: "/images/hover1-titan/1.png", alt: "Hover-1 Titan Off-Road" },
    images: [
      "/images/hover1-titan/1.png",
      "/images/hover1-titan/2.png",
      "/images/hover1-titan/3.png",
      "/images/hover1-titan/4.png",
    ],
    dominantColor: "#0F1820",
  },
  {
    id: "hoverboard-3",
    name: "Razor Hovertrax 2.0 Auto-Balancing - Neon Green",
    category: "hoverboard",
    price: 14999,
    rating: 4.7,
    reviewsCount: 89,
    specs: { speed: "10 km/h", range: "60 min (~15 km)", power: "350W Dual", weight: "10 kg" },
    description: "Samo-balansująca deskorolka elektryczna Razor Hovertrax 2.0 w jaskrawym zielonym kolorze. Technologia EverBalance, gumowe koła 8 cali, podświetlenie LED oraz 60 minut ciągłej jazdy.",
    image: { src: "/images/razor-hovertrax/1.png", alt: "Razor Hovertrax 2.0 Neon Green" },
    images: [
      "/images/razor-hovertrax/1.png",
      "/images/razor-hovertrax/2.png",
      "/images/razor-hovertrax/3.jpg",
      "/images/razor-hovertrax/4.jpg",
      "/images/razor-hovertrax/5.jpg",
    ],
    dominantColor: "#7B72B5",
  },
  {
    id: "hoverboard-4",
    name: "Colorway All-Terrain Gyro Monster",
    category: "hoverboard",
    price: 19999,
    rating: 4.8,
    reviewsCount: 74,
    specs: { speed: "18 km/h", range: "22 km", power: "700W Dual", weight: "13.8 kg" },
    description: "Aluminiowe felgi z terenowym bieżnikiem. Radzi sobie z piaskiem, trawą i nierównościami kostki brukowej.",
    image: { src: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&w=800&q=80", alt: "Colorway All-Terrain Gyro" },
    images: [
      "https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1516912821115-5a835ec9ee75?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=800&q=80",
    ],
    dominantColor: "#3D396E",
  },
  {
    id: "hoverboard-5",
    name: "Swagtron T580 App-Enabled Hoverboard",
    category: "hoverboard",
    price: 18999,
    rating: 4.8,
    reviewsCount: 104,
    specs: { speed: "15 km/h", range: "16 km", power: "400W Dual", weight: "9.5 kg" },
    description: "Lekki model sterowany z poziomu aplikacji ze wskaźnikiem naładowania akumulatora i 3 trybami nauki.",
    image: { src: "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=800&q=80", alt: "Swagtron T580" },
    images: [
      "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1516912821115-5a835ec9ee75?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1598550476439-6847785fcea6?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=800&q=80",
    ],
    dominantColor: "#9B94C8",
  },

  // --- 3. MONOCYKLE ELEKTRYCZNE / МОНОКОЛЕСА (5 products) ---
  {
    id: "euc-1",
    name: "InMotion V12 HT High-Torque EUC 2800W",
    category: "euc",
    price: 69999,
    rating: 5.0,
    reviewsCount: 128,
    specs: { speed: "60 km/h (limit 20 km/h)", range: "do 150 km", power: "2800W Nominal", weight: "29 kg (Max 120kg)" },
    description: "Terenowy monocykl elektryczny z silnikiem 2800W, zasięgiem do 150 km, pneumatycznym 16-calowym kołem, aluminiową ramą, ekranem dotykowym LCD, głośnikami stereo Bluetooth i oświetleniem LED RGB.",
    image: { src: "/images/inmotion-v12ht/1.png", alt: "InMotion V12 HT High-Torque EUC" },
    images: [
      "/images/inmotion-v12ht/1.png",
      "/images/inmotion-v12ht/2.png",
      "/images/inmotion-v12ht/3.png",
      "/images/inmotion-v12ht/4.png",
      "/images/inmotion-v12ht/5.png",
    ],
    dominantColor: "#0F1820",
  },
  {
    id: "euc-2",
    name: "Begode Falcon Pro High-Voltage 3000W",
    category: "euc",
    price: 89999,
    rating: 5.0,
    reviewsCount: 94,
    specs: { speed: "105 km/h (65 mph)", range: "do 80 km (50 mi)", power: "3000W (Bateria 1800Wh)", weight: "30 kg (Dual-Damping 80mm)" },
    description: "Ekstremalny monocykl elektryczny Begode Falcon Pro z podwójnym zawieszeniem Dual-Damping 80mm, silnikiem 3000W, baterią 1800Wh, prędkością maksymalną 105 km/h oraz agresywną oponą off-road.",
    image: { src: "/images/begode-falcon/1.png", alt: "Begode Falcon Pro High-Voltage" },
    images: [
      "/images/begode-falcon/1.png",
      "/images/begode-falcon/2.png",
      "/images/begode-falcon/3.png",
      "/images/begode-falcon/4.png",
      "/images/begode-falcon/5.jpg",
    ],
    dominantColor: "#7B72B5",
  },
  {
    id: "euc-3",
    name: "KingSong S18 Pro+ Suspension EUC 5000W",
    category: "euc",
    price: 64999,
    rating: 4.9,
    reviewsCount: 110,
    specs: { speed: "49.9 km/h", range: "99.8 km", power: "5000W Peak", weight: "25 kg (Bateria 13.2Ah 50S Samsung)" },
    description: "Futurystyczny monocykl elektryczny z pneumatycznym zawieszeniem DNM Air Shock, silnikiem o mocy szczytowej 5000W, ogniwami 50S Samsung 13.2Ah, prędkością 49.9 km/h i zasięgiem do 99.8 km.",
    image: { src: "/images/kingsong-s18pro/1.png", alt: "KingSong S18 Pro+ Suspension" },
    images: [
      "/images/kingsong-s18pro/1.png",
      "/images/kingsong-s18pro/2.png",
      "/images/kingsong-s18pro/3.png",
      "/images/kingsong-s18pro/4.png",
      "/images/kingsong-s18pro/5.png",
    ],
    dominantColor: "#3D396E",
  },
  {
    id: "euc-4",
    name: "InMotion V11 Off-Road Air-Suspension",
    category: "euc",
    price: 64999,
    rating: 4.9,
    reviewsCount: 87,
    specs: { speed: "55 km/h", range: "120 km", power: "2200W", weight: "27 kg" },
    description: "Podwójne niezależne poduszki powietrzne zawieszenia, reflector lekki 7800 lux oraz składana rączka do prowadzenia.",
    image: { src: "https://images.unsplash.com/photo-1597082613746-d154279a29ed?auto=format&fit=crop&w=800&q=80", alt: "InMotion V11 Off-Road" },
    images: [
      "https://images.unsplash.com/photo-1597082613746-d154279a29ed?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=800&q=80",
    ],
    dominantColor: "#9B94C8",
  },
  {
    id: "euc-5",
    name: "GotWay Nikola Plus 100V Edition",
    category: "euc",
    price: 54999,
    rating: 4.8,
    reviewsCount: 79,
    specs: { speed: "65 km/h", range: "110 km", power: "2000W", weight: "24 kg" },
    description: "Pierścień diodowy LED RGB wokół korpusu, bateria 1800Wh o wysokim prądzie rozładowania i koło 16-calowe.",
    image: { src: "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=800&q=80", alt: "GotWay Nikola Plus" },
    images: [
      "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1517649763962-0c623266010b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1597082613746-d154279a29ed?auto=format&fit=crop&w=800&q=80",
    ],
    dominantColor: "#0F1820",
  },
];

// Fallback products export for backwards compatibility
export const products = electricProducts.slice(0, 3);
