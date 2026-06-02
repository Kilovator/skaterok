export const siteSettings = {
  siteTitle: "SKET-OK",
  metaDescription: "Premium skateboarding for the streets. Built to shred, made to last.",
  navigation: [
    { labelKey: "nav.boards" as const, href: "#products" },
    { labelKey: "nav.team" as const, href: "#team" },
    { labelKey: "nav.about" as const, href: "#about" },
    { labelKey: "nav.build" as const, href: "/build" },
  ],
  // Add your footer skateboard texture paths here
  footerSkateboardTextures: [
    "/skateboard/Deck.webp",
  ],
};
