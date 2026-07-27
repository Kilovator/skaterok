"use client";

import { useLanguage } from "@/context/LanguageContext";
import { BiGlobe } from "react-icons/bi";
import { useState, useRef, useEffect } from "react";
import clsx from "clsx";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const [isPointerDown, setIsPointerDown] = useState(false);
  const [hasMoved, setHasMoved] = useState(false);
  const [dragOffset, setDragOffset] = useState<number | null>(null);

  const startXRef = useRef<number>(0);
  const currentOffsetRef = useRef<number>(0);
  const dragOffsetRef = useRef<number | null>(null);

  const SLIDE_DISTANCE = 56;

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsPointerDown(true);
    setHasMoved(false);
    startXRef.current = e.clientX;
    currentOffsetRef.current = language === "pl" ? 0 : SLIDE_DISTANCE;
    dragOffsetRef.current = currentOffsetRef.current;
    setDragOffset(currentOffsetRef.current);
  };

  useEffect(() => {
    if (!isPointerDown) return;

    const handleWindowPointerMove = (e: PointerEvent) => {
      const deltaX = e.clientX - startXRef.current;
      if (Math.abs(deltaX) > 3) {
        setHasMoved(true);
      }
      let newOffset = currentOffsetRef.current + deltaX;
      newOffset = Math.max(0, Math.min(SLIDE_DISTANCE, newOffset));
      dragOffsetRef.current = newOffset;
      setDragOffset(newOffset);
    };

    const handleWindowPointerUp = () => {
      if (dragOffsetRef.current !== null) {
        if (dragOffsetRef.current > SLIDE_DISTANCE / 2) {
          setLanguage("en");
        } else {
          setLanguage("pl");
        }
      }

      setIsPointerDown(false);
      setHasMoved(false);
      setDragOffset(null);
      dragOffsetRef.current = null;
    };

    window.addEventListener("pointermove", handleWindowPointerMove);
    window.addEventListener("pointerup", handleWindowPointerUp);
    window.addEventListener("pointercancel", handleWindowPointerUp);

    return () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
      window.removeEventListener("pointercancel", handleWindowPointerUp);
    };
  }, [isPointerDown, setLanguage]);

  const activeX = dragOffset !== null
    ? dragOffset
    : (language === "pl" ? 0 : SLIDE_DISTANCE);

  return (
    <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full p-1 pl-3 font-sans text-sm select-none shadow-sm">
      <BiGlobe className="text-white/70 w-5 h-5 shrink-0" aria-label="Language" />

      {/* Draggable & Clickable Track */}
      <div
        onPointerDown={handlePointerDown}
        className="relative flex items-center h-8 w-[116px] cursor-pointer touch-none select-none"
      >
        {/* Active Sliding Purple Pill */}
        <div
          className={clsx(
            "absolute top-0.5 left-0.5 h-7 w-[54px] rounded-full bg-brand-amethyst shadow-[0_2px_8px_rgba(123,114,181,0.3)] pointer-events-none",
            hasMoved ? "transition-none scale-105" : "transition-transform duration-300 ease-out"
          )}
          style={{
            transform: `translateX(${activeX}px)`,
          }}
        />

        {/* PL Option Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!hasMoved) {
              setLanguage("pl");
            }
          }}
          className={clsx(
            "relative z-10 w-[56px] h-full flex items-center justify-center font-bold uppercase tracking-wide text-xs transition-colors cursor-pointer min-w-[3.5rem]",
            language === "pl" ? "text-white font-bold" : "text-white/50 hover:text-white"
          )}
          title="Polski"
        >
          PL
        </button>

        {/* EN Option Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (!hasMoved) {
              setLanguage("en");
            }
          }}
          className={clsx(
            "relative z-10 w-[56px] h-full flex items-center justify-center font-bold uppercase tracking-wide text-xs transition-colors cursor-pointer min-w-[3.5rem]",
            language === "en" ? "text-white font-bold" : "text-white/50 hover:text-white"
          )}
          title="English"
        >
          EN
        </button>
      </div>
    </div>
  );
}
