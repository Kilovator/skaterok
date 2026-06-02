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
    customizerLink: "/build",
    dominantColor: "#7B72B5",
  },
  {
    id: "p2",
    name: "Street Phantom",
    price: 14999,
    image: { src: "/images/products/street-phantom.jpg", alt: "Street Phantom deck" },
    customizerLink: "/build",
    dominantColor: "#3D396E",
  },
  {
    id: "p3",
    name: "Amethyst Rush",
    price: 13499,
    image: { src: "/images/products/amethyst-rush.jpg", alt: "Amethyst Rush deck" },
    customizerLink: "/build",
    dominantColor: "#9B94C8",
  },
  {
    id: "p4",
    name: "Black Diamond",
    price: 15999,
    image: { src: "/images/products/black-diamond.jpg", alt: "Black Diamond deck" },
    customizerLink: "/build",
    dominantColor: "#0F1820",
  },
];
