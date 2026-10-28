"use client";

import { useState } from "react";
import { FaBarcode, FaMagnifyingGlass, FaPlus, FaPrint, FaTag } from "react-icons/fa6";
import { MonacoTranslations } from "@/data/monacoTranslations";
import { electricProducts, Product } from "@/data/products";

interface MonacoProductsViewProps {
  t: MonacoTranslations;
  onAddToCart?: (product: Product) => void;
}

export function MonacoProductsView({ t, onAddToCart }: MonacoProductsViewProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [barcodeModalProduct, setBarcodeModalProduct] = useState<Product | null>(null);

  const filtered = electricProducts.filter((p) => {
    const matchQuery =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === "all" || p.category === selectedCategory;
    return matchQuery && matchCat;
  });

  return (
    <div className="flex-1 bg-[#eceef1] p-4 sm:p-6 overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-5 border-b border-gray-300 gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-normal text-gray-700 tracking-tight flex items-center gap-2">
            <FaBarcode size={20} className="text-[#e67e22]" />
            <span>{t.products}</span>
          </h1>
          <p className="text-xs text-gray-500 font-mono mt-0.5">
            Total inventory: {electricProducts.length} items registered
          </p>
        </div>

        {/* Filter categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {["all", "eskate", "hoverboard", "euc"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors ${
                selectedCategory === cat
                  ? "bg-[#e67e22] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-3 rounded-sm border border-gray-200 mb-4 shadow-2xs flex items-center gap-3">
        <div className="relative flex-1">
          <FaMagnifyingGlass size={13} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by SKU or title..."
            className="w-full text-xs pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded focus:outline-none focus:border-[#e67e22]"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-sm border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#f7f8fa] text-gray-600 border-b border-gray-200 uppercase font-bold text-[11px]">
                <th className="py-3 px-4">Photo</th>
                <th className="py-3 px-4">SKU / Code</th>
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((prod) => (
                <tr key={prod.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-2.5 px-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={prod.image.src}
                      alt=""
                      className="size-10 object-contain rounded bg-gray-50 border border-gray-200"
                    />
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold text-gray-700">
                    {prod.id}
                  </td>
                  <td className="py-2.5 px-4 font-bold text-gray-800">
                    {prod.name}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-gray-100 text-gray-700 uppercase font-mono text-[10px]">
                      {prod.category}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono font-bold text-[#27ae60]">
                    ${(prod.price / 100).toFixed(2)}
                  </td>
                  <td className="py-2.5 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                      In Stock (99+)
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-right space-x-1.5">
                    <button
                      onClick={() => setBarcodeModalProduct(prod)}
                      title="Print Barcode Label"
                      className="p-1.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors cursor-pointer"
                    >
                      <FaBarcode size={12} />
                    </button>
                    {onAddToCart && (
                      <button
                        onClick={() => onAddToCart(prod)}
                        title="Add to POS Cart"
                        className="p-1.5 rounded bg-[#e67e22]/15 hover:bg-[#e67e22]/25 text-[#e67e22] transition-colors cursor-pointer"
                      >
                        <FaPlus size={12} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Barcode Print Modal */}
      {barcodeModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full text-center border border-gray-300 shadow-2xl animate-fade-in font-mono">
            <h3 className="font-bold text-sm text-gray-900 mb-1">
              {barcodeModalProduct.name}
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              SKU: {barcodeModalProduct.id} — Price: ${(barcodeModalProduct.price / 100).toFixed(2)}
            </p>

            <div className="py-4 px-6 bg-gray-50 border border-gray-200 rounded flex flex-col items-center justify-center my-4">
              <div className="h-14 w-52 bg-gradient-to-r from-black via-gray-800 to-black flex items-center justify-center">
                <span className="text-white text-xs tracking-widest">
                  ||||| ||| |||| | ||||| ||||
                </span>
              </div>
              <span className="text-xs text-gray-700 font-bold tracking-widest mt-2">
                *{barcodeModalProduct.id}*
              </span>
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <button
                onClick={() => setBarcodeModalProduct(null)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold rounded cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#e67e22] hover:bg-[#d35400] text-white text-xs font-bold rounded cursor-pointer"
              >
                <FaPrint size={12} />
                <span>Print Barcode</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
