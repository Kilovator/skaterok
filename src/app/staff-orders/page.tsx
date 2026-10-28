import { Metadata } from "next";
import { MonacoPOSContainer } from "@/components/MonacoPOS/MonacoPOSContainer";

export const metadata: Metadata = {
  title: "Monaco POS — Center Market Admin",
  description: "Point of Sale and retail operations management panel",
};

export default function StaffOrdersPage() {
  return <MonacoPOSContainer />;
}
