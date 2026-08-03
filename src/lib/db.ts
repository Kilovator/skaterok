"use client";

import { DeckItem, WheelItem, MetalItem } from "@/data/boardCustomizer";
import { CartItem } from "@/context/CartContext";

export type NicknameHistoryItem = {
  nickname: string;
  changedAt: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  passwordHash: string;
  createdAt: string;
  lastNicknameChangeDate?: string;
  nicknameHistory?: NicknameHistoryItem[];
};

export type SavedBuild = {
  id: string;
  userId: string;
  name: string;
  deck: DeckItem;
  wheels: WheelItem;
  truck: MetalItem;
  bolt: MetalItem;
  price: number;
  createdAt: string;
};

export type ShippingMethod = "courier" | "paczkomat";
export type PaymentMethod = "card" | "blik" | "cash" | "applepay";

export type ShippingDetails = {
  fullName: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  postalCode?: string;
  paczkomatId?: string;
  notes?: string;
};

export type Order = {
  id: string;
  userId: string;
  date: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  shippingMethod: ShippingMethod;
  shippingDetails: ShippingDetails;
  paymentMethod: PaymentMethod;
  paymentInfo?: string;
  status: "Processing" | "In Transit" | "Delivered";
};
