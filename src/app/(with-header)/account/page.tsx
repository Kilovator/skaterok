"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { Heading } from "@/components/Heading";
import { Bounded } from "@/components/Bounded";
import {
  FaUser,
  FaBookmark,
  FaReceipt,
  FaArrowRight,
  FaTrash,
  FaCartPlus,
  FaRightFromBracket,
  FaTruckFast,
  FaBox,
  FaCreditCard,
  FaMobileScreenButton,
  FaMoneyBill1,
  FaCheck,
  FaClock,
} from "react-icons/fa6";

export default function AccountPage() {
  const { user, isLoggedIn, savedBuilds, orders, logout, deleteBuild, openAuthModal } = useAuth();
  const { t } = useLanguage();
  const { addItem } = useCart();

  const [activeTab, setActiveTab] = useState<"builds" | "orders">("builds");
  const [addedBuildId, setAddedBuildId] = useState<string | null>(null);

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen pt-36 pb-20 bg-brand-black bg-texture text-white">
        <Bounded className="flex flex-col items-center justify-center text-center py-16">
          <div className="size-20 rounded-2xl bg-brand-amethyst/20 border border-brand-amethyst/40 flex items-center justify-center text-brand-amethyst mb-6 shadow-xl shadow-brand-amethyst/20">
            <FaUser size={36} />
          </div>
          <Heading as="h1" size="md" className="mb-4">
            {t("account.title")}
          </Heading>
          <p className="max-w-md font-mono text-sm text-white/60 mb-8">
            {t("account.noBuilds")}
          </p>
          <button
            onClick={() => openAuthModal("login")}
            className="button-cutout bg-gradient-to-b from-brand-amethyst to-brand-pale from-25% to-75% bg-[length:100%_400%] px-8 py-3.5 font-sans text-sm font-bold uppercase tracking-widest text-white transition-[background-position] duration-300 hover:bg-bottom hover:text-black cursor-pointer shadow-lg"
          >
            {t("auth.login")}
          </button>
        </Bounded>
      </div>
    );
  }

  function handleAddToCart(build: typeof savedBuilds[0]) {
    addItem({
      id: `saved-build-${build.id}`,
      name: build.name,
      price: build.price,
      image: {
        src: build.deck.textureUrl || "/skateboard/decks/Deck1.webp",
        alt: build.name,
      },
      dominantColor: "#7B72B5",
      customizerLink: `/build?deck=${build.deck.uid}&wheel=${build.wheels.uid}&truck=${build.truck.uid}&bolt=${build.bolt.uid}`,
    });

    setAddedBuildId(build.id);
    setTimeout(() => setAddedBuildId(null), 2500);
  }

  return (
    <div className="min-h-screen pt-36 pb-24 bg-brand-black bg-texture text-white">
      <Bounded>
        {/* Profile Card Header */}
        <div className="relative overflow-hidden rounded-3xl border border-brand-amethyst/30 bg-gradient-to-b from-white/10 to-white/5 p-6 md:p-8 backdrop-blur-xl mb-10 shadow-2xl">
          <div className="absolute right-0 top-0 -mr-16 -mt-16 size-64 rounded-full bg-brand-amethyst/10 blur-3xl" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="size-16 md:size-20 rounded-2xl bg-gradient-to-tr from-brand-amethyst to-purple-500 text-white flex items-center justify-center text-2xl md:text-3xl font-bold font-sans shadow-lg shadow-brand-amethyst/30 border border-white/20">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="font-sans text-2xl md:text-3xl font-bold uppercase tracking-wider text-white">
                  {user.name}
                </h1>
                <p className="font-mono text-sm text-brand-pale mt-0.5">
                  {user.email}
                </p>
                <p className="font-mono text-xs text-white/40 mt-1">
                  Member since {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-sans font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              <FaRightFromBracket size={14} />
              {t("auth.logout")}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/15 mb-8 gap-4 md:gap-8">
          <button
            onClick={() => setActiveTab("builds")}
            className={`pb-4 font-sans text-sm md:text-base font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === "builds"
                ? "border-brand-amethyst text-brand-amethyst"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            <FaBookmark size={16} />
            {t("account.savedBuilds")} ({savedBuilds.length})
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-4 font-sans text-sm md:text-base font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border-b-2 ${
              activeTab === "orders"
                ? "border-brand-amethyst text-brand-amethyst"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            <FaReceipt size={16} />
            {t("account.orderHistory")} ({orders.length})
          </button>
        </div>

        {/* Tab 1: Saved Custom Builds */}
        {activeTab === "builds" && (
          <div>
            {savedBuilds.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-white/15 rounded-2xl bg-white/[0.02]">
                <FaBookmark size={40} className="mx-auto text-white/20 mb-4" />
                <p className="font-mono text-sm text-white/50 mb-6">
                  {t("account.noBuilds")}
                </p>
                <Link
                  href="/build"
                  className="button-cutout inline-flex items-center gap-2 bg-gradient-to-b from-brand-lime to-lime-500 from-25% to-75% bg-[length:100%_400%] px-6 py-3 font-sans text-xs font-bold uppercase tracking-widest text-black transition-[background-position] duration-300 hover:bg-bottom"
                >
                  {t("hero.buttonText")}
                  <FaArrowRight size={12} />
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {savedBuilds.map((build) => (
                  <div
                    key={build.id}
                    className="relative overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-5 transition-all hover:border-brand-amethyst/50 hover:bg-white/[0.08] flex flex-col justify-between"
                  >
                    <div>
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h3 className="font-sans text-lg font-bold uppercase tracking-wide text-white">
                            {build.name}
                          </h3>
                          <p className="font-mono text-xs text-white/40">
                            Saved on {new Date(build.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="font-sans text-lg font-bold text-brand-amethyst">
                          ${(build.price / 100).toFixed(2)}
                        </span>
                      </div>

                      {/* Specs pills */}
                      <div className="flex flex-wrap gap-2 my-4">
                        <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-mono text-white/80 border border-white/10 flex items-center gap-1.5">
                          <span className="text-white/40">Deck:</span>{" "}
                          <span className="capitalize">{build.deck.uid.replace(/-/g, " ")}</span>
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-mono text-white/80 border border-white/10 flex items-center gap-1.5">
                          <span className="text-white/40">Wheels:</span>{" "}
                          <span className="capitalize">{build.wheels.uid.replace(/-/g, " ")}</span>
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-mono text-white/80 border border-white/10 flex items-center gap-1.5">
                          <span className="text-white/40">Truck:</span>
                          <span
                            className="size-3 rounded-full border border-white/30"
                            style={{ backgroundColor: build.truck.color }}
                          />
                        </span>
                        <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-mono text-white/80 border border-white/10 flex items-center gap-1.5">
                          <span className="text-white/40">Bolts:</span>
                          <span
                            className="size-3 rounded-full border border-white/30"
                            style={{ backgroundColor: build.bolt.color }}
                          />
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/10">
                      <Link
                        href={`/build?deck=${build.deck.uid}&wheel=${build.wheels.uid}&truck=${build.truck.uid}&bolt=${build.bolt.uid}`}
                        className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-sans text-xs font-bold uppercase tracking-wider text-center transition-all flex items-center justify-center gap-1.5"
                      >
                        {t("account.loadBuild")}
                      </Link>

                      <button
                        onClick={() => handleAddToCart(build)}
                        className="py-2 px-4 rounded-xl bg-brand-amethyst hover:bg-brand-pale text-white hover:text-black font-sans text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {addedBuildId === build.id ? (
                          <FaCheck size={12} className="text-emerald-300" />
                        ) : (
                          <FaCartPlus size={14} />
                        )}
                        <span className="hidden sm:inline">
                          {addedBuildId === build.id ? "Added!" : t("cart.button")}
                        </span>
                      </button>

                      <button
                        onClick={() => deleteBuild(build.id)}
                        className="p-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white/40 transition-all cursor-pointer"
                        title={t("account.deleteBuild")}
                      >
                        <FaTrash size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Order History */}
        {activeTab === "orders" && (
          <div>
            {orders.length === 0 ? (
              <div className="py-16 text-center border border-dashed border-white/15 rounded-2xl bg-white/[0.02]">
                <FaReceipt size={40} className="mx-auto text-white/20 mb-4" />
                <p className="font-mono text-sm text-white/50 mb-6">
                  {t("account.noOrders")}
                </p>
                <Link
                  href="/"
                  className="button-cutout inline-flex items-center gap-2 bg-gradient-to-b from-brand-amethyst to-brand-pale from-25% to-75% bg-[length:100%_400%] px-6 py-3 font-sans text-xs font-bold uppercase tracking-widest text-white transition-[background-position] duration-300 hover:bg-bottom hover:text-black"
                >
                  {t("tai1.buttonText")}
                  <FaArrowRight size={12} />
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="overflow-hidden rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-sm"
                  >
                    {/* Order header row */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-sans text-lg font-bold text-white">
                            {order.id}
                          </span>
                          <span
                            className={`px-3 py-0.5 rounded-full font-mono text-xs font-bold uppercase tracking-wide border ${
                              order.status === "Delivered"
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                                : order.status === "In Transit"
                                ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                                : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="font-mono text-xs text-white/40 mt-1 flex items-center gap-1.5">
                          <FaClock size={11} />
                          {new Date(order.date).toLocaleString()}
                        </p>
                      </div>

                      <div className="text-right">
                        <span className="font-mono text-xs text-white/40 uppercase tracking-wider block">
                          {t("account.total")}
                        </span>
                        <span className="font-sans text-xl font-bold text-brand-amethyst">
                          ${(order.total / 100).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="my-4 space-y-3">
                      {order.items.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between text-sm py-1 border-b border-white/5 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className="size-3 rounded-full shrink-0"
                              style={{ backgroundColor: item.dominantColor }}
                            />
                            <span className="font-sans font-bold text-white/90">
                              {item.name}
                            </span>
                            <span className="font-mono text-xs text-white/40">
                              x{item.quantity}
                            </span>
                          </div>
                          <span className="font-mono text-white/70">
                            ${((item.price * item.quantity) / 100).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Order Metadata badges (Shipping & Payment) */}
                    <div className="flex flex-wrap gap-4 pt-4 border-t border-white/10 text-xs font-mono text-white/60">
                      <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                        {order.shippingMethod === "paczkomat" ? (
                          <FaBox className="text-brand-amethyst size-3.5" />
                        ) : (
                          <FaTruckFast className="text-brand-amethyst size-3.5" />
                        )}
                        <span>
                          {order.shippingMethod === "paczkomat"
                            ? `Paczkomat: ${order.shippingDetails.paczkomatId}`
                            : `Courier: ${order.shippingDetails.address}, ${order.shippingDetails.city}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
                        {order.paymentMethod === "card" && <FaCreditCard className="text-brand-lime size-3.5" />}
                        {order.paymentMethod === "blik" && <FaMobileScreenButton className="text-brand-lime size-3.5" />}
                        {order.paymentMethod === "cash" && <FaMoneyBill1 className="text-brand-lime size-3.5" />}
                        <span className="uppercase">
                          Payment: {order.paymentMethod}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Bounded>
    </div>
  );
}
