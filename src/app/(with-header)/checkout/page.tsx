"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { ShippingMethod, PaymentMethod, Order } from "@/lib/db";
import { Heading } from "@/components/Heading";
import { Bounded } from "@/components/Bounded";
import {
  FaTruckFast,
  FaBox,
  FaCreditCard,
  FaMobileScreenButton,
  FaMoneyBill1,
  FaApple,
  FaLock,
  FaArrowLeft,
  FaCircleCheck,
  FaLocationDot,
  FaCheck,
} from "react-icons/fa6";

const PACZKOMATY = [
  { id: "WAW01M", city: "Warszawa", address: "ul. Marszałkowska 100", info: "24/7 • przy Metro Centrum" },
  { id: "WAW44A", city: "Warszawa", address: "ul. Aleje Jerozolimskie 54", info: "24/7 • Złote Tarasy" },
  { id: "KRA02A", city: "Kraków", address: "ul. Floriańska 12", info: "24/7 • Rynek Główny" },
  { id: "WRO09B", city: "Wrocław", address: "ul. Świdnicka 8", info: "24/7 • Galeria Dominikańska" },
  { id: "GDA15C", city: "Gdańsk", address: "ul. Długa 42", info: "24/7 • Stare Miasto" },
  { id: "POZ03M", city: "Poznań", address: "ul. Półwiejska 18", info: "24/7 • Stary Browar" },
  { id: "KAT08A", city: "Katowice", address: "ul. Stawowa 5", info: "24/7 • Dworzec PKP" },
  { id: "LOD12B", city: "Łódź", address: "ul. Piotrkowska 104", info: "24/7 • Off Piotrkowska" },
];

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart();
  const { user, placeOrder } = useAuth();
  const { t } = useLanguage();

  // Form State
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("courier");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("card");

  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [paczkomatId, setPaczkomatId] = useState("WAW01M (Marszałkowska 100, Warszawa)");
  const [selectedPaczkomatCode, setSelectedPaczkomatCode] = useState("WAW01M");
  const [paczkomatSearch, setPaczkomatSearch] = useState("");

  // Payment details
  const [cardNumber, setCardNumber] = useState("");
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [blikCode, setBlikCode] = useState("");

  // Result state
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-populate user email and name if logged in
  useEffect(() => {
    if (user) {
      if (user.email) setEmail(user.email);
      if (user.name) setFullName(user.name);
    }
  }, [user]);

  // If paczkomat is selected, switch away from Cash payment if currently selected
  useEffect(() => {
    if (shippingMethod === "paczkomat" && paymentMethod === "cash") {
      setPaymentMethod("card");
    }
  }, [shippingMethod, paymentMethod]);

  const shippingFee = shippingMethod === "paczkomat" ? 1000 : 1500; // $10 or $15
  const finalTotal = totalPrice + (items.length > 0 ? shippingFee : 0);

  const filteredPaczkomaty = PACZKOMATY.filter(
    (p) =>
      p.city.toLowerCase().includes(paczkomatSearch.toLowerCase()) ||
      p.address.toLowerCase().includes(paczkomatSearch.toLowerCase()) ||
      p.id.toLowerCase().includes(paczkomatSearch.toLowerCase())
  );

  function handleSelectPaczkomat(p: typeof PACZKOMATY[0]) {
    setSelectedPaczkomatCode(p.id);
    setPaczkomatId(`${p.id} (${p.address}, ${p.city})`);
  }

  async function handleSubmitOrder(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);

    const order = await placeOrder({
      items,
      subtotal: totalPrice,
      shippingFee,
      total: finalTotal,
      shippingMethod,
      shippingDetails: {
        fullName,
        email,
        phone,
        address: shippingMethod !== "paczkomat" ? address : undefined,
        city: shippingMethod !== "paczkomat" ? city : undefined,
        postalCode: shippingMethod !== "paczkomat" ? postalCode : undefined,
        paczkomatId: shippingMethod === "paczkomat" ? paczkomatId : undefined,
      },
      paymentMethod,
      paymentInfo:
        paymentMethod === "blik"
          ? `BLIK (${blikCode || "654321"})`
          : paymentMethod === "card"
          ? "Credit Card Verified"
          : paymentMethod === "cash"
          ? "Cash on delivery"
          : "Apple/Google Pay",
    });

    // Clear cart
    clearCart();

    setPlacedOrder(order);
    setIsSubmitting(false);
  }

  // Order confirmation modal view
  if (placedOrder) {
    return (
      <div className="min-h-screen pt-36 pb-24 bg-brand-black bg-texture text-white flex items-center justify-center">
        <Bounded className="w-full max-w-xl text-center">
          <div className="overflow-hidden rounded-3xl border border-emerald-500/40 bg-white/5 p-8 md:p-10 backdrop-blur-xl shadow-2xl shadow-emerald-500/10">
            
            <div className="mx-auto size-20 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6 border border-emerald-500/40 shadow-lg shadow-emerald-500/20">
              <FaCircleCheck size={44} />
            </div>

            <h1 className="font-sans text-2xl md:text-3xl font-bold uppercase tracking-wider text-white mb-2">
              {t("checkout.successTitle")}
            </h1>

            <p className="font-mono text-sm text-white/60 mb-6">
              {t("checkout.successMsg")}
            </p>

            <div className="my-6 p-4 rounded-xl bg-white/5 border border-white/10 text-center font-mono">
              <span className="text-xs text-white/40 block uppercase tracking-widest mb-1">
                Order ID
              </span>
              <span className="text-2xl font-sans font-bold text-brand-amethyst">
                {placedOrder.id}
              </span>
            </div>

            <div className="text-left font-mono text-xs text-white/70 space-y-2 mb-8 p-4 rounded-xl bg-black/30 border border-white/5">
              <div className="flex justify-between">
                <span className="text-white/40">Recipient:</span>
                <span>{placedOrder.shippingDetails.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Delivery Method:</span>
                <span className="capitalize">{placedOrder.shippingMethod}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/40">Total Paid:</span>
                <span className="font-bold text-brand-lime">
                  ${(placedOrder.total / 100).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/account"
                className="flex-1 py-3 px-6 rounded-xl bg-brand-amethyst hover:bg-brand-pale text-white hover:text-black font-sans text-xs font-bold uppercase tracking-widest transition-all text-center"
              >
                {t("account.orderHistory")}
              </Link>
              <Link
                href="/"
                className="flex-1 py-3 px-6 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 text-white font-sans text-xs font-bold uppercase tracking-widest transition-all text-center"
              >
                {t("checkout.backHome")}
              </Link>
            </div>

          </div>
        </Bounded>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen pt-36 pb-24 bg-brand-black bg-texture text-white flex items-center justify-center">
        <Bounded className="text-center">
          <Heading as="h1" size="md" className="mb-4">
            {t("cart.empty")}
          </Heading>
          <p className="font-mono text-sm text-white/50 mb-8">
            Your shopping cart is empty. Add products or custom boards to proceed.
          </p>
          <Link
            href="/"
            className="button-cutout inline-flex items-center gap-2 bg-gradient-to-b from-brand-amethyst to-brand-pale from-25% to-75% bg-[length:100%_400%] px-8 py-3.5 font-sans text-xs font-bold uppercase tracking-widest text-white transition-[background-position] duration-300 hover:bg-bottom hover:text-black"
          >
            <FaArrowLeft size={14} />
            {t("tai1.buttonText")}
          </Link>
        </Bounded>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-36 pb-24 bg-brand-black bg-texture text-white">
      <Bounded>
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 font-mono text-xs text-white/50 hover:text-white transition-colors mb-2"
          >
            <FaArrowLeft size={12} /> Back to shop
          </Link>
          <Heading as="h1" size="md">
            {t("checkout.title")}
          </Heading>
        </div>

        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Left Column: Shipping & Payment */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* 1. Shipping Method */}
            <div className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl">
              <h2 className="font-display text-xl font-bold uppercase tracking-wider text-white mb-5 flex items-center gap-3">
                <span className="size-7 rounded-full bg-brand-amethyst text-white text-xs font-mono flex items-center justify-center">
                  1
                </span>
                {t("checkout.shippingTitle")}
              </h2>

              {/* Shipping Radio Tabs — 2 Methods: Courier & Paczkomat */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                <button
                  type="button"
                  onClick={() => setShippingMethod("courier")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    shippingMethod === "courier"
                      ? "border-brand-amethyst bg-brand-amethyst/20 text-white shadow-lg shadow-brand-amethyst/10"
                      : "border-white/10 bg-white/5 text-white/60 hover:border-white/30"
                  }`}
                >
                  <FaTruckFast size={22} className="mb-2 text-brand-amethyst" />
                  <p className="font-sans text-xs font-bold uppercase tracking-wider text-white">
                    Courier / Kurier
                  </p>
                  <p className="font-mono text-[11px] text-white/50 mt-1">
                    $15.00 • 24h dostawa
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setShippingMethod("paczkomat")}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    shippingMethod === "paczkomat"
                      ? "border-brand-amethyst bg-brand-amethyst/20 text-white shadow-lg shadow-brand-amethyst/10"
                      : "border-white/10 bg-white/5 text-white/60 hover:border-white/30"
                  }`}
                >
                  <FaBox size={22} className="mb-2 text-brand-amethyst" />
                  <p className="font-sans text-xs font-bold uppercase tracking-wider text-white">
                    Paczkomat InPost
                  </p>
                  <p className="font-mono text-[11px] text-white/50 mt-1">
                    $10.00 • Odbiór w punkcie
                  </p>
                </button>
              </div>

              {/* Shipping Input Fields */}
              <div className="space-y-4 font-mono text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-sans font-bold uppercase tracking-wider text-white/70 mb-1">
                      {t("checkout.fullName")}
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Alex Rider"
                      className="w-full bg-white/5 border border-white/15 rounded-xl py-2.5 px-3.5 text-white placeholder-white/20 focus:outline-none focus:border-brand-amethyst"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-sans font-bold uppercase tracking-wider text-white/70 mb-1">
                      {t("checkout.phone")}
                    </label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+48 600 000 000"
                      className="w-full bg-white/5 border border-white/15 rounded-xl py-2.5 px-3.5 text-white placeholder-white/20 focus:outline-none focus:border-brand-amethyst"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-white/70 mb-1">
                    {t("auth.email")}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rider@sket-ok.com"
                    className="w-full bg-white/5 border border-white/15 rounded-xl py-2.5 px-3.5 text-white placeholder-white/20 focus:outline-none focus:border-brand-amethyst"
                  />
                </div>

                {/* PACZKOMAT MAP & SELECTOR */}
                {shippingMethod === "paczkomat" ? (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-sans font-bold uppercase tracking-wider text-brand-amethyst flex items-center gap-1.5">
                        <FaLocationDot className="size-3.5" />
                        Wybierz Paczkomat na mapie / liście
                      </label>
                      <span className="text-[11px] text-white/40">InPost 24/7</span>
                    </div>

                    {/* Search Paczkomaty */}
                    <input
                      type="text"
                      value={paczkomatSearch}
                      onChange={(e) => setPaczkomatSearch(e.target.value)}
                      placeholder="Szukaj miasta, ulicy lub kodu (np. Warszawa, Marszałkowska)..."
                      className="w-full bg-white/5 border border-white/15 rounded-xl py-2 px-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-brand-amethyst"
                    />

                    {/* Interactive Paczkomaty Grid List */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1 p-1">
                      {filteredPaczkomaty.map((p) => {
                        const isSelected = selectedPaczkomatCode === p.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectPaczkomat(p)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                              isSelected
                                ? "border-emerald-400 bg-emerald-500/15 text-white shadow-md shadow-emerald-500/10"
                                : "border-white/10 bg-white/5 text-white/70 hover:border-white/30 hover:bg-white/10"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <span className="font-sans font-bold text-xs text-white uppercase block">
                                  {p.id} • {p.city}
                                </span>
                                <span className="font-mono text-[11px] text-white/60 block mt-0.5">
                                  {p.address}
                                </span>
                              </div>
                              {isSelected && (
                                <span className="size-5 rounded-full bg-emerald-400 text-black flex items-center justify-center shrink-0 shadow">
                                  <FaCheck size={10} />
                                </span>
                              )}
                            </div>
                            <span className="font-mono text-[10px] text-brand-amethyst mt-1">
                              {p.info}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  /* COURIER ADDRESS FIELDS */
                  <>
                    <div>
                      <label className="block text-xs font-sans font-bold uppercase tracking-wider text-white/70 mb-1">
                        {t("checkout.address")}
                      </label>
                      <input
                        type="text"
                        required
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Marszałkowska 45/12"
                        className="w-full bg-white/5 border border-white/15 rounded-xl py-2.5 px-3.5 text-white placeholder-white/20 focus:outline-none focus:border-brand-amethyst"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-sans font-bold uppercase tracking-wider text-white/70 mb-1">
                          {t("checkout.city")}
                        </label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Warszawa"
                          className="w-full bg-white/5 border border-white/15 rounded-xl py-2.5 px-3.5 text-white placeholder-white/20 focus:outline-none focus:border-brand-amethyst"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-sans font-bold uppercase tracking-wider text-white/70 mb-1">
                          {t("checkout.postalCode")}
                        </label>
                        <input
                          type="text"
                          required
                          value={postalCode}
                          onChange={(e) => setPostalCode(e.target.value)}
                          placeholder="00-001"
                          className="w-full bg-white/5 border border-white/15 rounded-xl py-2.5 px-3.5 text-white placeholder-white/20 focus:outline-none focus:border-brand-amethyst"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* 2. Payment Method */}
            <div className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl">
              <h2 className="font-display text-xl font-bold uppercase tracking-wider text-white mb-5 flex items-center gap-3">
                <span className="size-7 rounded-full bg-brand-amethyst text-white text-xs font-mono flex items-center justify-center">
                  2
                </span>
                {t("checkout.paymentTitle")}
              </h2>

              {/* Payment Method Selector Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === "card"
                      ? "border-brand-amethyst bg-brand-amethyst/20 text-white shadow-lg shadow-brand-amethyst/10"
                      : "border-white/10 bg-white/5 text-white/60 hover:border-white/30"
                  }`}
                >
                  <FaCreditCard size={20} className="mx-auto mb-1 text-brand-lime" />
                  <span className="font-sans text-xs font-bold uppercase tracking-wider">
                    Karta
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("blik")}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === "blik"
                      ? "border-brand-amethyst bg-brand-amethyst/20 text-white shadow-lg shadow-brand-amethyst/10"
                      : "border-white/10 bg-white/5 text-white/60 hover:border-white/30"
                  }`}
                >
                  <FaMobileScreenButton size={20} className="mx-auto mb-1 text-brand-lime" />
                  <span className="font-sans text-xs font-bold uppercase tracking-wider">
                    BLIK
                  </span>
                </button>

                {/* CASH PAYMENT — ONLY AVAILABLE WHEN COURIER IS SELECTED */}
                {shippingMethod === "courier" ? (
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                      paymentMethod === "cash"
                        ? "border-brand-amethyst bg-brand-amethyst/20 text-white shadow-lg shadow-brand-amethyst/10"
                        : "border-white/10 bg-white/5 text-white/60 hover:border-white/30"
                    }`}
                  >
                    <FaMoneyBill1 size={20} className="mx-auto mb-1 text-brand-lime" />
                    <span className="font-sans text-xs font-bold uppercase tracking-wider">
                      Gotówka
                    </span>
                  </button>
                ) : (
                  <div
                    title="Płatność gotówką przy odbiorze dostępna tylko dla kuriera"
                    className="p-3 rounded-2xl border border-white/5 bg-white/[0.02] text-center opacity-40 cursor-not-allowed relative"
                  >
                    <FaMoneyBill1 size={20} className="mx-auto mb-1 text-white/30" />
                    <span className="font-sans text-xs font-bold uppercase tracking-wider text-white/30 block">
                      Gotówka
                    </span>
                    <span className="font-mono text-[9px] text-amber-400 block mt-0.5">
                      Tylko Kurier
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setPaymentMethod("applepay")}
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                    paymentMethod === "applepay"
                      ? "border-brand-amethyst bg-brand-amethyst/20 text-white shadow-lg shadow-brand-amethyst/10"
                      : "border-white/10 bg-white/5 text-white/60 hover:border-white/30"
                  }`}
                >
                  <FaApple size={20} className="mx-auto mb-1 text-brand-lime" />
                  <span className="font-sans text-xs font-bold uppercase tracking-wider">
                    Apple Pay
                  </span>
                </button>
              </div>

              {/* Payment detail inputs */}
              {paymentMethod === "card" && (
                <div className="space-y-4 font-mono text-sm p-4 rounded-2xl bg-black/20 border border-white/10">
                  <div>
                    <label className="block text-xs font-sans font-bold uppercase tracking-wider text-white/70 mb-1">
                      {t("checkout.cardNumber")}
                    </label>
                    <input
                      type="text"
                      required
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="4532 0000 0000 8892"
                      className="w-full bg-white/5 border border-white/15 rounded-xl py-2.5 px-3.5 text-white placeholder-white/20 focus:outline-none focus:border-brand-amethyst"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-sans font-bold uppercase tracking-wider text-white/70 mb-1">
                        {t("checkout.cardExp")}
                      </label>
                      <input
                        type="text"
                        required
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                        placeholder="12/28"
                        className="w-full bg-white/5 border border-white/15 rounded-xl py-2.5 px-3.5 text-white placeholder-white/20 focus:outline-none focus:border-brand-amethyst"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-sans font-bold uppercase tracking-wider text-white/70 mb-1">
                        {t("checkout.cardCvc")}
                      </label>
                      <input
                        type="text"
                        required
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="777"
                        className="w-full bg-white/5 border border-white/15 rounded-xl py-2.5 px-3.5 text-white placeholder-white/20 focus:outline-none focus:border-brand-amethyst"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "blik" && (
                <div className="p-4 rounded-2xl bg-black/20 border border-white/10 font-mono text-sm">
                  <label className="block text-xs font-sans font-bold uppercase tracking-wider text-white/70 mb-2">
                    {t("checkout.blikCode")}
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="789 123"
                    value={blikCode}
                    onChange={(e) => setBlikCode(e.target.value)}
                    className="w-full text-center tracking-[0.4em] font-sans text-2xl font-bold bg-white/5 border border-brand-amethyst rounded-xl py-3 text-brand-lime placeholder-white/20 focus:outline-none"
                  />
                </div>
              )}

              {paymentMethod === "cash" && (
                <div className="p-4 rounded-2xl bg-black/20 border border-white/10 font-mono text-xs text-white/70 flex items-center gap-3">
                  <FaMoneyBill1 size={24} className="text-brand-lime shrink-0" />
                  <span>
                    Zapłać bezporednio kurierowi gotówką lub kartą przy odbiorze przesyłki.
                  </span>
                </div>
              )}

              {paymentMethod === "applepay" && (
                <div className="p-4 rounded-2xl bg-black/20 border border-white/10 font-mono text-xs text-white/70 flex items-center gap-3">
                  <FaApple size={24} className="text-white shrink-0" />
                  <span>
                    Autoryzacja Apple Pay / Google Pay nastąpi po kliknięciu przycisku potwierdzenia.
                  </span>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Order Summary */}
          <div className="lg:col-span-5">
            <div className="sticky top-32 rounded-3xl border border-brand-amethyst/30 bg-white/5 p-6 backdrop-blur-xl shadow-2xl">
              <h2 className="font-display text-xl font-bold uppercase tracking-wider text-white mb-5">
                {t("checkout.summaryTitle")}
              </h2>

              {/* Items List */}
              <div className="space-y-4 max-h-80 overflow-y-auto pr-1 mb-6 border-b border-white/10 pb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <div
                        className="size-3 rounded-full shrink-0"
                        style={{ backgroundColor: item.dominantColor }}
                      />
                      <div>
                        <p className="font-sans font-bold text-white uppercase text-xs">
                          {item.name}
                        </p>
                        <p className="font-mono text-xs text-white/40">
                          Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-mono text-brand-amethyst font-bold">
                      ${((item.price * item.quantity) / 100).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-2 font-mono text-sm mb-6">
                <div className="flex justify-between text-white/60">
                  <span>Subtotal</span>
                  <span>${(totalPrice / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-white/60">
                  <span>Shipping ({shippingMethod === "paczkomat" ? "Paczkomat" : "Courier"})</span>
                  <span>${(shippingFee / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-white pt-3 border-t border-white/10">
                  <span>{t("account.total")}</span>
                  <span className="text-emerald-400">
                    ${(finalTotal / 100).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="button-cutout w-full bg-gradient-to-b from-emerald-600 to-emerald-400 from-25% to-75% bg-[length:100%_400%] py-4 font-sans text-sm font-bold uppercase tracking-widest text-white hover:text-black transition-[background-position] duration-300 hover:bg-bottom cursor-pointer flex items-center justify-center gap-2 shadow-lg"
              >
                <FaLock size={14} />
                {isSubmitting ? "Processing..." : t("checkout.placeOrder")}
              </button>

            </div>
          </div>

        </form>
      </Bounded>
    </div>
  );
}
