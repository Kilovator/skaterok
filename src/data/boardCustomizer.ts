export type DeckItem = {
  uid: string;
  textureUrl: string;
};

export type WheelItem = {
  uid: string;
  textureUrl: string;
};

export type MetalItem = {
  uid: string;
  color: string;
};

export const decks: DeckItem[] = [
  { uid: "classic-black", textureUrl: "/skateboard/Deck.webp" },
  { uid: "skate-1",       textureUrl: "/skateboard/skate1.png" },
  { uid: "skate-2",       textureUrl: "/skateboard/skate2.png" },
  { uid: "skate-3",       textureUrl: "/skateboard/skate3.png" },
  { uid: "skate-4",       textureUrl: "/skateboard/skate4.png" },
  { uid: "skate-5",       textureUrl: "/skateboard/skate5.png" },
  { uid: "skate-6",       textureUrl: "/skateboard/skate6.png" },
  { uid: "skate-7",       textureUrl: "/skateboard/skate7.png" },
  { uid: "skate-8",       textureUrl: "/skateboard/skate8.png" },
  { uid: "skate-9",       textureUrl: "/skateboard/skate9.png" },
];

export const wheels: WheelItem[] = [
  { uid: "cream",   textureUrl: "/skateboard/SkateWheel1.png" },
  { uid: "wheel-1", textureUrl: "/skateboard/wheel1.png" },
  { uid: "wheel-2", textureUrl: "/skateboard/wheel2.png" },
  { uid: "wheel-3", textureUrl: "/skateboard/wheel3.png" },
  { uid: "wheel-4", textureUrl: "/skateboard/wheel4.png" },
  { uid: "wheel-5", textureUrl: "/skateboard/wheel5.png" },
  { uid: "wheel-6", textureUrl: "/skateboard/wheel6.png" },
];

export const metals: MetalItem[] = [
  { uid: "black", color: "#1a1a1a" },
  { uid: "silver", color: "#8a8a8a" },
  { uid: "steel-blue", color: "#4a6fa5" },
  { uid: "gold", color: "#c8a96e" },
  { uid: "white", color: "#f0f0f0" },
  { uid: "orange", color: "#ff6b35" },
  { uid: "sky-blue", color: "#4fc3f7" },
  { uid: "lime", color: "#a5d63f" },
  { uid: "yellow", color: "#ffd600" },
  { uid: "purple", color: "#7B72B5" },
  { uid: "hot-pink", color: "#e91e8c" },
  { uid: "crimson", color: "#d32f2f" },
];
