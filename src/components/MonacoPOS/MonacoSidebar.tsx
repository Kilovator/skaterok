"use client";

import {
  FaGaugeHigh,
  FaTv,
  FaBoxArchive,
  FaFolderTree,
  FaCartShopping,
  FaPlus,
  FaCreditCard,
  FaUsers,
  FaGear,
  FaChartSimple,
  FaChevronRight,
} from "react-icons/fa6";
import { MonacoTranslations } from "@/data/monacoTranslations";
import { MonacoTab } from "./types";

interface MonacoSidebarProps {
  t: MonacoTranslations;
  activeTab: MonacoTab;
  onSelectTab: (tab: MonacoTab) => void;
  isOpen: boolean;
  ordersBadge?: number;
}

export function MonacoSidebar({
  t,
  activeTab,
  onSelectTab,
  isOpen,
  ordersBadge = 0,
}: MonacoSidebarProps) {
  const menuItems = [
    { id: "dashboard" as MonacoTab, label: t.dashboard, icon: FaGaugeHigh },
    { id: "pos" as MonacoTab, label: t.pos, icon: FaTv, badge: "POS" },
    { id: "products" as MonacoTab, label: t.products, icon: FaBoxArchive, hasArrow: true },
    { id: "categories" as MonacoTab, label: t.categories, icon: FaFolderTree, hasArrow: true },
    { id: "sales" as MonacoTab, label: t.sales, icon: FaCartShopping, hasArrow: true, count: ordersBadge },
    { id: "purchases" as MonacoTab, label: t.purchases, icon: FaPlus, hasArrow: true },
    { id: "giftcards" as MonacoTab, label: t.giftCards, icon: FaCreditCard, hasArrow: true },
    { id: "people" as MonacoTab, label: t.people, icon: FaUsers, hasArrow: true },
    { id: "settings" as MonacoTab, label: t.settings, icon: FaGear, hasArrow: true },
    { id: "reports" as MonacoTab, label: t.reports, icon: FaChartSimple, hasArrow: true },
  ];

  return (
    <aside
      className={`bg-[#262a33] text-gray-300 transition-all duration-300 flex flex-col shrink-0 select-none border-r border-black/20 ${
        isOpen ? "w-56 md:w-60" : "w-16"
      }`}
    >
      <nav className="flex-1 py-2 overflow-y-auto overflow-x-hidden">
        <ul className="space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => onSelectTab(item.id)}
                  title={!isOpen ? item.label : undefined}
                  className={`w-full flex items-center justify-between px-4 py-3 text-xs md:text-sm transition-colors text-left cursor-pointer group ${
                    isActive
                      ? "bg-[#1b1e25] text-white font-bold border-l-4 border-[#e53935]"
                      : "hover:bg-[#20232c] hover:text-white text-gray-300 border-l-4 border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Icon
                      size={16}
                      className={`shrink-0 transition-transform ${
                        isActive ? "text-[#e53935]" : "text-gray-400 group-hover:text-white"
                      }`}
                    />
                    {isOpen && (
                      <span className="truncate tracking-wide">{item.label}</span>
                    )}
                  </div>

                  {isOpen && (
                    <div className="flex items-center gap-1.5 ml-2">
                      {item.count !== undefined && item.count > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#e53935] text-white">
                          {item.count}
                        </span>
                      )}
                      {item.hasArrow && (
                        <FaChevronRight
                          size={10}
                          className={`text-gray-500 group-hover:text-gray-300 transition-transform ${
                            isActive ? "rotate-90 text-[#e53935]" : ""
                          }`}
                        />
                      )}
                    </div>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sidebar footer badge */}
      {isOpen && (
        <div className="p-3 border-t border-white/5 bg-[#1f232b] text-[11px] text-gray-400 font-mono text-center">
          <p className="font-bold text-gray-300">Monaco POS</p>
          <p className="text-[10px] text-gray-500">v1.2 Release</p>
        </div>
      )}
    </aside>
  );
}
