import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { CartDrawer } from "@/components/CartDrawer";
import { CartProvider } from "@/context/CartContext";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <CartProvider>
      <Header />
      {children}
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
