"use client";

import { FaFolderOpen, FaBolt, FaCircleDot, FaArrowsSplitUpAndLeft, FaSliders, FaShieldHeart } from "react-icons/fa6";
import { MonacoTranslations } from "@/data/monacoTranslations";
import { electricCategories } from "@/data/products";

interface MonacoCategoriesViewProps {
  t: MonacoTranslations;
  onSelectCategory?: (category: string) => void;
}

export function MonacoCategoriesView({ t, onSelectCategory }: MonacoCategoriesViewProps) {
  const allCategories = [
    {
      id: "eskate",
      name: "Deskorolki Elektryczne (E-Skate)",
      icon: FaBolt,
      color: "bg-[#3498db]",
      count: 6,
      desc: "Deski z silnikami pasowymi i hub-motorami",
    },
    {
      id: "hoverboard",
      name: "Hoverboardy & Segway",
      icon: FaCircleDot,
      color: "bg-[#9b59b6]",
      count: 5,
      desc: "Samo-balansujące hoverboardy z głośnikami Bluetooth",
    },
    {
      id: "euc",
      name: "Monocykle Elektryczne (EUC)",
      icon: FaArrowsSplitUpAndLeft,
      color: "bg-[#e67e22]",
      count: 5,
      desc: "Monocykle terenowe z pneumatycznym zawieszeniem",
    },
    {
      id: "custom",
      name: "Custom Skate Builder",
      icon: FaSliders,
      color: "bg-[#e53935]",
      count: 12,
      desc: "Kustomizacja decków, kółek, trucków i śrub",
    },
    {
      id: "accessories",
      name: "Akcesoria & Ochrona",
      icon: FaShieldHeart,
      color: "bg-[#27ae60]",
      count: 8,
      desc: "Kaski, ochraniacze, ładowarki, zapasowe paski napędowe",
    },
  ];

  return (
    <div className="flex-1 bg-[#eceef1] p-4 sm:p-6 overflow-y-auto">
      <div className="flex items-center justify-between pb-3 mb-5 border-b border-gray-300">
        <div>
          <h1 className="text-xl sm:text-2xl font-normal text-gray-700 tracking-tight flex items-center gap-2">
            <FaFolderOpen size={20} className="text-[#3498db]" />
            <span>{t.categories}</span>
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            5 Main Store Departments
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {allCategories.map((cat) => {
          const Icon = cat.icon;
          return (
            <div
              key={cat.id}
              className="bg-white rounded border border-gray-200 p-5 shadow-xs flex flex-col justify-between hover:border-[#3498db] transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className={`size-10 rounded text-white flex items-center justify-center ${cat.color}`}>
                    <Icon size={18} />
                  </div>
                  <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    {cat.count} items
                  </span>
                </div>
                <h3 className="text-sm font-bold text-gray-800 mb-1">
                  {cat.name}
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  {cat.desc}
                </p>
              </div>

              <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
                <span className="text-emerald-700 font-semibold font-mono">Status: Active</span>
                <span className="text-[#3498db] font-bold">Monaco POS Cat</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
