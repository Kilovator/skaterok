export const heroData = {
  heading: "Your board, your way",
  body: "Premium skateboards for the streets. Built to shred, made to last.",
  buttonText: "Build Your Board",
  buttonHref: "/build",
  deckTextureURL: "/skateboard/Deck.webp",
  wheelTextureURL: "/skateboard/SkateWheel1.png",
  truckColor: "#6F6E6A",
  boltColor: "#6F6E6A",
};

export const productGridData = {
  heading: "Our Boards",
  body: "Every board handpicked for quality, style, and street performance.",
};

export const teamGridData = {
  heading: "Meet the Team",
};

export type TextAndImageSection = {
  id: string;
  heading: string;
  body: string;
  buttonText: string;
  buttonHref: string;
  theme: "Blue" | "Orange" | "Navy" | "Lime";
  variation: "default" | "imageOnLeft";
  // Replace these src paths with your own images in /public/images/
  foregroundImage: { src: string; alt: string };
  backgroundImage: { src: string; alt: string };
};

export const textAndImageSections: TextAndImageSection[] = [
  {
    id: "tai-1",
    heading: "Designed for the streets",
    body: "Each board is crafted with precision and passion. From the first push to the last trick, SKET-OK boards are built to perform.",
    buttonText: "Explore Boards",
    buttonHref: "#products",
    theme: "Blue",
    variation: "default",
    foregroundImage: { src: "/images/sections/tai-1-fg.jpg", alt: "Skater in action" },
    backgroundImage: { src: "/images/sections/tai-1-bg.jpg", alt: "" },
  },
  {
    id: "tai-2",
    heading: "Built to last",
    body: "Premium materials, pro-grade construction. We use only the best maple and hardware so your board survives every session.",
    buttonText: "Customize Yours",
    buttonHref: "/build",
    theme: "Orange",
    variation: "imageOnLeft",
    foregroundImage: { src: "/images/sections/tai-2-fg.jpg", alt: "Skateboard deck" },
    backgroundImage: { src: "/images/sections/tai-2-bg.jpg", alt: "" },
  },
  {
    id: "tai-3",
    heading: "Ride with the team",
    body: "Join a community of riders who live and breathe skateboarding. SKET-OK team riders represent the spirit of the streets.",
    buttonText: "Meet the Team",
    buttonHref: "#team",
    theme: "Navy",
    variation: "default",
    foregroundImage: { src: "/images/sections/tai-3-fg.jpg", alt: "Skaters team" },
    backgroundImage: { src: "/images/sections/tai-3-bg.jpg", alt: "" },
  },
];

export const videoBlockData = {
  // Replace with your YouTube video ID (e.g. "dQw4w9WgXcQ")
  youtubeVideoId: "",
};
