"use client";

import { useState } from "react";
import Link from "next/link";
import { FaLock, FaKey, FaShieldHalved, FaArrowLeft, FaCheck } from "react-icons/fa6";
import { MonacoTranslations } from "@/data/monacoTranslations";

interface MonacoAuthLockProps {
  t: MonacoTranslations;
  storeName: string;
  onAuthenticate: (pin: string) => Promise<boolean> | boolean;
  error: string | null;
}

export function MonacoAuthLock({
  t,
  storeName,
  onAuthenticate,
  error,
}: MonacoAuthLockProps) {
  const [pin, setPin] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin.trim() || isLoading) return;

    setIsLoading(true);
    setLocalError(null);
    try {
      const ok = await onAuthenticate(pin.trim());
      if (!ok) {
        setLocalError(t.invalidPin);
        setPin("");
      }
    } catch {
      setLocalError(t.invalidPin);
      setPin("");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeypadPress = (val: string) => {
    if (val === "C") {
      setPin("");
    } else if (val === "OK") {
      handleSubmit();
    } else {
      setPin((prev) => prev + val);
    }
  };

  return (
    <div className="min-h-screen bg-[#242a35] flex items-center justify-center p-4 select-none">
      <div className="max-w-sm w-full bg-white rounded-lg shadow-2xl overflow-hidden border border-gray-300 animate-fade-in">
        {/* Monaco POS Red Lock Header */}
        <div className="bg-[#e53935] text-white p-6 text-center">
          <div className="size-14 rounded-full bg-white/15 flex items-center justify-center mx-auto mb-3 shadow-inner">
            <FaLock size={24} className="text-white" />
          </div>
          <h2 className="text-xl font-extrabold uppercase tracking-wide">
            {storeName}
          </h2>
          <p className="text-xs text-white/80 font-mono mt-0.5">
            Monaco POS Register Lock
          </p>
        </div>

        {/* Form and Keypad */}
        <div className="p-6">
          {(error || localError) && (
            <div className="mb-4 p-2.5 rounded bg-red-50 border border-red-200 text-xs font-mono text-red-600 text-center font-bold">
              {error || localError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mb-4">
            <div className="relative mb-3">
              <FaKey size={13} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder={t.pinPlaceholder}
                autoFocus
                className="w-full text-center tracking-widest text-lg font-mono font-bold bg-gray-50 border border-gray-300 rounded pl-8 pr-3 py-2 text-gray-800 focus:outline-none focus:border-[#e53935]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#27ae60] hover:bg-[#219150] disabled:opacity-50 text-white text-xs font-extrabold rounded uppercase tracking-wider transition-colors cursor-pointer shadow flex items-center justify-center gap-2"
            >
              {isLoading ? "Weryfikacja..." : t.unlock}
            </button>
          </form>

          {/* Quick On-Screen Touch / Mouse Keypad */}
          <div className="grid grid-cols-3 gap-2 mb-4 font-mono">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "C", "0", "OK"].map((btn) => (
              <button
                key={btn}
                type="button"
                onClick={() => handleKeypadPress(btn)}
                className={`py-2 rounded text-sm font-bold transition-colors cursor-pointer ${
                  btn === "OK"
                    ? "bg-[#27ae60] text-white hover:bg-[#219150]"
                    : btn === "C"
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                }`}
              >
                {btn}
              </button>
            ))}
          </div>

          {/* PIN Hint */}
          <div className="text-center">
            <p className="text-[11px] text-gray-400 font-sans">
              Wprowadź swój PIN przydzielony przez administratora (Domyślny PIN administratora: 998877)
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-gray-100 text-center">
            <Link
              href="/"
              className="text-xs text-gray-500 hover:text-gray-800 font-sans flex items-center justify-center gap-1.5"
            >
              <FaArrowLeft size={10} />
              <span>Back to Store Home</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
