"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  FaBarcode,
  FaPlus,
  FaMinus,
  FaTrashCan,
  FaPause,
  FaBan,
  FaMoneyBillWave,
  FaCreditCard,
  FaMobileScreenButton,
  FaGift,
  FaMagnifyingGlass,
  FaCheck,
  FaXmark,
  FaUser,
  FaArrowLeft,
} from "react-icons/fa6";
import { MonacoTranslations } from "@/data/monacoTranslations";
import { CartItem, OrderItem } from "./types";
import { electricProducts, Product } from "@/data/products";
import { MonacoReceiptModal, ReceiptData } from "./MonacoReceiptModal";

interface MonacoPOSTerminalProps {
  t: MonacoTranslations;
  storeName: string;
  adminName: string;
  onBackToDashboard: () => void;
  onCompleteSale: (orderData: {
    items: OrderItem[];
    subtotal: number;
    shippingFee: number;
    total: number;
    shippingMethod: string;
    shippingDetails: {
      fullName: string;
      notes: string;
    };
    paymentMethod: string;
    paymentInfo: string;
  }) => Promise<string | undefined>;
  soundEnabled: boolean;
}

export function MonacoPOSTerminal({
  t,
  storeName,
  adminName,
  onBackToDashboard,
  onCompleteSale,
  soundEnabled,
}: MonacoPOSTerminalProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState(t.walkInCustomer);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Payment checkout modal state
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "blik" | "gift_card">("cash");
  const [tenderedAmount, setTenderedAmount] = useState<string>("");
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Completed receipt modal state
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);

  // Audio effect for scanning / clicking item
  const playScanBeep = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.1);
    } catch {
      // Audio fallback
    }
  }, [soundEnabled]);

  // Audio chime for completing sale
  const playCashRegisterSound = useCallback(() => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const now = audioCtx.currentTime;
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc2.frequency.setValueAtTime(783.99, now + 0.2); // G5
      osc2.frequency.setValueAtTime(1046.50, now + 0.3); // C6

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.6);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioCtx.destination);

      osc1.start(now);
      osc2.start(now + 0.2);
      osc1.stop(now + 0.2);
      osc2.stop(now + 0.6);
    } catch {
      // Audio fallback
    }
  }, [soundEnabled]);

  // Filter products by search and category
  const filteredProducts = electricProducts.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "all" || product.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Add product to cart
  const addToCart = (product: Product) => {
    playScanBeep();
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1 }];
    });
  };

  // Adjust quantity
  const updateQuantity = (productId: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  // Remove single item
  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  // Clear cart
  const clearCart = () => {
    if (cart.length > 0 && window.confirm("¿Cancelar venta actual y vaciar carrito?")) {
      setCart([]);
    }
  };

  // Handle barcode scanning input
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matched = electricProducts.find(
      (p) =>
        p.id.toLowerCase() === barcodeInput.trim().toLowerCase() ||
        p.name.toLowerCase().includes(barcodeInput.trim().toLowerCase())
    );

    if (matched) {
      addToCart(matched);
      setBarcodeInput("");
    } else if (electricProducts.length > 0) {
      // Fallback add first matching or random product
      addToCart(electricProducts[0]);
      setBarcodeInput("");
    }
  };

  // Calculate cart sums
  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
  const tax = Math.round(subtotal * 0.08); // 8% sales tax
  const discount = 0;
  const grandTotal = subtotal + tax - discount;

  // Change calculation
  const tenderedNumeric = parseFloat(tenderedAmount) ? Math.round(parseFloat(tenderedAmount) * 100) : grandTotal;
  const changeDue = Math.max(0, tenderedNumeric - grandTotal);

  // Open Checkout Modal
  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setTenderedAmount((grandTotal / 100).toFixed(2));
    setIsPaymentModalOpen(true);
  };

  // Process & Complete Sale
  const handleConfirmSale = async () => {
    if (isSubmittingOrder) return;
    setIsSubmittingOrder(true);

    try {
      const orderItems: OrderItem[] = cart.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        image: item.product.image,
        dominantColor: item.product.dominantColor,
      }));

      const generatedId = await onCompleteSale({
        items: orderItems,
        subtotal,
        shippingFee: 0,
        total: grandTotal,
        shippingMethod: "pos_instore",
        shippingDetails: {
          fullName: customerName,
          notes: "Monaco POS In-store Terminal Sale",
        },
        paymentMethod,
        paymentInfo: `Tendered: $${(tenderedNumeric / 100).toFixed(2)}, Change: $${(changeDue / 100).toFixed(2)}`,
      });

      playCashRegisterSound();

      // Show receipt modal
      const newReceipt: ReceiptData = {
        orderId: generatedId || `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        storeName,
        cashierName: adminName,
        customerName,
        date: new Date().toLocaleString(),
        items: orderItems,
        subtotal,
        tax,
        discount,
        total: grandTotal,
        paymentMethod,
        tendered: tenderedNumeric,
        change: changeDue,
      };

      setReceiptData(newReceipt);
      setCart([]);
      setIsPaymentModalOpen(false);
    } catch {
      alert("Error saving sale to database.");
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="flex-1 bg-[#eceef1] flex flex-col h-[calc(100vh-3.5rem)] overflow-hidden">
      {/* POS Top Subheader */}
      <div className="bg-[#262a33] text-white px-4 py-2 flex items-center justify-between border-b border-black/30 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/30 hover:bg-black/50 text-xs font-bold transition-colors cursor-pointer text-gray-300 hover:text-white"
          >
            <FaArrowLeft size={12} />
            <span>{t.dashboard}</span>
          </button>
          <span className="font-bold text-sm text-gray-200">
            {t.posTerminal} — Register #1
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono">
          <span className="text-gray-400">
            Cashier: <strong className="text-white font-bold">{adminName}</strong>
          </span>
          <span className="bg-[#27ae60] text-white px-2 py-0.5 rounded font-bold text-[11px]">
            ONLINE
          </span>
        </div>
      </div>

      {/* POS Workspace: Left Cart + Right Catalog */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        {/* Left: Cart / Ticket Pane */}
        <div className="w-full lg:w-[420px] xl:w-[460px] bg-white border-r border-gray-300 flex flex-col shrink-0 shadow-md">
          {/* Customer & Barcode header */}
          <div className="p-3 bg-gray-50 border-b border-gray-200 space-y-2">
            {/* Customer selector */}
            <div className="flex items-center gap-2">
              <FaUser size={13} className="text-gray-500" />
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder={t.selectCustomer}
                className="w-full text-xs font-medium bg-white border border-gray-300 rounded px-2.5 py-1.5 text-gray-800 focus:outline-none focus:border-[#e53935]"
              />
            </div>

            {/* Barcode scanner input */}
            <form onSubmit={handleBarcodeSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <FaBarcode size={14} className="absolute left-2.5 top-2.5 text-gray-400" />
                <input
                  type="text"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  placeholder={t.searchOrBarcode}
                  className="w-full text-xs bg-white border border-gray-300 rounded pl-8 pr-2 py-1.5 text-gray-800 focus:outline-none focus:border-[#e53935]"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-[#e53935] hover:bg-[#d32f2f] text-white text-xs font-bold rounded cursor-pointer transition-colors"
              >
                Scan
              </button>
            </form>
          </div>

          {/* Cart Items Table */}
          <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                <FaBarcode size={36} className="text-gray-300 mb-2" />
                <p className="text-xs font-medium">{t.emptyCart}</p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Click any product on the right to scan & add
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.product.id} className="py-2 px-2 flex items-center justify-between gap-2 hover:bg-gray-50 rounded">
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-800 truncate" title={item.product.name}>
                      {item.product.name}
                    </p>
                    <p className="text-[11px] text-gray-500 font-mono">
                      ${(item.product.price / 100).toFixed(2)} x {item.quantity}
                    </p>
                  </div>

                  {/* Quantity adjuster */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => updateQuantity(item.product.id, -1)}
                      className="size-6 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center cursor-pointer text-xs"
                    >
                      <FaMinus size={9} />
                    </button>
                    <span className="w-6 text-center text-xs font-bold font-mono">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.product.id, 1)}
                      className="size-6 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 flex items-center justify-center cursor-pointer text-xs"
                    >
                      <FaPlus size={9} />
                    </button>
                  </div>

                  {/* Line Total & Remove */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-xs font-extrabold text-gray-800 w-16 text-right">
                      ${((item.product.price * item.quantity) / 100).toFixed(2)}
                    </span>
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer p-1"
                    >
                      <FaTrashCan size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Totals Summary */}
          <div className="bg-gray-100 p-3 border-t border-gray-300 space-y-1.5 text-xs font-sans">
            <div className="flex justify-between text-gray-600">
              <span>{t.subtotal}:</span>
              <span className="font-mono font-medium">${(subtotal / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{t.tax} (8%):</span>
              <span className="font-mono font-medium">${(tax / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-1.5 border-t border-gray-200">
              <span>{t.total}:</span>
              <span className="font-mono text-base text-[#d32f2f]">
                ${(grandTotal / 100).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Checkout Action Buttons */}
          <div className="p-3 bg-white border-t border-gray-200 grid grid-cols-3 gap-2">
            <button
              onClick={() => alert(t.holdOrderAlert)}
              disabled={cart.length === 0}
              className="py-2.5 px-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
            >
              <FaPause size={11} />
              <span>{t.holdOrder}</span>
            </button>

            <button
              onClick={clearCart}
              disabled={cart.length === 0}
              className="py-2.5 px-2 bg-[#d9534f]/15 hover:bg-[#d9534f]/25 text-[#d9534f] rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
            >
              <FaBan size={11} />
              <span>{t.cancelOrder}</span>
            </button>

            <button
              onClick={handleOpenCheckout}
              disabled={cart.length === 0}
              className="py-2.5 px-2 bg-[#27ae60] hover:bg-[#219150] text-white rounded text-xs font-extrabold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-md disabled:opacity-40 uppercase tracking-wide"
            >
              <FaMoneyBillWave size={13} />
              <span>{t.payCheckout} (F2)</span>
            </button>
          </div>
        </div>

        {/* Right: Products Catalog Grid */}
        <div className="flex-1 flex flex-col min-w-0 bg-[#eceef1] p-3 sm:p-4 overflow-hidden">
          {/* Search bar & Category filters */}
          <div className="flex flex-col sm:flex-row gap-2.5 mb-3 shrink-0">
            {/* Search input */}
            <div className="relative flex-1">
              <FaMagnifyingGlass size={13} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products by name or SKU..."
                className="w-full text-xs bg-white border border-gray-300 rounded-sm pl-9 pr-3 py-2 text-gray-800 focus:outline-none focus:border-[#e53935] shadow-xs"
              />
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1.5 rounded-sm text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  selectedCategory === "all"
                    ? "bg-[#262a33] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                {t.allCategories}
              </button>
              <button
                onClick={() => setSelectedCategory("eskate")}
                className={`px-3 py-1.5 rounded-sm text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  selectedCategory === "eskate"
                    ? "bg-[#262a33] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                E-Skate
              </button>
              <button
                onClick={() => setSelectedCategory("hoverboard")}
                className={`px-3 py-1.5 rounded-sm text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  selectedCategory === "hoverboard"
                    ? "bg-[#262a33] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Hoverboards
              </button>
              <button
                onClick={() => setSelectedCategory("euc")}
                className={`px-3 py-1.5 rounded-sm text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                  selectedCategory === "euc"
                    ? "bg-[#262a33] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Monocykle
              </button>
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3 pr-1">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                onClick={() => addToCart(prod)}
                className="bg-white rounded-sm border border-gray-200 p-2.5 flex flex-col justify-between hover:border-[#e53935] hover:shadow-md cursor-pointer transition-all select-none group"
              >
                {/* Photo & stock pill */}
                <div className="relative aspect-square w-full rounded bg-gray-50 mb-2 flex items-center justify-center overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={prod.image.src}
                    alt={prod.name}
                    className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                  />
                  <span className="absolute top-1 right-1 bg-black/60 text-white text-[9px] font-mono px-1.5 py-0.5 rounded">
                    In Stock
                  </span>
                </div>

                {/* Info & Price */}
                <div>
                  <h4 className="text-xs font-bold text-gray-800 line-clamp-2 leading-tight mb-1 group-hover:text-[#e53935] transition-colors">
                    {prod.name}
                  </h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs font-extrabold font-mono text-[#27ae60]">
                      ${(prod.price / 100).toFixed(2)}
                    </span>
                    <span className="size-5 rounded-full bg-gray-100 group-hover:bg-[#e53935] group-hover:text-white text-gray-600 flex items-center justify-center text-[10px] transition-colors">
                      <FaPlus size={8} />
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment Checkout Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-2xl max-w-md w-full overflow-hidden border border-gray-300 animate-fade-in">
            {/* Header */}
            <div className="bg-[#e53935] text-white px-5 py-3 flex items-center justify-between">
              <span className="font-bold text-sm uppercase tracking-wider">
                {t.payCheckout} — ${(grandTotal / 100).toFixed(2)}
              </span>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <FaXmark size={18} />
              </button>
            </div>

            <div className="p-5 space-y-4 font-sans">
              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                  {t.paymentMethod}
                </label>
                <div className="grid grid-cols-4 gap-2">
                  <button
                    onClick={() => setPaymentMethod("cash")}
                    className={`py-2 px-1 text-center rounded text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-colors border ${
                      paymentMethod === "cash"
                        ? "bg-[#27ae60] text-white border-[#27ae60]"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
                    }`}
                  >
                    <FaMoneyBillWave size={14} />
                    <span>{t.cash}</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("card")}
                    className={`py-2 px-1 text-center rounded text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-colors border ${
                      paymentMethod === "card"
                        ? "bg-[#2980b9] text-white border-[#2980b9]"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
                    }`}
                  >
                    <FaCreditCard size={14} />
                    <span>{t.card}</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("blik")}
                    className={`py-2 px-1 text-center rounded text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-colors border ${
                      paymentMethod === "blik"
                        ? "bg-[#e67e22] text-white border-[#e67e22]"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
                    }`}
                  >
                    <FaMobileScreenButton size={14} />
                    <span>{t.blik}</span>
                  </button>

                  <button
                    onClick={() => setPaymentMethod("gift_card")}
                    className={`py-2 px-1 text-center rounded text-xs font-bold flex flex-col items-center gap-1 cursor-pointer transition-colors border ${
                      paymentMethod === "gift_card"
                        ? "bg-[#9b59b6] text-white border-[#9b59b6]"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-300"
                    }`}
                  >
                    <FaGift size={14} />
                    <span>{t.giftCards}</span>
                  </button>
                </div>
              </div>

              {/* Amount Tendered (for cash calculation) */}
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase">
                  {t.amountTendered} ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={tenderedAmount}
                  onChange={(e) => setTenderedAmount(e.target.value)}
                  className="w-full text-base font-mono font-bold bg-gray-50 border border-gray-300 rounded px-3 py-2 text-gray-800 focus:outline-none focus:border-[#e53935]"
                />

                {/* Quick Bills Shortcuts */}
                <div className="flex gap-2 mt-2">
                  {[20, 50, 100, 200, 500].map((val) => (
                    <button
                      key={val}
                      onClick={() => setTenderedAmount(String(val))}
                      className="flex-1 py-1 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded text-xs font-mono font-bold text-gray-700 cursor-pointer"
                    >
                      ${val}
                    </button>
                  ))}
                  <button
                    onClick={() => setTenderedAmount((grandTotal / 100).toFixed(2))}
                    className="flex-1 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs font-mono font-bold text-gray-700 cursor-pointer"
                  >
                    Exact
                  </button>
                </div>
              </div>

              {/* Change Due Display */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 uppercase">
                  {t.changeDue}:
                </span>
                <span className="text-lg font-mono font-extrabold text-emerald-700">
                  ${(changeDue / 100).toFixed(2)}
                </span>
              </div>

              {/* Submit Payment button */}
              <button
                onClick={handleConfirmSale}
                disabled={isSubmittingOrder || (tenderedNumeric < grandTotal && paymentMethod === "cash")}
                className="w-full py-3 bg-[#27ae60] hover:bg-[#219150] disabled:opacity-50 text-white text-sm font-extrabold rounded uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmittingOrder ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <FaCheck size={14} />
                    <span>{t.confirmPayment}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      <MonacoReceiptModal
        t={t}
        receipt={receiptData}
        onClose={() => setReceiptData(null)}
      />
    </div>
  );
}
