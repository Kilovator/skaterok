import { CustomBuildDetails } from "@/data/products";

export type OrderItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: { src: string; alt: string };
  dominantColor?: string;
  buildDetails?: CustomBuildDetails;
};

export type Order = {
  id: string;
  userId: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingMethod: string;
  shippingDetails: {
    fullName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    paczkomatCode?: string;
    paczkomatId?: string;
    notes?: string;
  };
  paymentMethod: string;
  paymentInfo?: string;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled";
};

export type MonacoTab =
  | "dashboard"
  | "pos"
  | "products"
  | "categories"
  | "sales"
  | "purchases"
  | "giftcards"
  | "people"
  | "settings"
  | "reports";

export type CartItem = {
  product: {
    id: string;
    name: string;
    price: number;
    category?: string;
    image: { src: string; alt: string };
    dominantColor?: string;
  };
  quantity: number;
  discountPercent?: number;
};

export type StaffUser = {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role: string;
  posAccess?: boolean;
  posPin?: string | null;
  createdAt?: string;
  isMainAdmin?: boolean;
};
