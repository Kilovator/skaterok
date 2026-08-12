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
  { id: "WAW01M", city: "Warszawa", address: "ul. Marszałkowska 100", info: "InPost 24/7 • przy Metro Centrum" },
  { id: "WAW44A", city: "Warszawa", address: "ul. Aleje Jerozolimskie 54", info: "InPost 24/7 • Złote Tarasy" },
  { id: "WAW18N", city: "Warszawa", address: "ul. Wołoska 12", info: "InPost 24/7 • Galeria Mokotów" },
  { id: "KRA02A", city: "Kraków", address: "ul. Floriańska 12", info: "InPost 24/7 • Rynek Główny" },
  { id: "KRA14M", city: "Kraków", address: "ul. Pawia 5", info: "InPost 24/7 • Galeria Krakowska" },
  { id: "WRO09B", city: "Wrocław", address: "ul. Świdnicka 8", info: "InPost 24/7 • Galeria Dominikańska" },
  { id: "WRO22N", city: "Wrocław", address: "ul. Legnicka 58", info: "InPost 24/7 • Magnolia Park" },
  { id: "GDA15C", city: "Gdańsk", address: "ul. Długa 42", info: "InPost 24/7 • Stare Miasto" },
  { id: "GDN04M", city: "Gdańsk", address: "ul. Targ Sienny 7", info: "InPost 24/7 • Forum Gdańsk" },
  { id: "POZ03M", city: "Poznań", address: "ul. Półwiejska 18", info: "InPost 24/7 • Stary Browar" },
  { id: "KAT08A", city: "Katowice", address: "ul. Stawowa 5", info: "InPost 24/7 • Dworzec PKP" },
  { id: "LOD12B", city: "Łódź", address: "ul. Piotrkowska 104", info: "InPost 24/7 • Off Piotrkowska" },
  { id: "SZC01A", city: "Szczecin", address: "ul. Niepodległości 36", info: "InPost 24/7 • Kaskada" },
  { id: "LUB05M", city: "Lublin", address: "ul. Krakowskie Przedmieście 21", info: "InPost 24/7 • Centrum" },
  { id: "BIA02N", city: "Białystok", address: "ul. Lipowa 14", info: "InPost 24/7 • Rynek Kościuszki" },
  { id: "RZE01M", city: "Rzeszów", address: "ul. 3 Maja 8", info: "InPost 24/7 • Galeria Rzeszów" },
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

  // Result & Error state
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showInPostMapModal, setShowInPostMapModal] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

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
    setValidationError(null);

    if (items.length === 0) return;

    // 1. Full Name Validation: Must contain at least two words and letters only (no pure numbers)
    const nameTrimmed = fullName.trim();
    if (nameTrimmed.length < 3 || /^\d+$/.test(nameTrimmed)) {
      setValidationError("Proszę wpisać prawidłowe Imię i Nazwisko (np. Alex Rider).");
      return;
    }
    const nameWords = nameTrimmed.split(/\s+/);
    if (nameWords.length < 2) {
      setValidationError("Proszę wpisać zarówno Imię, jak i Nazwisko.");
      return;
    }

    // 2. Phone Validation: Must be 9-15 digits
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    if (!/^\+?[0-9]{9,15}$/.test(cleanPhone)) {
      setValidationError("Wpisz prawidłowy numer telefonu (np. +48 600 000 000).");
      return;
    }

    // 3. Email Validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setValidationError("Proszę podać prawidłowy adres e-mail.");
      return;
    }

    // 4. Shipping Method Specific Validations
    if (shippingMethod === "courier") {
      if (address.trim().length < 5 || /^\d+$/.test(address.trim())) {
        setValidationError("Wpisz prawidłowy adres dostawy (ulicę i numer domu).");
        return;
      }
      if (city.trim().length < 2 || /^\d+$/.test(city.trim())) {
        setValidationError("Wpisz prawidłową nazwę miasta.");
        return;
      }
      // Postal code regex: XX-XXX or 5 digits
      const cleanPostal = postalCode.trim();
      if (!/^\d{2}-\d{3}$/.test(cleanPostal) && !/^\d{5}$/.test(cleanPostal)) {
        setValidationError("Wpisz prawidłowy kod pocztowy (np. 00-001).");
        return;
      }
    } else if (shippingMethod === "paczkomat") {
      if (!selectedPaczkomatCode) {
        setValidationError("Wybierz Paczkomat InPost z listy lub mapy.");
        return;
      }
    }

    // 5. Payment Method Specific Validations
    if (paymentMethod === "blik") {
      const cleanBlik = blikCode.replace(/\D/g, "");
      if (cleanBlik.length !== 6) {
        setValidationError("Kod BLIK musi składać się dokładnie z 6 cyfr (np. 123 456).");
        return;
      }
    } else if (paymentMethod === "card") {
      const cleanCard = cardNumber.replace(/\D/g, "");
      if (cleanCard.length !== 16) {
        setValidationError("Numer karty kredytowej musi składać się z 16 cyfr.");
        return;
      }
      const cleanExp = cardExp.trim();
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(cleanExp)) {
        setValidationError("Wpisz prawidłową datę ważności karty w formacie MM/RR (np. 12/28).");
        return;
      }
      const cleanCvc = cardCvc.replace(/\D/g, "");
      if (cleanCvc.length !== 3) {
        setValidationError("Kod CVC musi składać się dokładnie z 3 cyfr.");
        return;
      }
    }

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

          {/* Validation Error Alert Banner */}
          {validationError && (
            <div className="lg:col-span-12 p-4 rounded-2xl bg-rose-500/20 border-2 border-rose-500 text-rose-200 text-sm font-sans font-bold flex items-center justify-between gap-3 shadow-xl animate-fade-in">
              <div className="flex items-center gap-3">
                <span className="size-8 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center text-sm shrink-0">
                  !
                </span>
                <span>{validationError}</span>
              </div>
              <button
                type="button"
                onClick={() => setValidationError(null)}
                className="text-rose-300 hover:text-white font-bold text-xs uppercase px-2 py-1"
              >
                ✕
              </button>
            </div>
          )}

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
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${shippingMethod === "courier"
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
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${shippingMethod === "paczkomat"
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
                      <label className="block text-xs font-sans font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                        <FaLocationDot className="size-3.5" />
                        Wybierz Paczkomat InPost 24/7
                      </label>
                      <span className="text-[11px] font-mono font-bold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full">
                        InPost Official API
                      </span>
                    </div>

                    {/* Selected Locker Summary Box */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-black to-zinc-900 border border-amber-400/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
                      <div>
                        <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-widest block">
                          Wybrany Paczkomat:
                        </span>
                        <p className="font-sans font-extrabold text-white text-sm mt-0.5">
                          📍 {paczkomatId}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowInPostMapModal(true)}
                        className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-sans text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer shadow-lg shrink-0 flex items-center gap-2"
                      >
                        <FaLocationDot size={12} />
                        Otwórz Mapę Paczkomatów 🗺️
                      </button>
                    </div>

                    {/* Quick Search & Select Grid */}
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={paczkomatSearch}
                        onChange={(e) => setPaczkomatSearch(e.target.value)}
                        placeholder="Szukaj miasta lub kodu InPost (np. Warszawa, KRA02A, Marszałkowska)..."
                        className="w-full bg-white/5 border border-white/15 rounded-xl py-2 px-3 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400 font-mono"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
                        {filteredPaczkomaty.map((p) => {
                          const isSelected = selectedPaczkomatCode === p.id;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => handleSelectPaczkomat(p)}
                              className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                                isSelected
                                  ? "border-amber-400 bg-amber-400/20 text-white shadow-md shadow-amber-500/10"
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
                                  <span className="size-5 rounded-full bg-amber-400 text-black flex items-center justify-center shrink-0 shadow">
                                    <FaCheck size={10} />
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-[10px] text-amber-300 mt-1">
                                {p.info}
                              </span>
                            </button>
                          );
                        })}
                      </div>
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
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${paymentMethod === "card"
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
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${paymentMethod === "blik"
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
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${paymentMethod === "cash"
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
                  className={`p-3 rounded-2xl border text-center transition-all cursor-pointer ${paymentMethod === "applepay"
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
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1 mb-6 border-b border-white/10 pb-6">
                {items.map((item) => {
                  const isCustomBuild = !!item.buildDetails;

                  return (
                    <div key={item.id} className="p-3 rounded-2xl border border-white/10 bg-white/5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className="size-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: item.dominantColor }}
                          />
                          <p className="font-sans font-bold text-white uppercase text-xs truncate">
                            {item.name}
                          </p>
                        </div>
                        <span className="font-mono text-xs font-bold text-brand-amethyst shrink-0">
                          ${((item.price * item.quantity) / 100).toFixed(2)}
                        </span>
                      </div>

                      {/* Custom Build Detailed 4-Component Square Frames */}
                      {isCustomBuild && item.buildDetails ? (
                        <div className="grid grid-cols-4 gap-1.5 pt-1.5 border-t border-white/10">
                          {/* Deck */}
                          <div className="flex flex-col items-center gap-0.5">
                            <div className="aspect-square w-full rounded-lg overflow-hidden bg-zinc-950 border border-white/15 flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={item.buildDetails.deck.textureUrl || item.image.src} alt="Deck" className="w-full h-full object-cover object-[80%_center]" />
                            </div>
                            <span className="text-[8px] font-sans text-white/60 truncate w-full text-center">
                              🛹 {item.buildDetails.deck.uid.replace(/-/g, " ")}
                            </span>
                          </div>

                          {/* Wheels */}
                          <div className="flex flex-col items-center gap-0.5">
                            <div className="aspect-square w-full rounded-lg overflow-hidden bg-zinc-950 border border-white/15 flex items-center justify-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={item.buildDetails.wheels.textureUrl || "/skateboard/SkateWheel1.png"} alt="Wheels" className="w-full h-full object-cover" />
                            </div>
                            <span className="text-[8px] font-sans text-white/60 truncate w-full text-center">
                              ⚙️ {item.buildDetails.wheels.uid.replace(/-/g, " ")}
                            </span>
                          </div>

                          {/* Truck */}
                          <div className="flex flex-col items-center gap-0.5">
                            <div className="aspect-square w-full rounded-lg overflow-hidden bg-zinc-950 border border-white/15 p-1 flex flex-col items-center justify-center">
                              <div className="size-4 rounded border border-white/30" style={{ backgroundColor: item.buildDetails.truck.color }} />
                            </div>
                            <span className="text-[8px] font-sans text-white/60 truncate w-full text-center">
                              🔩 {item.buildDetails.truck.uid}
                            </span>
                          </div>

                          {/* Bolt */}
                          <div className="flex flex-col items-center gap-0.5">
                            <div className="aspect-square w-full rounded-lg overflow-hidden bg-zinc-950 border border-white/15 p-1 flex flex-col items-center justify-center">
                              <div className="size-4 rounded-full border border-white/30" style={{ backgroundColor: item.buildDetails.bolt.color }} />
                            </div>
                            <span className="text-[8px] font-sans text-white/60 truncate w-full text-center">
                              🔩 {item.buildDetails.bolt.uid}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                          <div className="aspect-square size-8 rounded-lg overflow-hidden bg-zinc-950 border border-white/15 p-0.5 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={item.image.src} alt={item.name} className="w-full h-full object-contain" />
                          </div>
                          <span className="font-mono text-[10px] text-white/50">
                            Qty: {item.quantity}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
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

      {/* ── Official InPost Paczkomat Map & Selector Modal ── */}
      {showInPostMapModal && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center p-4 sm:p-6 animate-fade-in">
          <div className="relative max-w-4xl w-full h-[85vh] bg-zinc-950 border-2 border-amber-400/60 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-black flex items-center justify-between shadow-lg shrink-0">
              <div className="flex items-center gap-3">
                <span className="size-8 rounded-xl bg-black text-amber-400 font-display font-extrabold text-sm flex items-center justify-center">
                  24/7
                </span>
                <div>
                  <h3 className="font-sans font-extrabold text-base uppercase tracking-wider text-black">
                    InPost Paczkomaty 24/7 • Geowidget Map
                  </h3>
                  <p className="font-mono text-[11px] text-black/80">
                    Wybierz najdogodniejszy punkt odbioru InPost w całej Polsce
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowInPostMapModal(false)}
                className="size-9 rounded-full bg-black/20 hover:bg-black/40 text-black font-bold flex items-center justify-center transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Content: Search & Map List */}
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={paczkomatSearch}
                  onChange={(e) => setPaczkomatSearch(e.target.value)}
                  placeholder="Wpisz miasto lub ulica (np. Warszawa, Krakowska, Poznań, Wrocław)..."
                  className="flex-1 bg-white/5 border border-white/20 rounded-2xl py-3 px-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400 font-mono"
                />
              </div>

              {/* City Filter Badges */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs">
                <span className="text-white/40 uppercase mr-1">Szybкий выбор:</span>
                {["Warszawa", "Kraków", "Wrocław", "Gdańsk", "Poznań", "Katowice", "Łódź"].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setPaczkomatSearch(city)}
                    className="px-3 py-1 rounded-full bg-white/10 hover:bg-amber-400 hover:text-black text-white/80 transition-all cursor-pointer shrink-0 border border-white/10"
                  >
                    {city}
                  </button>
                ))}
              </div>

              {/* Grid List of Official InPost Lockers */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                {filteredPaczkomaty.map((p) => {
                  const isSelected = selectedPaczkomatCode === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => {
                        handleSelectPaczkomat(p);
                        setShowInPostMapModal(false);
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between group ${
                        isSelected
                          ? "border-amber-400 bg-amber-400/20 text-white shadow-xl shadow-amber-400/10"
                          : "border-white/15 bg-white/5 text-white/80 hover:border-amber-400/60 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold uppercase bg-amber-400 text-black">
                              {p.id}
                            </span>
                            <span className="font-sans font-extrabold text-sm text-white">
                              {p.city}
                            </span>
                          </div>
                          <p className="font-mono text-xs text-white/80 mt-2 font-bold">
                            📍 {p.address}
                          </p>
                        </div>
                        {isSelected ? (
                          <span className="px-3 py-1 rounded-full bg-amber-400 text-black font-sans font-bold text-xs">
                            Wybrany
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full bg-white/10 group-hover:bg-amber-400 group-hover:text-black font-sans font-bold text-xs transition-colors">
                            Wybierz
                          </span>
                        )}
                      </div>
                      <div className="pt-3 border-t border-white/10 mt-3 flex items-center justify-between text-[11px] font-mono text-amber-300">
                        <span>{p.info}</span>
                        <span>Dostępny 24/7</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-white/10 bg-black flex items-center justify-between text-xs text-white/50 font-mono shrink-0">
              <span>Oficjalny System Wyboru Paczkomatu InPost 24/7</span>
              <button
                onClick={() => setShowInPostMapModal(false)}
                className="px-5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold uppercase cursor-pointer"
              >
                Zamknij Mapę
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
