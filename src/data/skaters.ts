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
    customizerLink: "/build?deck=skate-4&wheel=cream&truck=black&bolt=black",
  },
  {
    id: "2",
    firstName: "Dylan",

    photoBackground: { src: "/images/skaters/dylan-back.png", alt: "" },
    photoForeground: { src: "/images/skaters/dylan-front.png", alt: "Dylan" },
    customizerLink: "/build?deck=skate-3&wheel=cream&truck=yellow&bolt=lime",
  },
  {
    id: "3",
    firstName: "Jordan",

    photoBackground: { src: "/images/skaters/jordan-back.png", alt: "" },
    photoForeground: { src: "/images/skaters/jordan-front.png", alt: "Jordan" },
    customizerLink: "/build?deck=skate-11&wheel=wheel-4&truck=hot-pink&bolt=steel-blue",
  },
  {
    id: "4",
    firstName: "Sophie",
    foregroundScale: 1.35,
    photoBackground: { src: "/images/skaters/sophie-back.png", alt: "" },
    photoForeground: { src: "/images/skaters/sophie-front.png", alt: "Sophie" },
    customizerLink: "/build?deck=skate-10&wheel=wheel-1&truck=silver&bolt=silver",
  },
];
