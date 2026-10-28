"use client";

import { useState, useMemo } from "react";
import {
  FaTableCells,
  FaBarcode,
  FaCartShopping,
  FaBell,
  FaFolderOpen,
  FaCreditCard,
  FaUsers,
  FaGear,
  FaChartSimple,
  FaUserGear,
  FaDatabase,
  FaStore,
  FaHouse,
  FaArrowTrendUp,
} from "react-icons/fa6";
import { MonacoTranslations } from "@/data/monacoTranslations";
import { MonacoTab, Order } from "./types";
import { electricProducts } from "@/data/products";

interface MonacoDashboardProps {
  t: MonacoTranslations;
  onSelectTab: (tab: MonacoTab) => void;
  orders: Order[];
  onOpenBackupModal: () => void;
  onOpenStoresModal: () => void;
  staffUsersCount?: number;
}

export function MonacoDashboard({
  t,
  onSelectTab,
  orders,
  onOpenBackupModal,
  onOpenStoresModal,
  staffUsersCount = 1,
}: MonacoDashboardProps) {
  const [selectedMonth, setSelectedMonth] = useState<string>("Oct-2026");

  // Compute live statistics from orders
  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const openOrders = orders.filter((o) => o.status === "Processing").length;
    const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
    const totalSubtotal = orders.reduce((acc, o) => acc + (o.subtotal || 0), 0);

    // Collect unique customers
    const customersSet = new Set<string>();
    orders.forEach((o) => {
      const emailOrName = o.shippingDetails?.fullName || o.userId;
      if (emailOrName) customersSet.add(emailOrName);
    });

    // Approximate tax and discount
    const estimatedTax = Math.round(totalSubtotal * 0.08);
    const estimatedDiscount = Math.round(totalSubtotal * 0.03);

    return {
      totalOrders,
      openOrders,
      totalRevenue,
      estimatedTax,
      estimatedDiscount,
      totalCustomers: customersSet.size,
      totalProducts: electricProducts.length,
      categoriesCount: 5,
    };
  }, [orders]);

  // Top products calculation from order items or catalog
  const topProducts = useMemo(() => {
    const countMap: Record<string, { name: string; img: string; count: number; revenue: number }> = {};

    orders.forEach((order) => {
      if (Array.isArray(order.items)) {
        order.items.forEach((item) => {
          if (!countMap[item.name]) {
            countMap[item.name] = {
              name: item.name,
              img: item.image?.src || "/images/boosted-stealth/2.png",
              count: 0,
              revenue: 0,
            };
          }
          countMap[item.name].count += item.quantity || 1;
          countMap[item.name].revenue += (item.price || 0) * (item.quantity || 1);
        });
      }
    });

    const list = Object.values(countMap);
    if (list.length >= 4) {
      return list.sort((a, b) => b.count - a.count).slice(0, 5);
    }

    // Default top catalog items if few live orders
    return [
      {
        name: "Boosted Stealth Board 2000W",
        img: "/images/boosted-stealth/2.png",
        count: 42,
        revenue: 1469958,
      },
      {
        name: "Evolve GTR Series 2 Bamboo All Terrain",
        img: "/images/evolve-gtr/2.png",
        count: 28,
        revenue: 1679972,
      },
      {
        name: "Ninebot MiniPro 2 Segway Edition",
        img: "/images/ninebot-minipro2/1.png",
        count: 35,
        revenue: 874965,
      },
      {
        name: "InMotion V12 HT Electric Unicycle",
        img: "/images/inmotion-v12ht/1.png",
        count: 19,
        revenue: 949981,
      },
    ];
  }, [orders]);

  // The 12 iconic Monaco POS quick-link tiles matching screenshot colors & layout
  const quickTiles = [
    {
      id: "pos",
      number: "3",
      label: t.pos,
      icon: FaTableCells,
      bg: "bg-[#d9534f] hover:bg-[#c9302c]", // Red
      onClick: () => onSelectTab("pos"),
    },
    {
      id: "products",
      number: String(stats.totalProducts),
      label: t.products,
      icon: FaBarcode,
      bg: "bg-[#e67e22] hover:bg-[#d35400]", // Orange
      onClick: () => onSelectTab("products"),
    },
    {
      id: "sales",
      number: String(stats.totalOrders),
      label: t.sales,
      icon: FaCartShopping,
      bg: "bg-[#f1c40f] hover:bg-[#f39c12]", // Yellow / Gold
      onClick: () => onSelectTab("sales"),
    },
    {
      id: "openInvoices",
      number: String(stats.openOrders),
      label: t.openInvoices,
      icon: FaBell,
      bg: "bg-[#26a69a] hover:bg-[#00897b]", // Teal / Emerald
      onClick: () => onSelectTab("sales"),
    },
    {
      id: "categories",
      number: String(stats.categoriesCount),
      label: t.categories,
      icon: FaFolderOpen,
      bg: "bg-[#3498db] hover:bg-[#2980b9]", // Cyan / Blue
      onClick: () => onSelectTab("categories"),
    },
    {
      id: "giftcards",
      number: "1",
      label: t.giftCards,
      icon: FaCreditCard,
      bg: "bg-[#9b59b6] hover:bg-[#8e44ad]", // Purple
      onClick: () => onSelectTab("giftcards"),
    },
    {
      id: "customers",
      number: String(stats.totalCustomers),
      label: t.customers,
      icon: FaUsers,
      bg: "bg-[#e84393] hover:bg-[#d63031]", // Coral / Pink
      onClick: () => onSelectTab("people"),
    },
    {
      id: "settings",
      number: "•",
      label: t.settings,
      icon: FaGear,
      bg: "bg-[#f39c12] hover:bg-[#e67e22]", // Mustard / Amber
      onClick: () => onSelectTab("settings"),
    },
    {
      id: "reports",
      number: "•",
      label: t.reports,
      icon: FaChartSimple,
      bg: "bg-[#7f8c8d] hover:bg-[#6c7a89]", // Slate / Grey
      onClick: () => onSelectTab("reports"),
    },
    {
      id: "users",
      number: String(staffUsersCount),
      label: t.users,
      icon: FaUserGear,
      bg: "bg-[#2980b9] hover:bg-[#20638f]", // Royal Blue
      onClick: () => onSelectTab("people"),
    },
    {
      id: "backup",
      number: "•",
      label: t.backup,
      icon: FaDatabase,
      bg: "bg-[#34495e] hover:bg-[#2c3e50]", // Dark Navy
      onClick: onOpenBackupModal,
    },
    {
      id: "stores",
      number: "•",
      label: t.stores,
      icon: FaStore,
      bg: "bg-[#27ae60] hover:bg-[#229954]", // Green
      onClick: onOpenStoresModal,
    },
  ];

  return (
    <div className="flex-1 bg-[#eceef1] text-gray-800 p-4 sm:p-6 overflow-y-auto min-h-screen">
      {/* Top Breadcrumb Bar */}
      <div className="flex items-center justify-between pb-3 mb-5 border-b border-gray-300">
        <h1 className="text-xl sm:text-2xl font-normal text-gray-700 tracking-tight">
          {t.dashboard}
        </h1>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 font-sans">
          <FaHouse size={12} className="text-gray-400" />
          <span>/</span>
          <span className="text-gray-700 font-medium">{t.dashboard}</span>
        </div>
      </div>

      {/* Main Section: "Enlaces rápidos" Card Container */}
      <div className="bg-white rounded-sm shadow-sm border border-gray-200 p-4 sm:p-5 mb-6">
        <h2 className="text-sm font-semibold text-gray-600 mb-4 pb-2 border-b border-gray-100 flex items-center justify-between">
          <span>{t.quickLinks}</span>
          <span className="text-xs text-gray-400 font-mono">12 Quick Modules</span>
        </h2>

        {/* 12 Color Tiles Grid (4 columns x 3 rows on desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {quickTiles.map((tile) => {
            const Icon = tile.icon;
            return (
              <button
                key={tile.id}
                onClick={tile.onClick}
                className={`relative flex items-center justify-between p-4 sm:p-5 text-white rounded-sm shadow-sm transition-transform duration-150 hover:-translate-y-0.5 hover:shadow-md cursor-pointer select-none overflow-hidden ${tile.bg}`}
              >
                {/* Left side: big counter number + label */}
                <div className="text-left z-10">
                  <div className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-none mb-1 font-sans">
                    {tile.number}
                  </div>
                  <div className="text-xs sm:text-sm font-medium tracking-wide uppercase opacity-95">
                    {tile.label}
                  </div>
                </div>

                {/* Right side: large iconic glyph matching screenshot */}
                <div className="opacity-80 transition-transform duration-200 group-hover:scale-110 z-10">
                  <Icon className="size-8 sm:size-10" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Lower Section: Sales Chart & Top Products Leaderboard */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mb-8">
        {/* Left: "Gráfico de las ventas" (Sales Chart widget) */}
        <div className="lg:col-span-8 bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          {/* Card Header with Monaco POS top blue border accent */}
          <div className="border-t-2 border-[#3498db] px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">
              {t.salesChartTitle}
            </h3>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs bg-gray-50 border border-gray-300 rounded px-2 py-1 text-gray-700 focus:outline-none focus:border-[#3498db] cursor-pointer"
            >
              <option value="Oct-2026">Oct-2026</option>
              <option value="Nov-2026">Nov-2026</option>
              <option value="Dec-2026">Dec-2026</option>
              <option value="All-Year">Year 2026</option>
            </select>
          </div>

          {/* Chart Display Area */}
          <div className="p-4 sm:p-6 flex-1 flex flex-col justify-between">
            <div className="h-64 sm:h-72 w-full flex items-end justify-center relative pt-6 pb-2">
              {/* Y-axis guide lines & labels */}
              <div className="absolute left-0 inset-y-6 flex flex-col justify-between text-[11px] font-mono text-gray-400 select-none">
                <span>8k</span>
                <span>6k</span>
                <span>4k</span>
                <span>2k</span>
                <span>0k</span>
              </div>

              {/* Horizontal grid lines */}
              <div className="absolute left-7 right-0 inset-y-6 flex flex-col justify-between pointer-events-none">
                <div className="border-b border-gray-100 w-full" />
                <div className="border-b border-gray-100 w-full" />
                <div className="border-b border-gray-100 w-full" />
                <div className="border-b border-gray-100 w-full" />
                <div className="border-b border-gray-200 w-full" />
              </div>

              {/* The Monaco POS Stacked Bar (matching exact green/dark/blue visual) */}
              <div className="relative z-10 w-44 sm:w-60 h-[72%] flex flex-col justify-end group cursor-pointer transition-all hover:scale-[1.02]">
                {/* Impuesto (Tax - blue top segment) */}
                <div
                  style={{ height: "4%" }}
                  className="w-full bg-[#3498db] rounded-t-sm transition-all relative group-hover:brightness-110"
                  title={`${t.tax}: $${(stats.estimatedTax / 100).toFixed(2)}`}
                />
                {/* Descuento (Discount - dark slate segment) */}
                <div
                  style={{ height: "2.5%" }}
                  className="w-full bg-[#1e272e] transition-all relative group-hover:brightness-125"
                  title={`${t.discount}: $${(stats.estimatedDiscount / 100).toFixed(2)}`}
                />
                {/* Ventas (Sales - bright green gradient) */}
                <div
                  style={{ height: "93.5%" }}
                  className="w-full bg-gradient-to-t from-[#27ae60] to-[#2ecc71] transition-all relative shadow-sm group-hover:brightness-105"
                  title={`${t.revenue}: $${(stats.totalRevenue / 100).toFixed(2)}`}
                />

                {/* Hover Tooltip */}
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[11px] py-1 px-2.5 rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-20">
                  <span>Sales: ${(stats.totalRevenue / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* X-axis month tag */}
            <div className="text-center text-xs font-mono text-gray-500 mt-2">
              {selectedMonth}
            </div>

            {/* Monaco POS Chart Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-gray-100 text-xs text-gray-600 font-sans">
              <div className="flex items-center gap-1.5">
                <span className="size-3 bg-[#3498db] rounded-xs inline-block" />
                <span>{t.tax}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-3 bg-[#1e272e] rounded-xs inline-block" />
                <span>{t.discount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-3 bg-[#2ecc71] rounded-xs inline-block" />
                <span>{t.revenue}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: "Top Productos" widget */}
        <div className="lg:col-span-4 bg-white rounded-sm shadow-sm border border-gray-200 overflow-hidden flex flex-col">
          <div className="border-t-2 border-[#e67e22] px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">
              {t.topProductsTitle} ({selectedMonth})
            </h3>
            <FaArrowTrendUp size={13} className="text-[#27ae60]" />
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between">
            <div className="divide-y divide-gray-100">
              {topProducts.map((prod, idx) => (
                <div key={idx} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="size-5 rounded-full bg-gray-100 text-gray-600 text-[10px] font-bold flex items-center justify-center font-mono shrink-0">
                      #{idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-gray-800 truncate" title={prod.name}>
                        {prod.name}
                      </p>
                      <p className="text-[11px] text-gray-400 font-mono">
                        {prod.count} {t.unitsSold}
                      </p>
                    </div>
                  </div>

                  <span className="text-xs font-bold font-mono text-[#27ae60] shrink-0">
                    ${(prod.revenue / 100).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => onSelectTab("products")}
              className="mt-4 w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-medium rounded border border-gray-200 transition-colors cursor-pointer text-center"
            >
              {t.products} Catalog &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Classic Monaco POS Footer */}
      <div className="pt-4 pb-2 border-t border-gray-300 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 font-sans gap-2">
        <p>{t.footerRights}</p>
        <p className="font-mono">{t.version}</p>
      </div>
    </div>
  );
}
