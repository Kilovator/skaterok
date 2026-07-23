"use client";

import { DeckItem, WheelItem, MetalItem } from "@/data/boardCustomizer";
import { CartItem } from "@/context/CartContext";

export type User = {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type SavedBuild = {
  id: string;
  userId: string;
  name: string;
  deck: DeckItem;
  wheels: WheelItem;
  truck: MetalItem;
  bolt: MetalItem;
  price: number;
  createdAt: string;
};

export type ShippingMethod = "courier" | "paczkomat" | "postal";
export type PaymentMethod = "card" | "blik" | "cash" | "applepay";

export type ShippingDetails = {
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postalCode?: string;
  paczkomatId?: string;
  notes?: string;
};

export type Order = {
  id: string;
  userId: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingMethod: ShippingMethod;
  shippingDetails: ShippingDetails;
  paymentMethod: PaymentMethod;
  paymentInfo?: string;
  status: "Processing" | "In Transit" | "Delivered";
};

type DBStructure = {
  users: User[];
  savedBuilds: SavedBuild[];
  orders: Order[];
};

const DB_KEY = "sket_ok_database_v1";

// Demo initial seed data
const SEED_DATA: DBStructure = {
  users: [
    {
      id: "usr_demo_1",
      name: "Alex Rider",
      email: "rider@sket-ok.com",
      passwordHash: "skate123", // Simple hash/plain for demo store
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    },
  ],
  savedBuilds: [
    {
      id: "sb_demo_1",
      userId: "usr_demo_1",
      name: "Cyber Amethyst Pro",
      deck: {
        uid: "cyberpunk",
        textureUrl: "/skateboard/decks/Deck1.webp",
      },
      wheels: {
        uid: "amethyst-glow",
        textureUrl: "/skateboard/wheels/Wheel1.webp",
      },
      truck: {
        uid: "titanium-silver",
        color: "#CCCCCC",
      },
      bolt: {
        uid: "gold-anodized",
        color: "#EAB308",
      },
      price: 8999,
      createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    },
  ],
  orders: [
    {
      id: "ORD-94821",
      userId: "usr_demo_1",
      date: new Date(Date.now() - 2 * 86400000).toISOString(),
      items: [
        {
          id: "board-cyber-custom",
          name: "Cyberpunk Custom Setup",
          price: 8999,
          quantity: 1,
          image: { src: "/skateboard/decks/Deck1.webp", alt: "Cyberpunk Board" },
          dominantColor: "#7B72B5",
          customizerLink: "/build",
        },
      ],
      subtotal: 8999,
      shippingFee: 1500,
      total: 10499,
      shippingMethod: "paczkomat",
      shippingDetails: {
        fullName: "Alex Rider",
        email: "rider@sket-ok.com",
        phone: "+48 600 111 222",
        city: "Warszawa",
        paczkomatId: "WAW01M (Marszałkowska 100)",
      },
      paymentMethod: "blik",
      paymentInfo: "BLIK code verified",
      status: "In Transit",
    },
  ],
};

function getDB(): DBStructure {
  if (typeof window === "undefined") return SEED_DATA;
  try {
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      localStorage.setItem(DB_KEY, JSON.stringify(SEED_DATA));
      return SEED_DATA;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to read DB from localStorage", e);
    return SEED_DATA;
  }
}

function saveDB(db: DBStructure): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.error("Failed to save DB to localStorage", e);
  }
}

// User Auth Database API
export const db = {
  // Users
  getUserByEmail(email: string): User | undefined {
    const data = getDB();
    return data.users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase().trim()
    );
  },

  createUser(name: string, email: string, passwordHash: string): User {
    const data = getDB();
    const newUser: User = {
      id: "usr_" + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      createdAt: new Date().toISOString(),
    };
    data.users.push(newUser);
    saveDB(data);
    return newUser;
  },

  verifyUser(email: string, passwordHash: string): User | null {
    const user = this.getUserByEmail(email);
    if (user && user.passwordHash === passwordHash) {
      return user;
    }
    return null;
  },

  // Saved Custom Builds
  getSavedBuilds(userId: string): SavedBuild[] {
    const data = getDB();
    return data.savedBuilds.filter((b) => b.userId === userId);
  },

  addSavedBuild(
    userId: string,
    build: {
      name?: string;
      deck: DeckItem;
      wheels: WheelItem;
      truck: MetalItem;
      bolt: MetalItem;
      price?: number;
    }
  ): SavedBuild {
    const data = getDB();
    const newBuild: SavedBuild = {
      id: "build_" + Math.random().toString(36).substring(2, 9),
      userId,
      name: build.name || `Custom Build #${data.savedBuilds.length + 1}`,
      deck: build.deck,
      wheels: build.wheels,
      truck: build.truck,
      bolt: build.bolt,
      price: build.price || 7999,
      createdAt: new Date().toISOString(),
    };
    data.savedBuilds.unshift(newBuild);
    saveDB(data);
    return newBuild;
  },

  deleteSavedBuild(userId: string, buildId: string): void {
    const data = getDB();
    data.savedBuilds = data.savedBuilds.filter(
      (b) => !(b.id === buildId && b.userId === userId)
    );
    saveDB(data);
  },

  // Orders
  getUserOrders(userId: string): Order[] {
    const data = getDB();
    return data.orders
      .filter((o) => o.userId === userId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  },

  createOrder(
    userId: string,
    order: Omit<Order, "id" | "userId" | "date" | "status">
  ): Order {
    const data = getDB();
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const newOrder: Order = {
      ...order,
      id: `ORD-${randomNum}`,
      userId,
      date: new Date().toISOString(),
      status: "Processing",
    };
    data.orders.unshift(newOrder);
    saveDB(data);
    return newOrder;
  },
};
