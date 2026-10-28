"use client";

import { useState } from "react";
import {
  FaMagnifyingGlass,
  FaFileInvoiceDollar,
  FaBox,
  FaTruckFast,
  FaPhone,
  FaLocationDot,
  FaPrint,
  FaEye,
  FaCheck,
  FaXmark,
  FaClock,
} from "react-icons/fa6";
import { MonacoTranslations } from "@/data/monacoTranslations";
import { Order, OrderItem } from "./types";
import { MonacoReceiptModal, ReceiptData } from "./MonacoReceiptModal";

interface MonacoOrdersTableProps {
  t: MonacoTranslations;
  orders: Order[];
  onUpdateStatus: (orderId: string, status: Order["status"]) => Promise<void>;
  isUpdatingId: string | null;
  newOrderIds: Set<string>;
  storeName: string;
  adminName: string;
}

export function MonacoOrdersTable({
  t,
  orders,
  onUpdateStatus,
  isUpdatingId,
  newOrderIds,
  storeName,
  adminName,
}: MonacoOrdersTableProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reprintReceipt, setReprintReceipt] = useState<ReceiptData | null>(null);

  // Status badge styling
  const statusColors: Record<Order["status"], { bg: string; text: string }> = {
    Processing: { bg: "bg-amber-100 border-amber-300 text-amber-800", text: "Processing" },
    Shipped: { bg: "bg-blue-100 border-blue-300 text-blue-800", text: "Shipped" },
    Delivered: { bg: "bg-emerald-100 border-emerald-300 text-emerald-800", text: "Delivered" },
    Cancelled: { bg: "bg-red-100 border-red-300 text-red-800", text: "Cancelled" },
  };

  // Filtered orders
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      order.id.toLowerCase().includes(query) ||
      (order.shippingDetails?.fullName && order.shippingDetails.fullName.toLowerCase().includes(query)) ||
      (order.shippingDetails?.phone && order.shippingDetails.phone.includes(query)) ||
      (order.shippingDetails?.city && order.shippingDetails.city.toLowerCase().includes(query));

    return matchesStatus && matchesSearch;
  });

  const handlePrintPastReceipt = (order: Order) => {
    const sub = order.subtotal || Math.round(order.total * 0.92);
    const tax = Math.round(sub * 0.08);

    setReprintReceipt({
      orderId: order.id,
      storeName,
      cashierName: adminName,
      customerName: order.shippingDetails?.fullName || order.userId || "Walk-in Customer",
      date: new Date(order.date).toLocaleString(),
      items: order.items,
      subtotal: sub,
      tax: tax,
      discount: 0,
      total: order.total,
      paymentMethod: order.paymentMethod,
      tendered: order.total,
      change: 0,
    });
  };

  return (
    <div className="flex-1 bg-[#eceef1] p-4 sm:p-6 overflow-y-auto">
      {/* Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-5 border-b border-gray-300 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-normal text-gray-700 tracking-tight flex items-center gap-2">
            <FaFileInvoiceDollar size={20} className="text-[#3498db]" />
            <span>{t.sales}</span>
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Total records: {orders.length} orders in database
          </p>
        </div>

        {/* Status quick tabs */}
        <div className="flex items-center gap-1 bg-white p-1 rounded border border-gray-300 shadow-2xs overflow-x-auto">
          {[
            { id: "all", label: t.all, count: orders.length },
            { id: "Processing", label: t.processing, count: orders.filter((o) => o.status === "Processing").length },
            { id: "Shipped", label: t.shipped, count: orders.filter((o) => o.status === "Shipped").length },
            { id: "Delivered", label: t.delivered, count: orders.filter((o) => o.status === "Delivered").length },
            { id: "Cancelled", label: t.cancelled, count: orders.filter((o) => o.status === "Cancelled").length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                statusFilter === tab.id
                  ? "bg-[#262a33] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                statusFilter === tab.id ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700"
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="bg-white p-3 rounded-sm border border-gray-200 mb-4 shadow-2xs flex items-center gap-3">
        <div className="relative flex-1">
          <FaMagnifyingGlass size={13} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.searchOrders}
            className="w-full text-xs pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:border-[#3498db]"
          />
        </div>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="text-xs text-gray-500 hover:text-gray-800 px-2 py-1"
          >
            Clear
          </button>
        )}
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f7f8fa] text-gray-600 border-b border-gray-200 uppercase tracking-wider font-bold text-[11px]">
                <th className="py-3 px-4">{t.orderId}</th>
                <th className="py-3 px-4">{t.customer}</th>
                <th className="py-3 px-4">{t.date}</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">{t.total}</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">{t.status}</th>
                <th className="py-3 px-4 text-right">{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-sans">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400 font-medium">
                    No orders found matching the filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isNew = newOrderIds.has(order.id);
                  const statusStyle = statusColors[order.status] || {
                    bg: "bg-gray-100 text-gray-700",
                    text: order.status,
                  };

                  return (
                    <tr
                      key={order.id}
                      className={`hover:bg-gray-50/80 transition-colors ${
                        isNew ? "bg-amber-50/60" : ""
                      }`}
                    >
                      {/* Order ID */}
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">
                        <div className="flex items-center gap-1.5">
                          {isNew && (
                            <span className="size-2 rounded-full bg-amber-500 animate-ping inline-block" />
                          )}
                          <span>{order.id}</span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-800">
                          {order.shippingDetails?.fullName || order.userId || t.walkInCustomer}
                        </div>
                        {order.shippingDetails?.phone && (
                          <div className="text-[11px] text-gray-500 font-mono flex items-center gap-1">
                            <FaPhone size={9} />
                            <span>{order.shippingDetails.phone}</span>
                          </div>
                        )}
                      </td>

                      {/* Date */}
                      <td className="py-3 px-4 font-mono text-gray-500 text-[11px] whitespace-nowrap">
                        {new Date(order.date).toLocaleDateString()} {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </td>

                      {/* Items count & preview */}
                      <td className="py-3 px-4">
                        <span className="font-bold text-gray-700 font-mono">
                          {Array.isArray(order.items) ? order.items.length : 0} items
                        </span>
                      </td>

                      {/* Total */}
                      <td className="py-3 px-4 font-mono font-extrabold text-sm text-[#27ae60]">
                        ${(order.total / 100).toFixed(2)}
                      </td>

                      {/* Payment Method */}
                      <td className="py-3 px-4 uppercase text-[11px] font-mono text-gray-600">
                        <span className="px-2 py-0.5 rounded bg-gray-100 border border-gray-200">
                          {order.paymentMethod}
                        </span>
                      </td>

                      {/* Status Selector Dropdown */}
                      <td className="py-3 px-4">
                        <select
                          value={order.status}
                          disabled={isUpdatingId === order.id}
                          onChange={(e) =>
                            onUpdateStatus(order.id, e.target.value as Order["status"])
                          }
                          className={`text-[11px] font-bold px-2 py-1 rounded border cursor-pointer focus:outline-none ${statusStyle.bg}`}
                        >
                          <option value="Processing">{t.processing}</option>
                          <option value="Shipped">{t.shipped}</option>
                          <option value="Delivered">{t.delivered}</option>
                          <option value="Cancelled">{t.cancelled}</option>
                        </select>
                      </td>

                      {/* Action buttons: View details & Reprint receipt */}
                      <td className="py-3 px-4 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          title={t.orderDetails}
                          className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                        >
                          <FaEye size={12} />
                        </button>
                        <button
                          onClick={() => handlePrintPastReceipt(order)}
                          title={t.printReceipt}
                          className="p-1.5 rounded bg-[#3498db]/10 hover:bg-[#3498db]/20 text-[#3498db] transition-colors cursor-pointer"
                        >
                          <FaPrint size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-2xl max-w-lg w-full overflow-hidden border border-gray-300 animate-fade-in flex flex-col max-h-[90vh]">
            <div className="bg-[#262a33] text-white px-5 py-3 flex items-center justify-between">
              <div>
                <span className="font-bold text-sm">
                  {t.orderDetails} — {selectedOrder.id}
                </span>
                <p className="text-[11px] text-gray-400 font-mono">
                  {new Date(selectedOrder.date).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-white cursor-pointer"
              >
                <FaXmark size={18} />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 font-sans text-xs text-gray-800">
              {/* Customer & Delivery address */}
              <div className="bg-gray-50 p-3.5 rounded border border-gray-200 space-y-1.5">
                <h4 className="font-bold text-gray-700 uppercase tracking-wide text-[11px]">
                  Customer & Shipping
                </h4>
                <p className="font-semibold text-gray-900">
                  {selectedOrder.shippingDetails?.fullName || selectedOrder.userId}
                </p>
                {selectedOrder.shippingDetails?.phone && (
                  <p className="text-gray-600 flex items-center gap-1.5">
                    <FaPhone size={10} /> {selectedOrder.shippingDetails.phone}
                  </p>
                )}
                {selectedOrder.shippingDetails?.address && (
                  <p className="text-gray-600 flex items-center gap-1.5">
                    <FaLocationDot size={10} /> {selectedOrder.shippingDetails.address}, {selectedOrder.shippingDetails.city} {selectedOrder.shippingDetails.postalCode}
                  </p>
                )}
                {selectedOrder.shippingDetails?.paczkomatId && (
                  <p className="text-emerald-700 font-bold flex items-center gap-1.5">
                    <FaBox size={10} /> Paczkomat: {selectedOrder.shippingDetails.paczkomatId}
                  </p>
                )}
                {selectedOrder.shippingDetails?.notes && (
                  <p className="text-gray-500 italic mt-1">
                    Notes: &ldquo;{selectedOrder.shippingDetails.notes}&rdquo;
                  </p>
                )}
              </div>

              {/* Items list */}
              <div>
                <h4 className="font-bold text-gray-700 uppercase tracking-wide text-[11px] mb-2">
                  Purchased Products
                </h4>
                <div className="divide-y divide-gray-100 border border-gray-200 rounded">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image?.src || "/images/boosted-stealth/2.png"}
                          alt=""
                          className="size-10 object-contain rounded bg-gray-50 border border-gray-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-gray-800 truncate">{item.name}</p>
                          <p className="text-[11px] text-gray-500 font-mono">
                            ${(item.price / 100).toFixed(2)} x {item.quantity}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono font-bold text-gray-800">
                        ${((item.price * item.quantity) / 100).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="bg-gray-50 p-3 rounded border border-gray-200 space-y-1 font-mono text-xs">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal:</span>
                  <span>${(selectedOrder.subtotal / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping:</span>
                  <span>${(selectedOrder.shippingFee / 100).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-[#27ae60] pt-1 border-t border-gray-200">
                  <span>Total Paid:</span>
                  <span>${(selectedOrder.total / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 px-5 py-3 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded cursor-pointer"
              >
                Cerrar / Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reprint Receipt Modal */}
      <MonacoReceiptModal
        t={t}
        receipt={reprintReceipt}
        onClose={() => setReprintReceipt(null)}
      />
    </div>
  );
}
