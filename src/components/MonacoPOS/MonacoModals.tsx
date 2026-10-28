"use client";

import { useState } from "react";
import { FaDatabase, FaStore, FaKeyboard, FaGear, FaXmark, FaDownload, FaCheck } from "react-icons/fa6";
import { MonacoTranslations } from "@/data/monacoTranslations";
import { Order } from "./types";
import { electricProducts } from "@/data/products";

interface ModalsProps {
  t: MonacoTranslations;
  orders: Order[];
  isOpenBackup: boolean;
  onCloseBackup: () => void;
  isOpenStores: boolean;
  onCloseStores: () => void;
  isOpenShortcuts: boolean;
  onCloseShortcuts: () => void;
  isOpenSettings: boolean;
  onCloseSettings: () => void;
  storeName: string;
  onUpdateStoreName: (name: string) => void;
}

export function MonacoModals({
  t,
  orders,
  isOpenBackup,
  onCloseBackup,
  isOpenStores,
  onCloseStores,
  isOpenShortcuts,
  onCloseShortcuts,
  isOpenSettings,
  onCloseSettings,
  storeName,
  onUpdateStoreName,
}: ModalsProps) {
  const [tempStoreName, setTempStoreName] = useState(storeName);
  const [taxRate, setTaxRate] = useState("8.0");
  const [currency, setCurrency] = useState("$");
  const [selectedBranch, setSelectedBranch] = useState("Center Market Main Branch");

  // Download JSON backup of database
  const handleDownloadBackup = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      store: storeName,
      version: "1.2 Monaco POS",
      ordersCount: orders.length,
      orders,
      productsCount: electricProducts.length,
      products: electricProducts,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `monaco-pos-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    onCloseBackup();
  };

  return (
    <>
      {/* 1. Backup Modal */}
      {isOpenBackup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full border border-gray-300 shadow-2xl animate-fade-in font-sans text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
                <FaDatabase size={16} className="text-[#34495e]" />
                <span>{t.backup}</span>
              </div>
              <button onClick={onCloseBackup} className="text-gray-400 hover:text-gray-700">
                <FaXmark size={16} />
              </button>
            </div>

            <p className="text-gray-600 mb-4 leading-relaxed">
              Export all orders ({orders.length} records), products catalog, and customer history as an offline JSON snapshot.
            </p>

            <div className="bg-gray-50 p-3 rounded border border-gray-200 mb-4 font-mono text-[11px] text-gray-700 space-y-1">
              <p>Database: Neon PostgreSQL</p>
              <p>Records: {orders.length} orders / {electricProducts.length} items</p>
              <p>Format: JSON Standard Backup</p>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={onCloseBackup}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDownloadBackup}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#34495e] hover:bg-[#2c3e50] text-white rounded font-bold cursor-pointer"
              >
                <FaDownload size={12} />
                <span>Download Backup</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Stores / Outlets Modal */}
      {isOpenStores && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-lg p-6 max-w-md w-full border border-gray-300 shadow-2xl animate-fade-in font-sans text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
                <FaStore size={16} className="text-[#27ae60]" />
                <span>{t.stores}</span>
              </div>
              <button onClick={onCloseStores} className="text-gray-400 hover:text-gray-700">
                <FaXmark size={16} />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              {[
                { name: "Center Market (Flagship)", address: "Av. Principal 404, Plaza Central", status: "Active (Current)" },
                { name: "Skate-OK Downtown Skatepark", address: "Aleje Jerozolimskie 120, Skatepark Area", status: "Online" },
                { name: "Monaco Beach Kiosk", address: "Bulwar Nadmorski 15", status: "Seasonal" },
              ].map((b, i) => (
                <div
                  key={i}
                  onClick={() => {
                    setSelectedBranch(b.name);
                    onUpdateStoreName(b.name);
                    onCloseStores();
                  }}
                  className={`p-3 rounded border cursor-pointer transition-all flex items-center justify-between ${
                    storeName === b.name
                      ? "border-[#27ae60] bg-emerald-50/50"
                      : "border-gray-200 hover:border-gray-400 bg-white"
                  }`}
                >
                  <div>
                    <p className="font-bold text-gray-800">{b.name}</p>
                    <p className="text-[11px] text-gray-500">{b.address}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    {b.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={onCloseStores}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Keyboard Shortcuts Modal */}
      {isOpenShortcuts && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full border border-gray-300 shadow-2xl animate-fade-in font-sans text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
                <FaKeyboard size={16} className="text-[#3498db]" />
                <span>{t.shortcuts}</span>
              </div>
              <button onClick={onCloseShortcuts} className="text-gray-400 hover:text-gray-700">
                <FaXmark size={16} />
              </button>
            </div>

            <div className="space-y-2 mb-5 font-mono text-[11px]">
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-gray-600">{t.payCheckout} (F2):</span>
                <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded font-bold">F2</kbd>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-gray-600">Print Receipt:</span>
                <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded font-bold">Ctrl + P</kbd>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-gray-600">Cancel Modal:</span>
                <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded font-bold">Esc</kbd>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                <span className="text-gray-600">Submit Barcode:</span>
                <kbd className="px-2 py-0.5 bg-gray-100 border border-gray-300 rounded font-bold">Enter</kbd>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={onCloseShortcuts}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Settings Modal */}
      {isOpenSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full border border-gray-300 shadow-2xl animate-fade-in font-sans text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200 mb-4">
              <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
                <FaGear size={16} className="text-[#f39c12]" />
                <span>{t.settings}</span>
              </div>
              <button onClick={onCloseSettings} className="text-gray-400 hover:text-gray-700">
                <FaXmark size={16} />
              </button>
            </div>

            <div className="space-y-3 mb-5">
              <div>
                <label className="block text-gray-600 font-bold mb-1">Store / POS Title</label>
                <input
                  type="text"
                  value={tempStoreName}
                  onChange={(e) => setTempStoreName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-gray-800 font-medium"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-bold mb-1">Standard Tax Rate (%)</label>
                <input
                  type="number"
                  step="0.5"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-gray-800 font-mono"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-bold mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full border border-gray-300 rounded px-2.5 py-1.5 text-gray-800 font-mono"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={onCloseSettings}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateStoreName(tempStoreName);
                  onCloseSettings();
                }}
                className="px-4 py-2 bg-[#f39c12] hover:bg-[#e67e22] text-white rounded font-bold cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
