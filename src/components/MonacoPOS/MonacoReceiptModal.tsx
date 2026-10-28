"use client";

import { FaPrint, FaXmark, FaCheck } from "react-icons/fa6";
import { MonacoTranslations } from "@/data/monacoTranslations";
import { OrderItem } from "./types";

export interface ReceiptData {
  orderId: string;
  storeName: string;
  cashierName: string;
  customerName: string;
  date: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  tendered: number;
  change: number;
}

interface MonacoReceiptModalProps {
  t: MonacoTranslations;
  receipt: ReceiptData | null;
  onClose: () => void;
}

export function MonacoReceiptModal({
  t,
  receipt,
  onClose,
}: MonacoReceiptModalProps) {
  if (!receipt) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none">
      <div className="bg-white rounded-lg shadow-2xl max-w-sm w-full overflow-hidden border border-gray-300 animate-fade-in flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="bg-[#e53935] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaCheck size={14} className="text-emerald-300" />
            <span className="font-bold text-xs uppercase tracking-wider">
              {t.printReceipt}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <FaXmark size={16} />
          </button>
        </div>

        {/* Printable Thermal Receipt Container */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs text-gray-800 bg-white">
          {/* Receipt Header */}
          <div className="text-center pb-4 border-b border-dashed border-gray-400">
            <h2 className="text-base font-extrabold uppercase tracking-widest text-gray-900">
              {receipt.storeName}
            </h2>
            <p className="text-[11px] text-gray-500">Monaco POS Terminal Register #1</p>
            <p className="text-[11px] text-gray-500">Av. Principal 404, Skate-OK Plaza</p>
            <p className="text-[11px] text-gray-500">Tel: +48 800-SKATE-OK</p>
            <p className="text-[11px] text-gray-500">NIP / Tax ID: PL-592819284</p>
          </div>

          {/* Meta Info */}
          <div className="py-3 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-gray-500">Receipt #:</span>
              <span className="font-bold">{receipt.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Date:</span>
              <span>{receipt.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Cashier:</span>
              <span>{receipt.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Customer:</span>
              <span className="font-semibold">{receipt.customerName}</span>
            </div>
          </div>

          {/* Items Table */}
          <div className="py-3 border-b border-dashed border-gray-400">
            <div className="flex justify-between font-bold text-[11px] pb-1 border-b border-gray-200 uppercase">
              <span className="w-1/2">Item</span>
              <span className="w-1/6 text-center">Qty</span>
              <span className="w-1/3 text-right">Price</span>
            </div>

            <div className="space-y-1.5 pt-2">
              {receipt.items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-[11px] leading-tight">
                  <span className="w-1/2 truncate font-medium text-gray-900" title={item.name}>
                    {item.name}
                  </span>
                  <span className="w-1/6 text-center text-gray-600">x{item.quantity}</span>
                  <span className="w-1/3 text-right font-bold">
                    ${((item.price * item.quantity) / 100).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="py-3 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
            <div className="flex justify-between text-gray-600">
              <span>{t.subtotal}:</span>
              <span>${(receipt.subtotal / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>{t.tax} (8%):</span>
              <span>${(receipt.tax / 100).toFixed(2)}</span>
            </div>
            {receipt.discount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>{t.discount}:</span>
                <span>-${(receipt.discount / 100).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-1 border-t border-gray-200">
              <span>{t.total}:</span>
              <span>${(receipt.total / 100).toFixed(2)}</span>
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="py-2.5 border-b border-dashed border-gray-400 space-y-1 text-[11px]">
            <div className="flex justify-between">
              <span className="text-gray-500">Method:</span>
              <span className="uppercase font-bold">{receipt.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Tendered:</span>
              <span>${(receipt.tendered / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900">
              <span>{t.changeDue}:</span>
              <span className="text-emerald-700 font-extrabold">
                ${(receipt.change / 100).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Receipt Footer with Barcode graphic */}
          <div className="text-center pt-4 space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-700">
              {t.thankYou}
            </p>
            <div className="flex flex-col items-center justify-center pt-2">
              <div className="h-8 w-44 bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 flex items-center justify-center">
                <span className="text-[9px] text-white tracking-widest font-mono">
                  ||||| |||| | ||||| |||
                </span>
              </div>
              <span className="text-[10px] text-gray-500 mt-1 font-mono tracking-widest">
                *{receipt.orderId}*
              </span>
            </div>
          </div>
        </div>

        {/* Modal Bottom Buttons */}
        <div className="bg-gray-100 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded transition-colors cursor-pointer"
          >
            {t.newSale} / {t.close}
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#27ae60] hover:bg-[#219150] text-white text-xs font-bold rounded shadow transition-colors cursor-pointer"
          >
            <FaPrint size={13} />
            <span>{t.printReceipt}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
