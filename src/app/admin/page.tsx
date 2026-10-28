import { Metadata } from "next";
import { MonacoPOSContainer } from "@/components/MonacoPOS/MonacoPOSContainer";

export const metadata: Metadata = {
  title: "Monaco POS — Administrator Panel",
  description: "Monaco Point of Sale & Retail Management Panel",
};

export default function AdminPage() {
  return <MonacoPOSContainer />;
}
