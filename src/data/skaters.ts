export type Skater = {
  id: string;
  firstName: string;
  lastName?: string;
  photoBackground: { src: string; alt: string };
  photoForeground: { src: string; alt: string };
  foregroundScale?: number;
  customizerLink: string;
};

export const skaters: Skater[] = [
  {
    id: "1",
    firstName: "Carter",
    foregroundScale: 0.82,
    photoBackground: { src: "/images/skaters/carter-back.png", alt: "" },
    photoForeground: { src: "/images/skaters/carter-front.png", alt: "Carter" },
    customizerLink: "/build",
  },
  {
    id: "2",
    firstName: "Dylan",

    photoBackground: { src: "/images/skaters/dylan-back.png", alt: "" },
    photoForeground: { src: "/images/skaters/dylan-front.png", alt: "Dylan" },
    customizerLink: "/build",
  },
  {
    id: "3",
    firstName: "Jordan",

    photoBackground: { src: "/images/skaters/jordan-back.png", alt: "" },
    photoForeground: { src: "/images/skaters/jordan-front.png", alt: "Jordan" },
    customizerLink: "/build",
  },
  {
    id: "4",
    firstName: "Sophie",
    foregroundScale: 1.35,
    photoBackground: { src: "/images/skaters/sophie-back.png", alt: "" },
    photoForeground: { src: "/images/skaters/sophie-front.png", alt: "Sophie" },
    customizerLink: "/build",
  },
];
