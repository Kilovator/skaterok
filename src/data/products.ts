export type Product = {
  id: string;
  name: string;
  price: number; // in cents
  image: { src: string; alt: string };
  customizerLink: string;
  dominantColor: string;
};

export const products: Product[] = [
  {
    id: "p1",
    name: "Midnight Rider",
    price: 12999,
    image: { src: "/images/products/midnight-rider.jpg", alt: "Midnight Rider deck" },
    customizerLink: "/build?deck=skate-1&wheel=wheel-1&truck=purple&bolt=purple",
    dominantColor: "#7B72B5",
  },
  {
    id: "p2",
    name: "Street Phantom",
    price: 14999,
    image: { src: "/images/products/street-phantom.jpg", alt: "Street Phantom deck" },
    customizerLink: "/build?deck=skate-3&wheel=wheel-3&truck=black&bolt=black",
    dominantColor: "#3D396E",
  },
  {
    id: "p3",
    name: "Amethyst Rush",
    price: 13499,
    image: { src: "/images/products/amethyst-rush.jpg", alt: "Amethyst Rush deck" },
    customizerLink: "/build?deck=skate-5&wheel=wheel-5&truck=steel-blue&bolt=steel-blue",
    dominantColor: "#9B94C8",
  },
  {
    id: "p4",
    name: "Black Diamond",
    price: 15999,
    image: { src: "/images/products/black-diamond.jpg", alt: "Black Diamond deck" },
    customizerLink: "/build?deck=skate-7&wheel=wheel-7&truck=silver&bolt=silver",
    dominantColor: "#0F1820",
  },
];
